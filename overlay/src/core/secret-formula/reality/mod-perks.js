// [AD Mod] 모드 퍽 데이터
// 원래 퍽 트리의 끝(가지 끝 퍽)에서 이어지는 퍽 36개. 원래 퍽처럼 1 퍽 포인트로 사고, 현실 리스펙으로 환불된다.
//  - 이어받기 퍽: 원래 퍽 효과의 다음 단계 (시작 자원, EC 자동 완료, TP 소급 배율). 원래 계산식의 퍽 목록에 끼워 넣는다.
//  - 효과 퍽: 보너스 효과 엔진(core/mod-rewards.js)의 채널로 적용된다. parts는 다른 모드 데이터와 같은 형식이다.
// id는 300~373 (원래 퍽은 0~205).
//
// 퍽 화면의 기본 배치(layoutPosList)는 직접 적지 않고, 이어지는 퍽 옆의 빈자리를 찾아 계산한다 (placeModPerks).

const fixed = (channel, value) => ({ channel, value });
const dyn = (channel, effect) => ({ channel, effect });

const achievementCount = () => Achievements.all.countWhere(achievement => achievement.isUnlocked);
const realityCount = () => Currency.realities.value;

// 이어받기 퍽 (원래 퍽의 다음 단계). pelleUseless: 원래 퍽처럼 Pelle의 파멸된 현실에서는 쓸모가 없다.
const continuationPerks = {
  modStartAM: {
    id: 300, label: "SAM2", family: "ANTIMATTER", from: ["startAM"],
    get description() { return `[모드] 모든 리셋을 반물질 ${format(1e200)}으로 시작합니다.`; },
    effect: 1e200,
    bumpCurrency: () => Currency.antimatter.bumpTo(1e200),
  },
  modStartIP: {
    id: 301, label: "SIP3", family: "INFINITY", from: ["startIP2"],
    get description() { return `[모드] 모든 영원과 현실을 무한 포인트 ${format(1e300)}로 시작합니다.`; },
    effect: 1e300,
    bumpCurrency: () => Currency.infinityPoints.bumpTo(1e300),
  },
  modStartEP: {
    id: 302, label: "SEP4", family: "ETERNITY", from: ["startEP3"],
    get description() { return `[모드] 모든 현실을 영원 포인트 ${format(1e100)}로 시작합니다.`; },
    effect: 1e100,
    bumpCurrency: () => Currency.eternityPoints.bumpTo(1e100),
  },
  modStartTP: {
    id: 303, label: "STP2", family: "DILATION", from: ["startTP"],
    get description() { return `[모드] 시간 팽창을 해금하면 타키온 입자 ${format(1e6)}개를 얻습니다.`; },
    effect: () => (Enslaved.isRunning ? 1 : 1e6),
  },
  modAutoEC4: {
    id: 304, label: "PEC4", family: "AUTOMATION", from: ["autocompleteEC3"],
    get description() {
      return `[모드] 영원 챌린지를 ${formatInt(10)}분(실제 시간)마다 하나씩 자동 완료합니다.`;
    },
    effect: 10,
  },
  modAutoEC5: {
    id: 305, label: "PEC5", family: "AUTOMATION", from: ["modAutoEC4"],
    get description() {
      return `[모드] 영원 챌린지를 ${formatInt(4)}분(실제 시간)마다 하나씩 자동 완료합니다.`;
    },
    effect: 4,
  },
  modRetroactiveTP: {
    id: 306, label: "TP5", family: "DILATION", from: ["retroactiveTP4"],
    get description() {
      return `[모드] 3번째 반복 팽창 업그레이드를 사면 지금 가진 타키온 입자에 ×${formatInt(4)}를 곱합니다.`;
    },
    effect: 4,
  },
};

