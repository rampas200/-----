// [AD Mod] 반물질 나무 데이터
// 반물질 나무는 게임 전체에 걸쳐 아주 천천히 자라는 나무다. 무한/영원/현실 어떤 리셋에도 초기화되지 않는다.
//  - 성장: 실제 시간 1초마다 성장도가 쌓인다 (모드 게임 속도와 무관, 오프라인 진행 포함).
//  - 레벨: 성장도가 다음 레벨 요구량에 닿으면 레벨이 오른다. 요구량은 레벨마다 ×1.1.
//  - 양분: 레벨 1마다 양분 1. 다섯 가지에 나눠 심는다 (가지치기로 언제든 되돌릴 수 있다).
//  - 물 주기: 잠깐 동안 성장 속도 ×2, 그 뒤 재사용 대기.
//  - 이정표: 정해진 레벨에 닿으면 열매가 열리고 작은 영구 보상을 준다.
// 효과는 보너스 효과 엔진(core/mod-rewards.js)의 채널로 적용된다. 성장량은 일부러 낮게 잡았다.

export const TREE_GROWTH = {
  // 초당 기본 성장도
  baseRate: 1,
  // 레벨 L → L+1 요구량 = levelCostBase × levelCostGrowth^L
  levelCostBase: 100,
  levelCostGrowth: 1.1,
  // 레벨 1마다 모든 반물질 차원 ×levelADMult
  levelADMult: 1.05,
  // 물 주기
  waterMult: 2,
  waterDurationMs: 60 * 1000,
  waterCooldownMs: 10 * 60 * 1000,
  // 진행 단계 하나마다 성장 속도 +stageBonus
  stageBonus: 0.25,
};

// 게임을 진행할수록 나무가 조금씩 빨리 자란다 (한 번 닿으면 영구)
export const TREE_STAGES = [
  { name: "첫 무한", isReached: () => PlayerProgress.infinityUnlocked() },
  { name: "무한 깨기", isReached: () => PlayerProgress.hasBroken() },
  { name: "첫 영원", isReached: () => PlayerProgress.eternityUnlocked() },
  { name: "시간 팽창", isReached: () => PlayerProgress.dilationUnlocked() },
  { name: "첫 현실", isReached: () => PlayerProgress.realityUnlocked() },
  { name: "천체", isReached: () => Teresa.isUnlocked },
];

const fixed = (channel, value) => ({ channel, value });
const pointsOf = id => ModTree.branchPoints(id);

// 가지: 양분 1개 = 가지 1단계. id는 세이브의 branches 배열 위치 + 1
export const TREE_BRANCHES = [
  {
    id: 1, key: "antimatter", name: "반물질 가지", color: "#22aa48",
    unlockText: "처음부터", isUnlocked: () => true,
    perPoint: "모든 반물질 차원 ×1.1",
    parts: [{ channel: "adMult", text: "모든 반물질 차원 ×1.1^(가지 단계)", effect: () => Decimal.pow(1.1, pointsOf(1)) }],
  },
  {
    id: 2, key: "infinity", name: "무한 가지", color: "#b67f33",
    unlockText: "첫 무한 후", isUnlocked: () => PlayerProgress.infinityUnlocked(),
    perPoint: "무한 포인트 ×1.05",
    parts: [{ channel: "ipMult", text: "무한 포인트 ×1.05^(가지 단계)", effect: () => Decimal.pow(1.05, pointsOf(2)) }],
  },
  {
    id: 3, key: "eternity", name: "영원 가지", color: "#b241e3",
    unlockText: "첫 영원 후", isUnlocked: () => PlayerProgress.eternityUnlocked(),
    perPoint: "영원 포인트 ×1.03",
    parts: [{ channel: "epMult", text: "영원 포인트 ×1.03^(가지 단계)", effect: () => Decimal.pow(1.03, pointsOf(3)) }],
  },
  {
    id: 4, key: "dilation", name: "팽창 가지", color: "#64dd17",
    unlockText: "시간 팽창 해금 후", isUnlocked: () => PlayerProgress.dilationUnlocked(),
    perPoint: "팽창 시간 ×1.03",
    parts: [{ channel: "dtMult", text: "팽창 시간 ×1.03^(가지 단계)", effect: () => Decimal.pow(1.03, pointsOf(4)) }],
  },
  {
    id: 5, key: "reality", name: "현실 가지", color: "#0b600e",
    unlockText: "첫 현실 후", isUnlocked: () => PlayerProgress.realityUnlocked(),
    perPoint: "현실 기계 +2%",
    parts: [{ channel: "rmMult", text: "현실 기계 ×(1+0.02×가지 단계)", effect: () => 1 + 0.02 * pointsOf(5) }],
  },
];

