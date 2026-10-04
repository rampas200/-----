// [AD Mod] 보너스 보상 엔진
// 모든 업적/비밀 업적/챌린지에 원래 보상과 별개로 "보너스 보상"을 붙인다.
// 보상 데이터는 secret-formula/mod-rewards.js에 있고, 여기서는
//  1) 각 보상이 지금 켜져 있는지(업적 달성, 챌린지 완료 등) 판단하고
//  2) 같은 채널(예: 틱스피드)에 걸린 보상들을 곱하거나 더해서
//  3) 패치된 게임 계산식이 ModRewards.decimal / number / sum 으로 가져다 쓰게 한다.

import { DC } from "./constants";
import { modRewards } from "./secret-formula/mod-rewards";

// 종류(kind): decimal = Decimal 곱, number = 숫자 곱, sum = 숫자 합
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
};

export const MOD_REWARD_SOURCES = {
  achievement: {
    label: "업적",
    isActive: id => Achievement(id).isEffectActive,
    title: id => `${id}. ${Achievement(id).config.name}`,
  },
  secret: {
    label: "비밀 업적",
    isActive: id => SecretAchievement(id).isUnlocked,
    title: id => `S${id}. ${SecretAchievement(id).config.name}`,
  },
  normalChallenge: {
    label: "일반 챌린지",
    isActive: id => NormalChallenge(id).isCompleted,
    title: id => `C${id}. ${NormalChallenge(id).config.name}`,
  },
  infinityChallenge: {
    label: "무한 챌린지",
    isActive: id => InfinityChallenge(id).isCompleted,
    title: id => `IC${id}`,
  },
  eternityChallenge: {
    label: "영원 챌린지",
    isActive: id => EternityChallenge(id).completions > 0,
    title: id => `EC${id}`,
    // 영원 챌린지 보상은 완료 횟수(0~5)만큼 쌓인다
    perCompletion: true,
  },
};

// 데이터를 { source, id, note, parts } 목록으로 펼치고, 채널별로 묶어 둔다
const rewardList = [];
const byChannel = {};
for (const channel of Object.keys(MOD_REWARD_CHANNELS)) byChannel[channel] = [];

for (const [source, rewards] of Object.entries(modRewards)) {
  for (const [id, entry] of Object.entries(rewards)) {
    const reward = { source, id: Number(id), key: `${source}${id}`, note: entry.note, parts: entry.parts };
    rewardList.push(reward);
    for (const part of reward.parts) {
      byChannel[part.channel].push({ reward, part });
    }
  }
}

const rewardIndex = new Map(rewardList.map(r => [r.key, r]));

function neutralValue(kind) {
  if (kind === "decimal") return DC.D1;
  return kind === "number" ? 1 : 0;
}

// 보상은 절대 불리하게 작용하지 않도록 곱은 1 이상, 합은 0 이상으로 자른다
function sanitize(kind, value) {
  if (kind === "decimal") {
    const decimal = value instanceof Decimal ? value : new Decimal(value);
    if (!Number.isFinite(decimal.mantissa) || decimal.lt(1)) return DC.D1;
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
  return kind === "number" ? total * value : total + value;
}

// 같은 틱 안에서는 값이 바뀌지 않으므로 채널 결과를 틱마다 한 번만 계산한다
const cache = new Map();
EventHub.logic.on(GAME_EVENT.GAME_TICK_BEFORE, () => cache.clear());

function channelTotal(channel, tier) {
  const config = MOD_REWARD_CHANNELS[channel];
  if (!ModRewards.isEnabled) return neutralValue(config.kind);
  const cacheKey = tier === undefined ? channel : `${channel}:${tier}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  let total = neutralValue(config.kind);
  for (const { reward, part } of byChannel[channel]) {
    if (config.tiered && !partAppliesToTier(part, tier)) continue;
    if (!isRewardActive(reward)) continue;
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

  get isEnabled() {
    return ADMod.bonusRewards && !ADMod.isSuspended;
  },

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

  find(source, id) {
    return rewardIndex.get(`${source}${id}`);
  },
  isActive(reward) {
    return isRewardActive(reward);
  },
  title(reward) {
    return MOD_REWARD_SOURCES[reward.source].title(reward.id);
  },
  describe(reward) {
    const isActive = this.isEnabled && isRewardActive(reward);
    return reward.parts.map(part => describePart(reward, part, isActive)).join(", ");
  },
  formatChannelValue,
};
