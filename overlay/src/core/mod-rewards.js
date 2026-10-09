// [AD Mod] 보너스 효과 엔진
// 여러 모드 기능의 효과를 한곳에서 모아 게임 계산식에 넘긴다.
//  - 보너스 보상: 모든 업적/비밀 업적/챌린지에 붙는 추가 보상 (secret-formula/mod-rewards.js)
//  - 모드 업그레이드: 조건을 달성하면 해금되는 일회성 업그레이드 (secret-formula/mod-upgrades.js)
//  - 모드 시간 연구: 시간 연구 트리 아래의 4갈래 연구 (secret-formula/eternity/time-studies/mod-time-studies.js)
// 여기서는
//  1) 각 효과가 지금 켜져 있는지(업적 달성, 업그레이드 해금 등) 판단하고
//  2) 같은 채널(예: 틱스피드)에 걸린 효과들을 곱하거나 더해서
//  3) 패치된 게임 계산식이 ModRewards.decimal / number / sum / max 로 가져다 쓰게 한다.

import { DC } from "./constants";
import { modRewards } from "./secret-formula/mod-rewards";
import { modTimeStudies } from "./secret-formula/eternity/time-studies/mod-time-studies";
import { modUpgrades } from "./secret-formula/mod-upgrades";

// 종류(kind): decimal = Decimal 곱, number = 숫자 곱, sum = 숫자 합, max = Decimal 최댓값
// 표시(format): 화면에 값을 보여주는 방식
export const MOD_REWARD_CHANNELS = {
  adMult: { kind: "decimal", format: "mult", label: "모든 반물질 차원" },
  adTierMult: { kind: "decimal", format: "mult", label: "반물질 차원", tiered: true },
  tickspeed: { kind: "decimal", format: "mult", label: "틱스피드" },
  buy10Add: { kind: "sum", format: "plus", label: "10개 구매 배율" },
  startingAM: { kind: "decimal", format: "mult", label: "시작 반물질" },
  dimBoostPower: { kind: "number", format: "mult", label: "차원 부스트 배율" },
  dimBoostDiscount: { kind: "sum", format: "minus", label: "차원 부스트 필요 차원 수" },
  galaxyStrength: { kind: "number", format: "percent", label: "반물질 갤럭시 효과" },
  galaxyDiscount: { kind: "sum", format: "minus", label: "반물질 갤럭시 필요 차원 수" },
  sacrificePower: { kind: "number", format: "percent", label: "차원 희생 지수" },
  ipMult: { kind: "decimal", format: "mult", label: "무한 포인트(IP)" },
  infinitiesMult: { kind: "decimal", format: "mult", label: "무한 횟수 획득" },
  idMult: { kind: "decimal", format: "mult", label: "무한 차원" },
  replicantiSpeed: { kind: "decimal", format: "mult", label: "레플리칸티 속도" },
  epMult: { kind: "decimal", format: "mult", label: "영원 포인트(EP)" },
  eternitiesMult: { kind: "decimal", format: "mult", label: "영원 횟수 획득" },
  tdMult: { kind: "decimal", format: "mult", label: "시간 차원" },
  tpMult: { kind: "decimal", format: "mult", label: "타키온 입자" },
  dtMult: { kind: "decimal", format: "mult", label: "팽창 시간" },
  rmMult: { kind: "number", format: "mult", label: "현실 기계(RM)" },
  glyphLevel: { kind: "sum", format: "plusInt", label: "글리프 레벨" },
  blackHolePower: { kind: "number", format: "percent", label: "블랙홀 위력" },
  // 아래는 모드 업그레이드에서 쓰는 채널 (자동 획득, 비용 증가 지연, 시작 자원)
  passiveInfinities: { kind: "sum", format: "fractionPerSec", label: "무한 횟수 자동 획득(무한 1회분 대비)" },
  passiveEternities: { kind: "sum", format: "fractionPerSec", label: "영원 횟수 자동 획득(영원 1회분 대비)" },
  passiveIP: { kind: "sum", format: "fractionPerSec", label: "IP 자동 획득(지금 무한하면 얻을 양 대비)" },
  passiveEP: { kind: "sum", format: "fractionPerSec", label: "EP 자동 획득(지금 영원하면 얻을 양 대비)" },
  galaxyScalingDelay: { kind: "sum", format: "laterInt", label: "먼 갤럭시 비용 증가 시작" },
  ttPerSecond: { kind: "sum", format: "plusPerSec", label: "시간 정리(TT) 생성" },
  startingIP: { kind: "max", format: "atLeast", label: "영원 시작 IP" },
  // 아래는 모드 시간 연구에서 쓰는 채널
  idTierMult: { kind: "decimal", format: "mult", label: "무한 차원", tiered: true },
  idConversion: { kind: "sum", format: "plus", label: "무한 파워 변환 지수" },
  replicantiGalaxyMax: { kind: "sum", format: "plusInt", label: "레플리칸티 갤럭시 최대치" },
  replicantiGalaxyPower: { kind: "sum", format: "percentAdd", label: "레플리칸티 갤럭시 효과" },
  dilationExponent: { kind: "sum", format: "plus", label: "팽창 지수" },
  extraTachyonGalaxies: { kind: "sum", format: "plusInt", label: "타키온 은하" },
};

