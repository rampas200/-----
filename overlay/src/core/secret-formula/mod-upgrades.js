// [AD Mod] 모드 업그레이드 데이터
// 현실(Reality)의 일회성 업그레이드처럼 "조건 + 효과"로 이루어진 업그레이드를 현실 이전 단계에 넣는다.
// 차이점: 구매하지 않는다. 조건을 달성하는 순간 영구히 해금된다.
//
// 항목 구성
//  - row: 단계 (1 반물질, 2 무한 초반, 3 무한 후반, 4 영원 초반, 5 영원 후반, 6 시간 팽창)
//  - requirement(): 조건 설명 (진행 상황 포함)
//  - checkEvent: 조건을 검사하는 시점. *_BEFORE 이벤트는 리셋 직전이라 이번 판의 상태(갤럭시 수, 시간 등)가 남아 있다.
//  - checkRequirement(): 조건 달성 여부
//  - hasFailed(): (선택) 이번 판에서는 더 이상 달성할 수 없는지. 화면 표시용
//  - parts: 효과. 보너스 보상과 같은 채널을 쓴다 (core/mod-rewards.js의 MOD_REWARD_CHANNELS)
// 효과 공식에서 그 효과가 바꾸는 값 자체를 읽으면 무한 재귀가 되므로, 공식은 원시 상태값만 읽는다.

// GAME_EVENT 값은 이름과 같은 문자열이다
const TICK = "GAME_TICK_AFTER";
const CRUNCH = "BIG_CRUNCH_BEFORE";
const SACRIFICE = "SACRIFICE_RESET_BEFORE";
const ETERNITY = "ETERNITY_RESET_BEFORE";
const AFTER_ETERNITY = "ETERNITY_RESET_AFTER";

const fixed = (channel, value) => ({ channel, value });
const dyn = (channel, text, effect) => ({ channel, text, effect });
const dynAD = (tiers, text, effect) => ({ channel: "adTierMult", tiers, text, effect });
const when = (text, condition, part) => ({ ...part, when: text, condition });

const completedNormalChallenges = () => NormalChallenges.all.countWhere(c => c.isCompleted);
const unlockedInfinityDimensions = () => Array.range(1, 8).countWhere(tier => InfinityDimension(tier).isUnlocked);
const completedEternityChallengeTypes = () => EternityChallenges.all.countWhere(ec => ec.completions > 0);
const noHighTimeDimensions = () => Array.range(5, 4).every(tier => TimeDimension(tier).amount.eq(0));
const lowTimeDimensionsBought = () => Array.range(1, 4).map(tier => TimeDimension(tier).bought).sum();

