// [AD Mod] 모드 시간 연구 데이터
// 원래 시간 연구 트리 아래에 4갈래(반물질, 무한 차원, EP, 복제자) × 10단계 연구를 붙인다.
// 원래 연구와 같은 데이터베이스(normalTimeStudies)에 들어가므로 구매, 리스펙, 트리 내보내기/가져오기,
// 오토메이터가 그대로 동작한다. id는 241~280 (원래 연구와 겹치지 않고, 300 초과는 트라이어드라서 피한다).
//
// 갈래마다 첫 연구는 관련된 원래 연구가 있어야 살 수 있고, 그다음부터는 바로 위 연구가 필요하다.
// 효과는 보너스 효과 엔진(core/mod-rewards.js)의 채널로 적용된다. 공식은 원시 상태값만 읽는다.

// 단계별 비용 (TT)
const COSTS = [4, 6, 9, 13, 20, 30, 45, 70, 110, 170];

export const MOD_STUDY_BRANCHES = [
  { key: "antimatter", name: "반물질", firstId: 241, rootStudy: 71, colorClass: "o-time-study-antimatter-dim" },
  { key: "infinity", name: "무한 차원", firstId: 251, rootStudy: 72, colorClass: "o-time-study-infinity-dim" },
  { key: "eternity", name: "EP", firstId: 261, rootStudy: 61, colorClass: "o-time-study-time-dim" },
  { key: "replicanti", name: "복제자", firstId: 271, rootStudy: 22, colorClass: "o-time-study-passive" },
];

const fixed = (channel, value) => ({ channel, value });
const dyn = (channel, effect) => ({ channel, effect });
const dynAD = (tiers, effect) => ({ channel: "adTierMult", tiers, effect });
const fixedID = (tiers, value) => ({ channel: "idTierMult", tiers, value });
const dynID = (tiers, effect) => ({ channel: "idTierMult", tiers, effect });

const unlockedInfinityDimensions = () => Array.range(1, 8).countWhere(tier => InfinityDimension(tier).isUnlocked);