const bonusRewardsEnabled = () => ADMod.bonusRewards;

export const MOD_REWARD_SOURCES = {
  achievement: {
    label: "업적",
    isEnabled: bonusRewardsEnabled,
    isActive: id => Achievement(id).isEffectActive,
    title: id => `${id}. ${Achievement(id).config.name}`,
  },
  secret: {
    label: "비밀 업적",
    isEnabled: bonusRewardsEnabled,
    isActive: id => SecretAchievement(id).isUnlocked,
    title: id => `S${id}. ${SecretAchievement(id).config.name}`,
  },
  normalChallenge: {
    label: "일반 챌린지",
    isEnabled: bonusRewardsEnabled,
    isActive: id => NormalChallenge(id).isCompleted,
    title: id => `C${id}. ${NormalChallenge(id).config.name}`,
  },
  infinityChallenge: {
    label: "무한 챌린지",
    isEnabled: bonusRewardsEnabled,
    isActive: id => InfinityChallenge(id).isCompleted,
    title: id => `IC${id}`,
  },
  eternityChallenge: {
    label: "영원 챌린지",
    isEnabled: bonusRewardsEnabled,
    isActive: id => EternityChallenge(id).completions > 0,
    title: id => `EC${id}`,
    // 영원 챌린지 보상은 완료 횟수(0~5)만큼 쌓인다
    perCompletion: true,
  },
  upgrade: {
    label: "모드 업그레이드",
    isEnabled: () => ADMod.modUpgrades,
    isActive: id => ModUpgrades.isUnlocked(id),
    title: id => ModUpgrades.byId(id).name,
  },
  study: {
    label: "모드 시간 연구",
    isEnabled: () => ADMod.modStudies,
    isActive: id => TimeStudy(id).isBought,
    title: id => `연구 ${id}`,
  },
};

// 데이터를 { source, id, note, parts } 목록으로 펼치고, 채널별로 묶어 둔다
const byChannel = {};
for (const channel of Object.keys(MOD_REWARD_CHANNELS)) byChannel[channel] = [];

// 항목(entry)은 { note, parts } 를 가진 객체 (보너스 보상 항목 또는 모드 업그레이드)
function register(source, id, entry) {
  const reward = { source, id: Number(id), key: `${source}${id}`, note: entry.note, parts: entry.parts };
  for (const part of reward.parts) byChannel[part.channel].push({ reward, part });
  return reward;
}

// 보너스 보상 목록 (Mod Bonuses 탭에 나오는 것)
const rewardList = [];
for (const [source, rewards] of Object.entries(modRewards)) {
  for (const [id, entry] of Object.entries(rewards)) rewardList.push(register(source, id, entry));
}
// 모드 업그레이드의 효과 (Mod Upgrades 탭에서 따로 보여준다)
const upgradeRewardList = modUpgrades.map(upgrade => register("upgrade", upgrade.id, upgrade));
// 모드 시간 연구의 효과 (연구 버튼에 표시된다)
const studyRewardList = modTimeStudies.map(study => register("study", study.id, study));