// 효과 퍽: [키, id, 라벨, 계열, 이어지는 퍽, 설명, 효과 조각]
const EFFECT_PERKS = [
  // 반물질: 리셋 없는 부스트(ANR)에서
  ["modADMult", 310, "AD+", "ANTIMATTER", "antimatterNoReset",
    "모든 반물질 차원 ×1e100", fixed("adMult", 1e100)],
  ["modGalaxyStrength", 311, "GAL+", "ANTIMATTER", "modADMult",
    "반물질 갤럭시 효과 +10%", fixed("galaxyStrength", 1.1)],
  ["modDimBoost", 312, "DB+", "ANTIMATTER", "modGalaxyStrength",
    "차원 부스트 배율 ×2", fixed("dimBoostPower", 2)],
  ["modGalaxyScaling", 313, "GSD", "ANTIMATTER", "modDimBoost",
    "먼 갤럭시 비용 증가가 200개 늦게 시작", fixed("galaxyScalingDelay", 200)],
  // 무한: 무한 차원 반물질 조건 제거(IDR)에서
  ["modIDMult", 320, "ID+", "INFINITY", "bypassIDAntimatter",
    "모든 무한 차원 ×1e50", fixed("idMult", 1e50)],
  ["modIPMult", 321, "IP+", "INFINITY", "modIDMult",
    "무한 포인트 ×1e20", fixed("ipMult", 1e20)],
  ["modIDConversion", 322, "IPC", "INFINITY", "modIPMult",
    "무한 파워 변환 지수 +1", fixed("idConversion", 1)],
  ["modPassiveIP", 323, "PIP", "INFINITY", "modIDConversion",
    "매초 지금 무한하면 얻을 IP의 1% 자동 획득", fixed("passiveIP", 0.01)],
  // 영원: 시작 EP 4단계, EC 일괄 완료, TT 최대 구매에서
  ["modEPMult", 330, "EP+", "ETERNITY", "modStartEP",
    "영원 포인트 ×1e10", fixed("epMult", 1e10)],
  ["modPassiveEP", 331, "PEP", "ETERNITY", "modEPMult",
    "매초 지금 영원하면 얻을 EP의 1% 자동 획득", fixed("passiveEP", 0.01)],
  ["modEternities", 332, "ETM", "ETERNITY", "modPassiveEP",
    "영원 횟수 획득 ×(현실 횟수+1)", dyn("eternitiesMult", () => realityCount() + 1)],
  ["modTDMult", 333, "TD+", "ETERNITY", "studyECBulk",
    "모든 시간 차원 ×1e30", fixed("tdMult", 1e30)],
  ["modTTGen", 334, "TTG", "ETERNITY", "ttBuyMax",
    "보유한 EP에 비례해 시간 정리(TT) 생성 (log10(EP)/100 /초)",
    dyn("ttPerSecond", () => Currency.eternityPoints.value.plus(1).log10() / 100)],
  // 복제자: 레플리칸티 오토바이어 가속(REPAS)에서
  ["modReplicantiSpeed", 340, "REP+", "INFINITY", "autobuyerFasterReplicanti",
    "레플리칸티 속도 ×10", fixed("replicantiSpeed", 10)],
  ["modReplicantiGalaxyMax", 341, "RGM", "INFINITY", "modReplicantiSpeed",
    "레플리칸티 갤럭시 최대치 +50", fixed("replicantiGalaxyMax", 50)],
  ["modReplicantiGalaxyPower", 342, "RGP", "INFINITY", "modReplicantiGalaxyMax",
    "레플리칸티 갤럭시 효과 +15%", fixed("replicantiGalaxyPower", 0.15)],
  // 시간 팽창: 팽창 오토바이어 일괄 구매(DAB), TD 5~8 자동 해금(ATD)에서
  ["modDTMult", 350, "DT+", "DILATION", "dilationAutobuyerBulk",
    "팽창 시간 ×5", fixed("dtMult", 5)],
  ["modTPMult", 351, "TPM", "DILATION", "modDTMult",
    "타키온 입자 획득 ×3", fixed("tpMult", 3)],
  ["modDilationExponent", 352, "DILX", "DILATION", "modTPMult",
    "팽창 페널티 완화 (팽창 지수 +0.03)", fixed("dilationExponent", 0.03)],
  ["modTachyonGalaxies", 353, "TG+", "DILATION", "autounlockTD",
    "타키온 은하 +20", fixed("extraTachyonGalaxies", 20)],
  // 현실: 현실 자동 해금(REAL)에서
  ["modRMMult", 360, "RM+", "REALITY", "autounlockReality",
    "현실 기계 ×2", fixed("rmMult", 2)],
  ["modGlyphLevel", 361, "GL+", "REALITY", "modRMMult",
    "글리프 레벨 +100", fixed("glyphLevel", 100)],
  ["modBlackHole", 362, "BH+", "REALITY", "modGlyphLevel",
    "블랙홀 위력 +25%", fixed("blackHolePower", 1.25)],
  ["modRMRealities", 363, "RM2", "REALITY", "modBlackHole",
    "현실 기계 ×(1+log10(현실 횟수+1))", dyn("rmMult", () => 1 + Math.log10(realityCount() + 1))],
  ["modGlyphRealities", 364, "GL2", "REALITY", "modRMRealities",
    "현실 횟수의 제곱근만큼 글리프 레벨 증가 (최대 +300)",
    dyn("glyphLevel", () => Math.floor(Math.min(Math.sqrt(realityCount()), 300)))],
  // 업적: 업적 유지(ACHNR)에서
  ["modAchievementAD", 370, "ACA", "ACHIEVEMENT", "achievementGroup5",
    "모든 반물질 차원 ×(달성한 업적 수)^10", dyn("adMult", () => Decimal.pow(Math.max(achievementCount(), 1), 10))],
  ["modAchievementTD", 371, "ACT", "ACHIEVEMENT", "modAchievementAD",
    "모든 시간 차원 ×(달성한 업적 수)³", dyn("tdMult", () => Decimal.pow(Math.max(achievementCount(), 1), 3))],
  ["modAchievementRM", 372, "ACR", "ACHIEVEMENT", "modAchievementTD",
    "현실 기계 ×(1+달성한 업적 수/100)", dyn("rmMult", () => 1 + achievementCount() / 100)],
  ["modAchievementGlyph", 373, "ACG", "ACHIEVEMENT", "modAchievementRM",
    "달성한 업적 4개마다 글리프 레벨 +1", dyn("glyphLevel", () => Math.floor(achievementCount() / 4))],
];

