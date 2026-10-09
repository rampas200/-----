// [AD Mod] 모드 시간 연구: 원래 트리 아래에 붙는 5갈래 × 10단계 연구 + 업적 자동 해금 연구
// 연구 자체는 원래 시간 연구 데이터베이스에 들어 있다 (secret-formula/eternity/time-studies/mod-time-studies.js).
// 여기서는 트리 화면 배치, 연결선, Shift+클릭 연속 구매처럼 원래 코드가 행 번호(id/10)에 기대는 부분과
// 업적 자동 해금 타이머를 맡는다.

import {
  MOD_ACHIEVEMENT_STUDIES,
  MOD_STUDY_BRANCHES,
  modTimeStudies
} from "./secret-formula/eternity/time-studies/mod-time-studies";

const DEPTH = 10;
const modStudyIds = new Set(modTimeStudies.map(config => config.id));

// 연구의 바로 앞 단계 (모드 연구가 아니면 원래 연구 id, 조건이면 함수)
function previousOf(id) {
  return TimeStudy(id).config.requirement[0];
}

export const ModTimeStudies = {
  branches: MOD_STUDY_BRANCHES,
  depth: DEPTH,
  achievementStudyIds: MOD_ACHIEVEMENT_STUDIES.map(study => study.id),

  // 꺼져 있거나 스피드런 중이면 트리에서 숨기고 살 수도 없다
  get isEnabled() {
    return ADMod.modStudies && !ADMod.isSuspended;
  },

  isModStudy(id) {
    return modStudyIds.has(id);
  },

  // 트리의 한 줄: 갈래 순서대로 같은 단계의 연구 id
  rowIds(depth) {
    return MOD_STUDY_BRANCHES.map(branch => branch.firstId + depth);
  },

  // 모드 연구끼리 잇는 연결선 (화면에 보일 때만 만든다. 없는 연구를 이으면 배치 계산이 깨진다)
  connections() {
    if (!this.isEnabled) return [];
    return modTimeStudies
      .filter(config => this.isModStudy(config.requirement[0]))
      .map(config => new TimeStudyConnection(TimeStudy(config.requirement[0]), TimeStudy(config.id)));
  },

  // Shift+클릭: 앞 단계를 거슬러 올라가 시작 조건이 되는 원래 연구까지 산 다음, 맨 앞부터 누른 연구까지 차례로 산다
  purchaseChain(id) {
    const chain = [];
    let current = id;
    while (this.isModStudy(current)) {
      chain.unshift(current);
      current = previousOf(current);
    }
    const before = typeof current === "number" ? buyStudiesUntil(current) : [];
    TimeStudyTree.commitToGameState([...before, ...chain]);
  },

  // ---- 업적 자동 해금 ----

  // 산 업적 자동 해금 연구 중 가장 짧은 주기 (ms). 하나도 없으면 0
  get achievementPeriod() {
    if (!ModRewards.isSourceEnabled("study")) return 0;
    const periods = MOD_ACHIEVEMENT_STUDIES
      .filter(study => TimeStudy(study.id).isBought)
      .map(study => study.periodMinutes * 60000);
    return periods.length === 0 ? 0 : Math.min(...periods);
  },

  get lockedAchievementCount() {
    return Achievements.preReality.countWhere(achievement => !achievement.isUnlocked);
  },

  // 게임 시간 diff(ms)만큼 타이머를 돌려 주기마다 업적을 하나씩 해금한다
  achievementTick(diff) {
    const period = this.achievementPeriod;
    if (period === 0 || player.adMod === undefined) return;
    const locked = Achievements.preReality.filter(achievement => !achievement.isUnlocked);
    if (locked.length === 0) {
      player.adMod.achTimer = 0;
      return;
    }
    player.adMod.achTimer = (player.adMod.achTimer ?? 0) + diff;
    for (const achievement of locked) {
      if (player.adMod.achTimer < period) break;
      player.adMod.achTimer -= period;
      achievement.unlock(true);
      player.reality.gainedAutoAchievements = true;
    }
    // 오래 자리를 비워도 남는 시간이 쌓이지 않게 한 주기로 자른다
    player.adMod.achTimer = Math.min(player.adMod.achTimer, period);
  },
};