export const modUpgrades = [
  // ---- 1. 반물질 단계 ----
  {
    id: 1,
    row: 1,
    name: "압축된 출발",
    note: "부스트 없이 버틴 만큼, 부스트 하나하나가 값지다",
    requirement: () => `차원 부스트 없이 반물질 ${format(1e20)} 도달`,
    checkEvent: TICK,
    checkRequirement: () => player.dimensionBoosts === 0 && Currency.antimatter.gte(1e20),
    hasFailed: () => player.dimensionBoosts > 0,
    parts: [dyn("adMult", "차원 부스트 1회당 모든 반물질 차원 ×1.1",
      () => Decimal.pow(1.1, DimBoost.purchasedBoosts))],
  },
  {
    id: 2,
    row: 1,
    name: "고독한 은하",
    note: "갤럭시 없이 해냈으니, 이제 갤럭시 하나하나가 소중하다 (C8을 깨면 자연스럽게 달성)",
    requirement: () => "반물질 갤럭시 없이 무한",
    checkEvent: CRUNCH,
    checkRequirement: () => player.galaxies === 0,
    hasFailed: () => player.galaxies > 0,
    parts: [dyn("tickspeed", "반물질 갤럭시 1개당 틱스피드 ×1.02 (갤럭시 1000개까지)",
      () => Decimal.pow(1.02, Math.min(player.galaxies, 1000)))],
  },
  {
    id: 3,
    row: 1,
    name: "희생의 미학",
    note: "큰 희생을 한 번 해 본 자만이 희생의 무게를 안다",
    requirement: () => `한 번의 차원 희생으로 ${formatX(100)} 이상 얻기`,
    checkEvent: SACRIFICE,
    checkRequirement: () => Sacrifice.nextBoost.gte(100),
    parts: [dyn("sacrificePower", "희생한 1번째 차원이 많을수록 차원 희생 지수 증가 (최대 +20%)",
      () => 1 + Math.min(player.sacrificed.plus(1).log10() / 1000, 0.2))],
  },
  {
    id: 4,
    row: 1,
    name: "8 없는 무한",
    note: "8번째 없이 버텼으니, 이제 8번째가 아래 차원들을 끌어 준다",
    requirement: () => `8번째 반물질 차원 없이 반물질 ${format(1e100)} 도달`,
    checkEvent: TICK,
    checkRequirement: () => player.requirementChecks.infinity.noAD8 && Currency.antimatter.gte(1e100),
    hasFailed: () => !player.requirementChecks.infinity.noAD8,
    parts: [dynAD([1, 2, 3, 4, 5, 6, 7], "8번째 차원을 100개 살 때마다 1~7번째 반물질 차원 +×1 (최대 ×10)",
      () => Math.min(1 + AntimatterDimension(8).bought / 100, 10))],
  },
  {
    id: 5,
    row: 1,
    name: "손수 만든 무한",
    note: "하나하나 직접 산 정성이 10개 묶음에 깃든다",
    requirement: () => "'모두 구매(Max All)'를 쓰지 않고 무한",
    checkEvent: CRUNCH,
    checkRequirement: () => !player.requirementChecks.infinity.maxAll,
    hasFailed: () => player.requirementChecks.infinity.maxAll,
    parts: [fixed("buy10Add", 0.15)],
  },

  // ---- 2. 무한 초반 ----
  {
    id: 6,
    row: 2,
    name: "무한의 흐름",
    note: "무한이 일상이 되었다 (현실 업그레이드 'The Boundless Flow'의 모드판)",
    requirement: () => `총 무한 ${formatInt(100)}회 (현재 ${format(Currency.infinitiesTotal.value, 2)})`,
    checkEvent: TICK,
    checkRequirement: () => Currency.infinitiesTotal.gte(100),
    parts: [fixed("passiveInfinities", 0.1)],
  },
  {
    id: 7,
    row: 2,
    name: "셀 수 없는 구성",
    note: "적은 갤럭시로 빨리 끝낸 경험이 쌓인다 ('Innumerably Construct'의 모드판)",
    requirement: () => `반물질 갤럭시 ${formatInt(2)}개 이하로 ${formatInt(3)}분 안에 무한`,
    checkEvent: CRUNCH,
    checkRequirement: () => player.galaxies <= 2 && player.records.thisInfinity.time < 180000,
    hasFailed: () => player.galaxies > 2 || player.records.thisInfinity.time >= 180000,
    parts: [dyn("infinitiesMult", "반물질 갤럭시 30개마다 무한 횟수 획득 +×1",
      () => 1 + player.galaxies / 30)],
  },
  {
    id: 8,
    row: 2,
    name: "도전 정신",
    note: "도전을 이길 때마다 무한 포인트가 늘어난다",
    requirement: () => `일반 챌린지 ${formatInt(6)}개 완료 (현재 ${formatInt(completedNormalChallenges())})`,
    checkEvent: TICK,
    checkRequirement: () => completedNormalChallenges() >= 6,
    parts: [dyn("ipMult", "완료한 일반 챌린지 1개당 IP ×1.25",
      () => Math.pow(1.25, completedNormalChallenges()))],
  },
  {
    id: 9,
    row: 2,
    name: "업그레이드 애호가",
    note: "업그레이드를 모을수록 더 많이 모인다",
    requirement: () => `IP ${format(1e6)} 보유`,
    checkEvent: TICK,
    checkRequirement: () => Currency.infinityPoints.gte(1e6),
    parts: [dyn("ipMult", "보유한 무한 업그레이드 1개당 IP ×1.1",
      () => Math.pow(1.1, player.infinityUpgrades.size))],
  },
  {
    id: 10,
    row: 2,
    name: "빠른 손",
    note: "빠를수록 강해진다 ('Replicative Rapidity'의 모드판)",
    requirement: () => `${formatInt(30)}초 안에 무한 (최고 기록: ${Time.bestInfinity.toStringShort()})`,
    checkEvent: CRUNCH,
    checkRequirement: () => player.records.thisInfinity.time < 30000,
    parts: [dyn("adMult", "최고 무한 기록이 1분보다 빠를수록 모든 반물질 차원 강화 (최대 ×1000)",
      () => Math.min(Math.max(60000 / player.records.bestInfinity.time, 1), 1000))],
  },

  // ---- 3. 무한 후반 ----
  {
    id: 11,
    row: 3,
    name: "한계 너머",
    note: "깨진 한계 너머에서 IP가 저절로 흘러든다",
    requirement: () => `무한을 깬 뒤, 한 번의 무한으로 IP ${format(1e20)} 이상 얻기`,
    checkEvent: CRUNCH,
    checkRequirement: () => player.break && gainedInfinityPoints().gte(1e20),
    parts: [fixed("passiveIP", 0.01)],
  },
  {
    id: 12,
    row: 3,
    name: "무한 차원 개척자",
    note: "새 차원을 열 때마다 모든 무한 차원이 강해진다",
    requirement: () => `무한 차원 ${formatInt(4)}개 해금 (현재 ${formatInt(unlockedInfinityDimensions())})`,
    checkEvent: TICK,
    checkRequirement: () => unlockedInfinityDimensions() >= 4,
    parts: [dyn("idMult", "해금한 무한 차원 1개당 무한 차원 ×1.5",
      () => Math.pow(1.5, unlockedInfinityDimensions()))],
  },
  {
    id: 13,
    row: 3,
    name: "무한 챌린지 정복자",
    note: "갤럭시 비용 증가를 늦춘다 ('Cosmic Conglomerate'의 모드판)",
    requirement: () => `무한 챌린지 ${formatInt(4)}개 완료 (현재 ${formatInt(InfinityChallenges.completed.length)})`,
    checkEvent: TICK,
    checkRequirement: () => InfinityChallenges.completed.length >= 4,
    parts: [dyn("galaxyScalingDelay", "완료한 무한 챌린지 1개당 먼 갤럭시 비용 증가가 2개 늦게 시작",
      () => 2 * InfinityChallenges.completed.length)],
  },
  {
    id: 14,
    row: 3,
    name: "레플리칸티 각성",
    note: "복제가 복제를 부른다 ('Cosmically Duplicate'의 모드판)",
    requirement: () => `레플리칸티 ${format(1e100)} 보유`,
    checkEvent: TICK,
    checkRequirement: () => Replicanti.amount.gte(1e100),
    parts: [dyn("replicantiSpeed", "레플리칸티 갤럭시 50개마다 레플리칸티 속도 +×1",
      () => 1 + Replicanti.galaxies.total / 50)],
  },
  {
    id: 15,
    row: 3,
    name: "무한 파워 충전",
    note: "무한 파워가 무한 포인트로 되돌아온다",
    requirement: () => `무한 파워 ${format(1e50)} 보유`,
    checkEvent: TICK,
    checkRequirement: () => Currency.infinityPower.gte(1e50),
    parts: [dyn("ipMult", "무한 파워의 자릿수 20개마다 IP +×1",
      () => 1 + Currency.infinityPower.value.plus(1).log10() / 20)],
  },

  // ---- 4. 영원 초반 ----
  {
    id: 16,
    row: 4,
    name: "영원의 흐름",
    note: "영원이 일상이 되었다 ('The Eternal Flow'의 모드판)",
    requirement: () => `영원 ${formatInt(100)}회 (현재 ${format(Currency.eternities.value, 2)})`,
    checkEvent: TICK,
    checkRequirement: () => Currency.eternities.gte(100),
    parts: [fixed("passiveEternities", 0.1)],
  },
  {
    id: 17,
    row: 4,
    name: "복제 없는 영원",
    note: "레플리칸티 없이 해낸 영원, 이제 레플리칸티가 시간을 돕는다",
    requirement: () => "레플리칸티 갤럭시 없이 영원",
    checkEvent: ETERNITY,
    checkRequirement: () => player.requirementChecks.eternity.noRG,
    hasFailed: () => !player.requirementChecks.eternity.noRG,
    parts: [dyn("tdMult", "레플리칸티 갤럭시 20개마다 시간 차원 +×1",
      () => 1 + Replicanti.galaxies.total / 20)],
  },
  {
    id: 18,
    row: 4,
    name: "독학의 영원",
    note: "시간 정리가 영원 포인트를 늘린다 ('The Knowing Existence'의 모드판)",
    requirement: () => `시간 연구 없이, 한 번의 영원으로 EP ${format(100)} 이상 얻기`,
    checkEvent: ETERNITY,
    checkRequirement: () => player.timestudy.studies.length === 0 && gainedEternityPoints().gte(100),
    hasFailed: () => player.timestudy.studies.length > 0,
    parts: [dyn("epMult", "보유한 시간 정리(TT)의 제곱근 10마다 EP +×1",
      () => Currency.timeTheorems.value.plus(1).pow(0.5).div(10).plus(1))],
  },
  {
    id: 19,
    row: 4,
    name: "영원의 순간",
    note: "빠른 영원을 위해 출발선을 앞당긴다 ('Existentially Prolong'의 모드판)",
    requirement: () => `${formatInt(1)}분 안에 영원`,
    checkEvent: ETERNITY,
    checkRequirement: () => player.records.thisEternity.time < 60000,
    hasFailed: () => player.records.thisEternity.time >= 60000,
    parts: [fixed("startingIP", 1e30)],
  },
  {
    id: 20,
    row: 4,
    name: "무한 은행",
    note: "저축한 무한에 이자가 붙는다",
    requirement: () => `저축된 무한 ${format(1e6)} 보유 (현재 ${format(Currency.infinitiesBanked.value, 2)})`,
    checkEvent: TICK,
    checkRequirement: () => Currency.infinitiesBanked.gte(1e6),
    parts: [dyn("infinitiesMult", "저축된 무한의 자릿수 1개마다 무한 횟수 획득 +×0.5",
      () => 1 + Currency.infinitiesBanked.value.plus(1).log10() / 2)],
  },

  // ---- 5. 영원 후반 ----
  {
    id: 21,
    row: 5,
    name: "텔레메카닉",
    note: "낮은 시간 차원만으로 버틴 경험 ('The Telemechanical Process'의 모드판)",
    requirement: () => `시간 차원 5~8 없이 EP ${format(1e100)} 보유`,
    checkEvent: AFTER_ETERNITY,
    checkRequirement: () => noHighTimeDimensions() && Currency.eternityPoints.gte(1e100),
    hasFailed: () => !noHighTimeDimensions(),
    parts: [dyn("tdMult", "1~4번째 시간 차원을 10번 살 때마다 시간 차원 ×1.1 (최대 ×1e10)",
      () => Decimal.pow(1.1, Math.floor(lowTimeDimensionsBought() / 10)).clampMax(1e10))],
  },
  {
    id: 22,
    row: 5,
    name: "역설의 영원",
    note: "참았던 업그레이드가 타키온으로 돌아온다 ('The Paradoxical Forever'의 모드판)",
    requirement: () => `${formatX(5)} EP 업그레이드 없이 EP ${format(1e10)} 보유`,
    checkEvent: AFTER_ETERNITY,
    checkRequirement: () => player.epmultUpgrades === 0 && Currency.eternityPoints.gte(1e10),
    hasFailed: () => player.epmultUpgrades > 0,
    parts: [dyn("tpMult", "×5 EP 업그레이드 10회마다 타키온 입자 +×1",
      () => 1 + player.epmultUpgrades / 10)],
  },
  {
    id: 23,
    row: 5,
    name: "영원 챌린지 탐험가",
    note: "다양한 시련이 시간을 단련한다",
    requirement: () => `서로 다른 영원 챌린지 ${formatInt(6)}개 완료 (현재 ${formatInt(completedEternityChallengeTypes())})`,
    checkEvent: TICK,
    checkRequirement: () => completedEternityChallengeTypes() >= 6,
    parts: [dyn("tdMult", "영원 챌린지 총 완료 횟수 1회당 시간 차원 ×1.5",
      () => Decimal.pow(1.5, EternityChallenges.completions))],
  },
  {
    id: 24,
    row: 5,
    name: "영원의 샘",
    note: "영원 포인트가 샘처럼 솟는다",
    requirement: () => `EP ${format(1e200)} 보유`,
    checkEvent: TICK,
    checkRequirement: () => Currency.eternityPoints.gte(1e200),
    parts: [fixed("passiveEP", 0.01)],
  },
  {
    id: 25,
    row: 5,
    name: "연구 수집가",
    note: "공부한 만큼 시간 정리가 쌓인다",
    requirement: () => `시간 연구 ${formatInt(30)}개 동시 보유 (현재 ${formatInt(player.timestudy.studies.length)})`,
    checkEvent: TICK,
    checkRequirement: () => player.timestudy.studies.length >= 30,
    parts: [fixed("ttPerSecond", 0.05)],
  },

  // ---- 6. 시간 팽창 ----
  {
    id: 26,
    row: 6,
    name: "팽창 입문",
    note: "팽창의 세계에 온 것을 환영한다",
    requirement: () => "시간 팽창 해금",
    checkEvent: TICK,
    checkRequirement: () => PlayerProgress.dilationUnlocked(),
    parts: [fixed("dtMult", 3)],
  },
  {
    id: 27,
    row: 6,
    name: "팽창 속 질주",
    note: "느려진 시간 속에서도 달린다",
    requirement: () => `팽창 중에 반물질 ${formatPostBreak("1e1000")} 도달`,
    checkEvent: TICK,
    checkRequirement: () => player.dilation.active && Currency.antimatter.exponent >= 1000,
    parts: [when("팽창 중", () => player.dilation.active, fixed("adMult", 1e10))],
  },
  {
    id: 28,
    row: 6,
    name: "타키온 가속",
    note: "타키온이 많을수록 시간이 더 크게 팽창한다",
    requirement: () => `타키온 입자 ${format(1e10)} 보유`,
    checkEvent: TICK,
    checkRequirement: () => Currency.tachyonParticles.gte(1e10),
    parts: [dyn("dtMult", "타키온 입자의 자릿수 5개마다 팽창 시간 +×1",
      () => 1 + Currency.tachyonParticles.value.plus(1).log10() / 5)],
  },
  {
    id: 29,
    row: 6,
    name: "팽창 시간 축적",
    note: "쌓인 팽창 시간이 정리로 굳는다",
    requirement: () => `팽창 시간 ${format(1e20)} 보유`,
    checkEvent: TICK,
    checkRequirement: () => Currency.dilatedTime.gte(1e20),
    parts: [fixed("ttPerSecond", 0.2)],
  },
  {
    id: 30,
    row: 6,
    name: "현실의 문턱",
    note: "현실로 넘어갈 준비 (현실은 EP 1e4000에서 열린다)",
    requirement: () => `EP ${formatPostBreak("1e3000")} 보유`,
    checkEvent: TICK,
    checkRequirement: () => Currency.eternityPoints.exponent >= 3000,
    parts: [fixed("rmMult", 3), fixed("glyphLevel", 10)],
  },
];