// 이정표 열매: 레벨에 닿으면 영구 보상. growthMult는 나무 자신의 성장 속도 배율 (엔진 채널이 아님)
export const TREE_MILESTONES = [
  { level: 5, text: "시작 반물질 ×10", parts: [fixed("startingAM", 10)] },
  { level: 10, text: "10개 구매 배율 +0.05", parts: [fixed("buy10Add", 0.05)] },
  { level: 15, text: "무한 횟수 획득 ×2", parts: [fixed("infinitiesMult", 2)] },
  { level: 20, text: "틱스피드 ×2", parts: [fixed("tickspeed", 2)] },
  { level: 25, text: "영원 횟수 획득 ×2", parts: [fixed("eternitiesMult", 2)] },
  { level: 30, text: "모든 무한 차원 ×10", parts: [fixed("idMult", 10)] },
  { level: 35, text: "모든 시간 차원 ×10", parts: [fixed("tdMult", 10)] },
  { level: 40, text: "타키온 입자 ×1.2", parts: [fixed("tpMult", 1.2)] },
  { level: 45, text: "글리프 레벨 +3", parts: [fixed("glyphLevel", 3)] },
  { level: 50, text: "나무 성장 속도 ×1.5", parts: [], growthMult: 1.5 },
  { level: 60, text: "블랙홀 위력 +5%", parts: [fixed("blackHolePower", 1.05)] },
  { level: 75, text: "현실 기계 ×1.5", parts: [fixed("rmMult", 1.5)] },
  { level: 100, text: "나무 성장 속도 ×2", parts: [], growthMult: 2 },
];

// 보너스 효과 엔진에 등록할 항목 (id 0 = 레벨 기본 효과, 1~5 = 가지, 1000+레벨 = 이정표)
export const modTreeRewards = [
  {
    id: 0,
    note: "나무 레벨",
    parts: [{
      channel: "adMult",
      text: `나무 레벨 1마다 모든 반물질 차원 ×${TREE_GROWTH.levelADMult}`,
      effect: () => Decimal.pow(TREE_GROWTH.levelADMult, ModTree.level),
    }],
  },
  ...TREE_BRANCHES.map(branch => ({ id: branch.id, note: branch.name, parts: branch.parts })),
  ...TREE_MILESTONES.map(milestone => ({
    id: 1000 + milestone.level, note: `레벨 ${milestone.level} 열매`, parts: milestone.parts,
  })),
];

// ---- 나무 업그레이드: 각 단계의 재화로 한 번 사면 영구 (어떤 리셋에도 남는다) ----
// 효과 종류
//  - growthMult: 성장 속도 × (숫자 또는 함수)
//  - waterDurationMs / waterCooldownMs / waterMult: 물 주기 지속 시간 +, 재사용 대기 -, 배율 +
//  - autoWater: 재사용 대기가 끝나면 자동으로 물을 준다
const logOf = value => new Decimal(value).max(1).log10();

export const TREE_UPGRADE_ROWS = [
  { name: "반물질", currency: "antimatter", currencyName: "반물질" },
  { name: "무한", currency: "infinityPoints", currencyName: "IP" },
  { name: "영원", currency: "eternityPoints", currencyName: "EP" },
  { name: "시간 팽창", currency: "dilatedTime", currencyName: "팽창 시간" },
  { name: "현실", currency: "realityMachines", currencyName: "현실 기계" },
];

export const TREE_UPGRADES = [
  { id: 1, row: 0, name: "비료", cost: 1e40, text: "성장 속도 ×1.2", growthMult: 1.2 },
  { id: 2, row: 0, name: "물뿌리개", cost: 1e100, text: "물 주기 지속 시간 +30초", waterDurationMs: 30000 },
  { id: 3, row: 0, name: "햇빛", cost: 1e250, text: "성장 속도 ×1.2", growthMult: 1.2 },
  { id: 4, row: 1, name: "무한 비료", cost: 1e10, text: "성장 속도 ×1.25", growthMult: 1.25 },
  { id: 5, row: 1, name: "빗물받이", cost: 1e50, text: "물 주기 재사용 대기 -3분", waterCooldownMs: 3 * 60000 },
  {
    id: 6, row: 1, name: "무한의 뿌리", cost: 1e150, text: "총 무한 횟수의 자릿수 1개마다 성장 속도 +5%",
    growthMult: () => 1 + logOf(Currency.infinitiesTotal.value) / 20,
  },
  { id: 7, row: 2, name: "영원 비료", cost: 1e5, text: "성장 속도 ×1.3", growthMult: 1.3 },
  { id: 8, row: 2, name: "깊은 물", cost: 1e30, text: "물 주기 배율 +1 (×2 → ×3)", waterMult: 1 },
  {
    id: 9, row: 2, name: "영원의 뿌리", cost: 1e100, text: "영원 횟수의 자릿수 1개마다 성장 속도 +5%",
    growthMult: () => 1 + logOf(Currency.eternities.value) / 20,
  },
  { id: 10, row: 3, name: "타키온 비료", cost: 1e10, text: "성장 속도 ×1.3", growthMult: 1.3 },
  { id: 11, row: 3, name: "느려진 물방울", cost: 1e25, text: "물 주기 지속 시간 +60초", waterDurationMs: 60000 },
  {
    id: 12, row: 3, name: "시간의 나이테", cost: 1e40, text: "나무 레벨 10마다 성장 속도 +5%",
    growthMult: () => 1 + 0.05 * Math.floor(ModTree.level / 10),
  },
  { id: 13, row: 4, name: "현실 비료", cost: 10, text: "성장 속도 ×1.5", growthMult: 1.5 },
  { id: 14, row: 4, name: "자동 급수", cost: 1e4, text: "재사용 대기가 끝나면 자동으로 물 주기", autoWater: true },
  {
    id: 15, row: 4, name: "세계수", cost: 1e8, text: "현실 횟수의 자릿수 1개마다 성장 속도 +10%",
    growthMult: () => 1 + Math.log10(player.realities + 1) / 10,
  },
];