const rewardIndex = new Map([...rewardList, ...upgradeRewardList, ...studyRewardList].map(r => [r.key, r]));

function neutralValue(kind) {
  if (kind === "decimal") return DC.D1;
  if (kind === "max") return DC.D0;
  return kind === "number" ? 1 : 0;
}

// 효과는 절대 불리하게 작용하지 않도록 곱은 1 이상, 합과 최댓값은 0 이상으로 자른다
function sanitize(kind, value) {
  if (kind === "decimal" || kind === "max") {
    const decimal = value instanceof Decimal ? value : new Decimal(value);
    const floor = neutralValue(kind);
    if (!Number.isFinite(decimal.mantissa) || decimal.lt(floor)) return floor;
    return decimal;
  }
  const number = value instanceof Decimal ? value.toNumber() : Number(value);
  if (!Number.isFinite(number)) return neutralValue(kind);
  return kind === "number" ? Math.max(number, 1) : Math.max(number, 0);
}

function completionsOf(reward) {
  return MOD_REWARD_SOURCES[reward.source].perCompletion ? EternityChallenge(reward.id).completions : 1;
}

function isRewardActive(reward) {
  return MOD_REWARD_SOURCES[reward.source].isActive(reward.id);
}

// 스피드런 중에는 모든 모드 효과를 끈다
function isSourceEnabled(source) {
  return !ADMod.isSuspended && MOD_REWARD_SOURCES[source].isEnabled();
}

function partAppliesToTier(part, tier) {
  return part.tiers.includes(tier);
}

// 보상 한 조각의 현재 값 (조건이 안 맞으면 중립값)
function partValue(reward, part, tier) {
  const kind = MOD_REWARD_CHANNELS[part.channel].kind;
  if (part.condition && !part.condition()) return neutralValue(kind);
  const completions = completionsOf(reward);
  let value;
  if (part.effect) {
    value = part.effect({ tier, completions });
  } else if (MOD_REWARD_SOURCES[reward.source].perCompletion) {
    value = kind === "sum" ? part.value * completions : Math.pow(part.value, completions);
  } else {
    value = part.value;
  }
  return sanitize(kind, value);
}

function combine(kind, total, value) {
  if (kind === "decimal") return total.times(value);
  if (kind === "max") return Decimal.max(total, value);
  return kind === "number" ? total * value : total + value;
}

// 같은 틱 안에서는 값이 바뀌지 않으므로 채널 결과를 틱마다 한 번만 계산한다
const cache = new Map();
EventHub.logic.on(GAME_EVENT.GAME_TICK_BEFORE, () => cache.clear());

