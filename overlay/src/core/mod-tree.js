// [AD Mod] 반물질 나무: 게임 전체에 걸쳐 천천히 자라는 나무
// 상태는 세이브의 player.adMod.tree에 있고, 어떤 리셋에도 초기화되지 않는다 (하드 리셋만 초기화).
// 효과 계산은 ModRewards 엔진이 맡고, 여기서는 성장, 레벨, 양분 배분, 물 주기를 처리한다.

import { TREE_BRANCHES, TREE_GROWTH, TREE_MILESTONES, TREE_STAGES } from "./secret-formula/mod-tree";

const BRANCH_COUNT = TREE_BRANCHES.length;

function defaultTree() {
  return { growth: 0, level: 0, totalGrowth: 0, branches: Array(BRANCH_COUNT).fill(0), waterUntil: 0, waterReadyAt: 0 };
}

// 예전 세이브에 나무가 없거나 일부 값이 빠져 있어도 동작하도록 채워 넣는다
function tree() {
  if (player.adMod === undefined) player.adMod = { upgradeBits: 0, achTimer: 0 };
  const state = player.adMod.tree;
  if (state === undefined || state === null) {
    player.adMod.tree = defaultTree();
    return player.adMod.tree;
  }
  if (!Array.isArray(state.branches)) state.branches = [];
  while (state.branches.length < BRANCH_COUNT) state.branches.push(0);
  for (const key of ["growth", "level", "totalGrowth", "waterUntil", "waterReadyAt"]) {
    if (!Number.isFinite(state[key])) state[key] = 0;
  }
  return state;
}

export const ModTree = {
  branches: TREE_BRANCHES,
  milestones: TREE_MILESTONES,
  stages: TREE_STAGES,
  growthConfig: TREE_GROWTH,

  // 꺼져 있거나 스피드런 중이면 자라지 않고 효과도 없다
  get isEnabled() {
    return ADMod.modTree && !ADMod.isSuspended;
  },

  get level() {
    return tree().level;
  },

  get growth() {
    return tree().growth;
  },

  get totalGrowth() {
    return tree().totalGrowth;
  },

  // 레벨 L → L+1에 필요한 성장도
  levelCost(level = this.level) {
    return TREE_GROWTH.levelCostBase * Math.pow(TREE_GROWTH.levelCostGrowth, level);
  },

  get reachedStages() {
    return TREE_STAGES.countWhere(stage => stage.isReached());
  },

  get isWatered() {
    return Date.now() < tree().waterUntil;
  },

  // 물 주기를 다시 할 수 있을 때까지 남은 시간 (ms)
  get waterCooldown() {
    return Math.max(tree().waterReadyAt - Date.now(), 0);
  },

  get waterTimeLeft() {
    return Math.max(tree().waterUntil - Date.now(), 0);
  },

  // 물 주기를 뺀 성장 속도 배율 (진행 단계, 이정표)
  get baseRateMultiplier() {
    let mult = 1 + TREE_GROWTH.stageBonus * this.reachedStages;
    for (const milestone of TREE_MILESTONES) {
      if (milestone.growthMult !== undefined && this.level >= milestone.level) mult *= milestone.growthMult;
    }
    return mult;
  },

  // 초당 성장도
  get growthPerSecond() {
    if (!this.isEnabled) return 0;
    return TREE_GROWTH.baseRate * this.baseRateMultiplier * (this.isWatered ? TREE_GROWTH.waterMult : 1);
  },

  // 다음 레벨까지 남은 시간 (초, 지금 속도 기준)
  get secondsToNextLevel() {
    const rate = this.growthPerSecond;
    return rate === 0 ? Infinity : (this.levelCost() - this.growth) / rate;
  },

  // ---- 양분과 가지 ----

  branchPoints(id) {
    return tree().branches[id - 1] ?? 0;
  },

  get spentPoints() {
    return tree().branches.reduce((sum, points) => sum + points, 0);
  },

  get availablePoints() {
    return Math.max(this.level - this.spentPoints, 0);
  },

  branchById(id) {
    return TREE_BRANCHES.find(branch => branch.id === id);
  },

  canInvest(id) {
    return this.isEnabled && this.availablePoints > 0 && this.branchById(id).isUnlocked();
  },

  // 양분 amount개를 가지에 심는다 (남은 양분만큼만)
  invest(id, amount = 1) {
    if (!this.canInvest(id)) return false;
    const count = Math.min(amount, this.availablePoints);
    tree().branches[id - 1] += count;
    ModRewards.invalidate();
    return true;
  },

  // 가지치기: 심은 양분을 모두 돌려받는다
  respec() {
    tree().branches = Array(BRANCH_COUNT).fill(0);
    ModRewards.invalidate();
  },

  // ---- 물 주기 ----

  get canWater() {
    return this.isEnabled && this.waterCooldown === 0;
  },

  water() {
    if (!this.canWater) return false;
    const now = Date.now();
    tree().waterUntil = now + TREE_GROWTH.waterDurationMs;
    tree().waterReadyAt = now + TREE_GROWTH.waterCooldownMs;
    return true;
  },

  // ---- 효과 (보너스 효과 엔진이 묻는다) ----

  isRewardActive(id) {
    if (id === 0) return this.level > 0;
    if (id < 1000) return this.branchPoints(id) > 0 && this.branchById(id).isUnlocked();
    return this.level >= id - 1000;
  },

  rewardTitle(id) {
    if (id === 0) return "반물질 나무 레벨";
    if (id < 1000) return this.branchById(id).name;
    return `반물질 나무 레벨 ${id - 1000} 열매`;
  },

  // ---- 성장 (게임 루프가 실제 시간 ms로 부른다) ----

  tick(realDiff) {
    if (!this.isEnabled || !(realDiff > 0)) return;
    const state = tree();
    const gained = this.growthPerSecond * realDiff / 1000;
    state.growth += gained;
    state.totalGrowth += gained;
    const before = state.level;
    // 오프라인 진행처럼 한 번에 많이 자라도 한 틱에 여러 레벨을 올린다
    while (state.growth >= this.levelCost(state.level)) {
      state.growth -= this.levelCost(state.level);
      state.level++;
    }
    if (state.level > before) {
      ModRewards.invalidate();
      const fruit = TREE_MILESTONES.filter(m => m.level > before && m.level <= state.level);
      const fruitText = fruit.length > 0 ? ` 열매: ${fruit.map(m => m.text).join(", ")}` : "";
      GameUI.notify.success(`반물질 나무가 레벨 ${formatInt(state.level)}로 자랐습니다.${fruitText}`, 6000);
    }
  },

  // 화면 표시용 요약
  get state() {
    return tree();
  },
};