// ---- 나무 도전과제: 조건을 달성하면 영구히 완료, 성장 속도 +bonus (도전과제끼리는 더한다) ----
const branchPointList = () => TREE_BRANCHES.map(branch => ModTree.branchPoints(branch.id));

export const TREE_QUESTS = [
  { id: 1, name: "새싹", text: "나무 레벨 1", bonus: 0.05, check: () => ModTree.level >= 1 },
  { id: 2, name: "어린 나무", text: "나무 레벨 10", bonus: 0.05, check: () => ModTree.level >= 10 },
  { id: 3, name: "청년 나무", text: "나무 레벨 25", bonus: 0.1, check: () => ModTree.level >= 25 },
  { id: 4, name: "큰 나무", text: "나무 레벨 50", bonus: 0.15, check: () => ModTree.level >= 50 },
  { id: 5, name: "고목", text: "나무 레벨 75", bonus: 0.2, check: () => ModTree.level >= 75 },
  {
    id: 6, name: "정원사", text: "물 주기 10번", bonus: 0.05,
    check: () => ModTree.waterCount >= 10, progress: () => `${formatInt(ModTree.waterCount)} / ${formatInt(10)}`,
  },
  {
    id: 7, name: "부지런한 정원사", text: "물 주기 100번", bonus: 0.1,
    check: () => ModTree.waterCount >= 100, progress: () => `${formatInt(ModTree.waterCount)} / ${formatInt(100)}`,
  },
  {
    id: 8, name: "다섯 갈래", text: "다섯 가지 모두에 양분 심기", bonus: 0.1,
    check: () => branchPointList().every(points => points > 0),
  },
  {
    id: 9, name: "한 우물", text: "한 가지에 양분 25개", bonus: 0.1,
    check: () => Math.max(...branchPointList()) >= 25,
  },
  {
    id: 10, name: "열매 수확", text: "열매 5개", bonus: 0.1,
    check: () => TREE_MILESTONES.countWhere(m => ModTree.level >= m.level) >= 5,
  },
  {
    id: 11, name: "무한의 정원", text: `총 무한 ${1000}회`, bonus: 0.05,
    check: () => Currency.infinitiesTotal.gte(1000),
  },
  {
    id: 12, name: "영원의 정원", text: `영원 ${1000}회`, bonus: 0.1,
    check: () => Currency.eternities.gte(1000),
  },
  {
    id: 13, name: "도전하는 정원", text: "일반 챌린지 12개 모두 완료", bonus: 0.05,
    check: () => NormalChallenges.all.every(challenge => challenge.isCompleted),
  },
  {
    id: 14, name: "무한 챌린지 정원", text: "무한 챌린지 8개 모두 완료", bonus: 0.05,
    check: () => InfinityChallenges.completed.length >= 8,
  },
  {
    id: 15, name: "영원 챌린지 정원", text: "영원 챌린지 총 30회 완료", bonus: 0.1,
    check: () => EternityChallenges.completions >= 30,
  },
  { id: 16, name: "팽창된 정원", text: "시간 팽창 해금", bonus: 0.1, check: () => PlayerProgress.dilationUnlocked() },
  { id: 17, name: "현실의 정원", text: "현실 1회", bonus: 0.1, check: () => player.realities >= 1 },
  {
    id: 18, name: "업그레이드 수집가", text: "나무 업그레이드 8개", bonus: 0.1,
    check: () => ModTree.boughtUpgradeCount >= 8,
    progress: () => `${formatInt(ModTree.boughtUpgradeCount)} / ${formatInt(8)}`,
  },
  {
    id: 19, name: "완성된 정원", text: "나무 업그레이드 15개 모두", bonus: 0.2,
    check: () => ModTree.boughtUpgradeCount >= 15,
    progress: () => `${formatInt(ModTree.boughtUpgradeCount)} / ${formatInt(15)}`,
  },
  {
    id: 20, name: "오래된 정원", text: "지금까지 자란 양 1,000,000", bonus: 0.15,
    check: () => ModTree.totalGrowth >= 1e6,
    progress: () => `${format(ModTree.totalGrowth, 2, 0)} / ${format(1e6, 2, 0)}`,
  },
];