const effectPerks = {};
for (const [key, id, label, family, from, text, part] of EFFECT_PERKS) {
  effectPerks[key] = {
    id, label, family, from: [from],
    description: `[모드] ${text}.`,
    // Text는 퍽 정보 칸의 효과 설명 (켜져 있으면 뒤에 지금 값이 붙는다)
    parts: [{ ...part, text }],
  };
}

for (const config of Object.values(continuationPerks)) config.pelleUseless = true;

export const modPerkConfigs = { ...continuationPerks, ...effectPerks };
for (const config of Object.values(modPerkConfigs)) config.modPerk = true;

// ---- 기본 배치 계산 ----
// 원래 퍽은 배치마다 위치를 숫자 하나로 저장한다 (PerksTab.vue의 positionNumToVector).
// 0번(기본)과 5번(Blob)은 화면 좌표, 1~4번은 5칸 간격 격자 좌표다.

const numToVector = num => ({ x: 5 * (num % 400 - 200), y: 5 * (Math.floor(num / 400) - 200) });
const vectorToNum = v => Math.floor(v.x / 5) + 400 * Math.floor(v.y / 5) + 80200;
const LAYOUT_COUNT = 6;
const isGridLayout = layout => layout >= 1 && layout <= 4;
// 좌표가 ±1000을 넘으면 숫자 인코딩이 깨진다
const COORD_LIMIT = 990;

function findFreeSpot({ parent, start, occupied, layout }) {
  const step = isGridLayout(layout) ? 5 : 130;
  const minGap = isGridLayout(layout) ? 5 : 110;
  // START에서 멀어지는 방향을 먼저 시도하고, 조금씩 돌려 가며 빈자리를 찾는다
  const dx = parent.x - start.x;
  const dy = parent.y - start.y;
  const baseAngle = dx === 0 && dy === 0 ? Math.PI / 2 : Math.atan2(dy, dx);
  for (const distance of [1, 1.5, 2, 2.5, 3, 4, 5]) {
    for (let turn = 0; turn <= 24; turn++) {
      const offset = Math.ceil(turn / 2) * (Math.PI / 12) * (turn % 2 === 0 ? 1 : -1);
      const angle = baseAngle + offset;
      let x = parent.x + Math.cos(angle) * step * distance;
      let y = parent.y + Math.sin(angle) * step * distance;
      x = 5 * Math.round(x / 5);
      y = 5 * Math.round(y / 5);
      if (Math.abs(x) > COORD_LIMIT || Math.abs(y) > COORD_LIMIT) continue;
      if (occupied.every(p => Math.hypot(p.x - x, p.y - y) >= minGap - 0.01)) return { x, y };
    }
  }
  return { x: parent.x, y: parent.y };
}

// 원래 퍽 데이터(perks: 키 → 설정)를 보고 모드 퍽마다 layoutPosList를 채운다.
export function placeModPerks(perks, modConfigs) {
  const placed = { ...perks };
  const occupied = [];
  for (let layout = 0; layout < LAYOUT_COUNT; layout++) {
    occupied[layout] = Object.values(perks).map(config => numToVector(config.layoutPosList[layout]));
  }
  const start = Object.values(perks).find(config => config.id === 0);
  for (const [key, config] of Object.entries(modConfigs)) {
    const parent = placed[config.from[0]];
    config.layoutPosList = [];
    for (let layout = 0; layout < LAYOUT_COUNT; layout++) {
      const spot = findFreeSpot({
        parent: numToVector(parent.layoutPosList[layout]),
        start: numToVector(start.layoutPosList[layout]),
        occupied: occupied[layout],
        layout,
      });
      occupied[layout].push(spot);
      config.layoutPosList.push(vectorToNum(spot));
    }
    placed[key] = config;
  }
}
