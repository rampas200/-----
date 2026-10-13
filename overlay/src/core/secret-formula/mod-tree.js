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