// 갈래별 10단계: [이름, 효과 설명, 효과]
const BRANCH_STUDIES = {
  antimatter: [
    ["반물질 공명", "보유한 반물질에 비례해 모든 반물질 차원 강화 (반물질^0.002)",
      dyn("adMult", () => Currency.antimatter.value.pow(0.002))],
    ["부스트 증폭", "차원 부스트 배율 ×1.25", fixed("dimBoostPower", 1.25)],
    ["은하 응축", "반물질 갤럭시 효과 +5%", fixed("galaxyStrength", 1.05)],
    ["8차원 집중", "8번째 반물질 차원 ×(8번째 차원 구매 수+1)²",
      dynAD([8], () => Decimal.pow(AntimatterDimension(8).bought + 1, 2))],
    ["1차원 집중", "1번째 반물질 차원 ×(반물질 갤럭시 수+1)³",
      dynAD([1], () => Decimal.pow(player.galaxies + 1, 3))],
    ["10개 묶음 강화", "10개 구매 배율 +0.5", fixed("buy10Add", 0.5)],
    ["틱스피드 공명", "틱스피드 ×(반물질 갤럭시 수+1)²",
      dyn("tickspeed", () => Decimal.pow(player.galaxies + 1, 2))],
    ["은하 확장", "먼 갤럭시 비용 증가가 50개 늦게 시작", fixed("galaxyScalingDelay", 50)],
    ["희생 증폭", "차원 희생 지수 +15%", fixed("sacrificePower", 1.15)],
    ["반물질 정점", "이번 영원 시간 1분마다 모든 반물질 차원 ×1e5 (60분까지)",
      dyn("adMult", () => Decimal.pow10(Math.min(Time.thisEternity.totalMinutes, 60) * 5))],
  ],
  infinity: [
    ["무한 차원 공명", "보유한 IP에 비례해 무한 차원 강화 (IP^0.002)",
      dyn("idMult", () => Currency.infinityPoints.value.pow(0.002))],
    ["첫 무한 차원 강화", "1번째 무한 차원 ×(영원 횟수+1)²",
      dynID([1], () => Currency.eternities.value.plus(1).pow(2))],
    ["무한 파워 변환", "무한 파워 변환 지수 +0.25 (무한 파워가 반물질 차원을 더 강하게 만든다)",
      fixed("idConversion", 0.25)],
    ["8번째 무한 차원 강화", "8번째 무한 차원 ×1e10", fixedID([8], 1e10)],
    ["무한 차원 연쇄", "2~7번째 무한 차원 ×(해금한 무한 차원 수)⁴",
      dynID([2, 3, 4, 5, 6, 7], () => Math.pow(unlockedInfinityDimensions(), 4))],
    ["IP 공명", "무한 파워에 비례해 IP 증가 (무한 파워^0.0005)",
      dyn("ipMult", () => Currency.infinityPower.value.pow(0.0005))],
    ["무한 차원 가속", "이번 무한 시간 1분마다 무한 차원 ×100 (30분까지)",
      dyn("idMult", () => Decimal.pow10(Math.min(Time.thisInfinity.totalMinutes, 30) * 2))],
    ["무한 파워 변환 II", "무한 파워 변환 지수 +0.5", fixed("idConversion", 0.5)],
    ["무한 횟수 공명", "총 무한 횟수의 제곱근만큼 무한 차원 강화",
      dyn("idMult", () => Currency.infinitiesTotal.value.plus(1).pow(0.5))],
    ["무한 차원 정점", "영원 챌린지 총 완료 횟수 1회당 무한 차원 ×10",
      dyn("idMult", () => Decimal.pow10(EternityChallenges.completions))],
  ],
  eternity: [
    ["영원 가속", "영원 횟수의 자릿수만큼 EP +×1",
      dyn("epMult", () => 1 + Currency.eternities.value.plus(1).log10())],
    ["출발선", "영원을 IP 1e50 이상으로 시작", fixed("startingIP", 1e50)],
    ["영원 증폭", "영원 횟수 획득 ×5", fixed("eternitiesMult", 5)],
    ["시간 차원 공명", "보유한 EP에 비례해 시간 차원 강화 (EP^0.01)",
      dyn("tdMult", () => Currency.eternityPoints.value.pow(0.01))],
    ["시간 정리 생성", "시간 정리(TT) +0.1/초", fixed("ttPerSecond", 0.1)],
    ["정리의 힘", "보유한 시간 정리(TT)의 제곱근만큼 EP 증가",
      dyn("epMult", () => Currency.timeTheorems.value.plus(1).pow(0.5))],
    ["영원의 샘 II", "매초 지금 영원하면 얻을 EP의 0.5% 자동 획득", fixed("passiveEP", 0.005)],
    ["타키온 공명", "타키온 입자 ×2", fixed("tpMult", 2)],
    ["시간 차원 정점", "이번 영원 시간 1분마다 시간 차원 ×10 (60분까지)",
      dyn("tdMult", () => Decimal.pow10(Math.min(Time.thisEternity.totalMinutes, 60)))],
    ["EP 정점", "EP 자릿수에 비례해 EP 증가 ((자릿수/50+1)³)",
      dyn("epMult", () => Math.pow(Currency.eternityPoints.value.plus(1).log10() / 50 + 1, 3))],
  ],
  replicanti: [
    ["복제 가속", "레플리칸티 속도 ×2", fixed("replicantiSpeed", 2)],
    ["복제 은하 확장", "레플리칸티 갤럭시 최대치 +5", fixed("replicantiGalaxyMax", 5)],
    ["복제 무한 차원", "레플리칸티 양에 비례해 무한 차원 강화 (레플리칸티^0.02)",
      dyn("idMult", () => Replicanti.amount.pow(0.02))],
    ["복제 은하 강화", "레플리칸티 갤럭시 효과 +10%", fixed("replicantiGalaxyPower", 0.1)],
    ["복제 IP", "IP ×(레플리칸티 갤럭시 수+1)²",
      dyn("ipMult", () => Math.pow(Replicanti.galaxies.total + 1, 2))],
    ["복제 가속 II", "레플리칸티 갤럭시 10개마다 레플리칸티 속도 +×1",
      dyn("replicantiSpeed", () => 1 + Replicanti.galaxies.total / 10)],
    ["복제 은하 확장 II", "레플리칸티 갤럭시 최대치 +10", fixed("replicantiGalaxyMax", 10)],
    ["복제 시간 차원", "시간 차원 ×(레플리칸티 갤럭시 수+1)^1.5",
      dyn("tdMult", () => Math.pow(Replicanti.galaxies.total + 1, 1.5))],
    ["복제 은하 강화 II", "레플리칸티 갤럭시 효과 +25%", fixed("replicantiGalaxyPower", 0.25)],
    ["복제 정점", "레플리칸티 속도 ×20", fixed("replicantiSpeed", 20)],
  ],
};

function makeStudy(branch, depth, [name, text, part]) {
  const id = branch.firstId + depth;
  const previous = depth === 0 ? branch.rootStudy : id - 1;
  const rootNote = depth === 0 ? ` (연구 ${branch.rootStudy} 필요)` : "";
  return {
    id,
    cost: COSTS[depth],
    // 모드 연구를 끄면(또는 스피드런 중이면) 살 수 없다
    requirement: [previous, () => ModTimeStudies.isEnabled],
    reqType: TS_REQUIREMENT_TYPE.ALL,
    unlocked: () => ModTimeStudies.isEnabled,
    description: `[${name}] ${text}${rootNote}`,
    // 화면 표시용: 산 것과 관계없이 지금 효과 값
    effect: () => ModRewards.potentialValue("study", id),
    formatEffect: value => ModRewards.formatChannelValue(part.channel, value),
    isModStudy: true,
    modBranch: branch.key,
    modDepth: depth,
    modClass: branch.colorClass,
    note: name,
    parts: [part],
  };
}

export const modTimeStudies = MOD_STUDY_BRANCHES.flatMap(branch =>
  BRANCH_STUDIES[branch.key].map((entry, depth) => makeStudy(branch, depth, entry)));