function channelTotal(channel, tier) {
  const config = MOD_REWARD_CHANNELS[channel];
  if (ADMod.isSuspended) return neutralValue(config.kind);
  const cacheKey = tier === undefined ? channel : `${channel}:${tier}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  let total = neutralValue(config.kind);
  for (const { reward, part } of byChannel[channel]) {
    if (config.tiered && !partAppliesToTier(part, tier)) continue;
    if (!isSourceEnabled(reward.source) || !isRewardActive(reward)) continue;
    total = combine(config.kind, total, partValue(reward, part, tier));
  }
  cache.set(cacheKey, total);
  return total;
}

// ---- 화면 표시용 ----

function formatNumberish(value, places = 2) {
  if (typeof value === "number" && Number.isInteger(value)) return format(value, places, 0);
  return format(value, places, 2);
}

function formatChannelValue(channel, value) {
  switch (MOD_REWARD_CHANNELS[channel].format) {
    case "mult": return `×${formatNumberish(value)}`;
    case "percent": {
      const percent = (Number(value) - 1) * 100;
      return `+${format(percent, 2, Number.isInteger(Math.round(percent * 1e6) / 1e6) ? 0 : 1)}%`;
    }
    case "plus": return `+${formatNumberish(value)}`;
    case "plusInt": return `+${formatInt(value)}`;
    case "minus": return `-${formatInt(value)}`;
    case "fractionPerSec": return `${formatPercents(Number(value), Number.isInteger(Number(value) * 100) ? 0 : 1)}/초`;
    case "laterInt": return `${formatInt(value)}개 늦게`;
    case "plusPerSec": return `+${formatNumberish(value)}/초`;
    case "atLeast": return `최소 ${format(value, 2, 0)}`;
    case "percentAdd": return `+${formatPercents(Number(value), Number.isInteger(Number(value) * 100) ? 0 : 1)}`;
    default: return `${value}`;
  }
}

function tierLabel(tiers) {
  const sorted = [...tiers].sort((a, b) => a - b);
  const isRange = sorted.length > 2 && sorted.every((t, i) => i === 0 || t === sorted[i - 1] + 1);
  if (isRange) return `${sorted[0]}~${sorted[sorted.length - 1]}번째`;
  return `${sorted.join(", ")}번째`;
}

function partLabel(part) {
  const config = MOD_REWARD_CHANNELS[part.channel];
  const label = config.tiered ? `${tierLabel(part.tiers)} ${config.label}` : config.label;
  return part.when ? `${part.when} ${label}` : label;
}

function describePart(reward, part, isActive) {
  const perCompletion = MOD_REWARD_SOURCES[reward.source].perCompletion;
  const config = MOD_REWARD_CHANNELS[part.channel];
  // 여러 차원에 서로 다른 값을 주는 보상은 대표값이 없으니 설명만 보여준다
  const showCurrent = isActive && !(config.tiered && part.effect && part.tiers.length > 1);
  const tierForDisplay = config.tiered ? part.tiers[0] : undefined;
  const current = showCurrent
    ? ` (현재 ${formatChannelValue(part.channel, partValue(reward, part, tierForDisplay))})`
    : "";

  if (part.text) return `${part.text}${current}`;
  if (perCompletion) return `${partLabel(part)} 완료당 ${formatChannelValue(part.channel, part.value)}${current}`;
  return `${partLabel(part)} ${formatChannelValue(part.channel, part.value)}`;
}

export const ModRewards = {
  channels: MOD_REWARD_CHANNELS,
  sources: MOD_REWARD_SOURCES,
  list: rewardList,
  upgradeList: upgradeRewardList,
  studyList: studyRewardList,

  // 보너스 보상(업적/챌린지)이 켜져 있는지. 모드 업그레이드는 ADMod.modUpgrades로 따로 켜고 끈다.
  get isEnabled() {
    return isSourceEnabled("achievement");
  },
  isSourceEnabled,

  invalidate() {
    cache.clear();
  },

  // 패치된 게임 계산식이 쓰는 값들
  decimal(channel, tier) {
    return channelTotal(channel, tier);
  },
  number(channel) {
    return channelTotal(channel);
  },
  sum(channel) {
    return channelTotal(channel);
  },
  max(channel) {
    return channelTotal(channel);
  },

  find(source, id) {
    return rewardIndex.get(`${source}${id}`);
  },
  isActive(reward) {
    return isRewardActive(reward);
  },
  title(reward) {
    return MOD_REWARD_SOURCES[reward.source].title(reward.id);
  },
  // 켜져 있는지와 관계없이 첫 번째 효과의 지금 값 (모드 시간 연구 버튼의 "현재 값" 표시용)
  potentialValue(source, id) {
    const reward = rewardIndex.get(`${source}${id}`);
    const part = reward.parts[0];
    return partValue(reward, part, MOD_REWARD_CHANNELS[part.channel].tiered ? part.tiers[0] : undefined);
  },
  describe(reward) {
    const isActive = isSourceEnabled(reward.source) && isRewardActive(reward);
    return reward.parts.map(part => describePart(reward, part, isActive)).join(", ");
  },
  formatChannelValue,
};
