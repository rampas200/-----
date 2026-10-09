// [AD Mod] 모드 퍽: 현실 퍽 트리의 끝에서 이어지는 퍽
// 퍽 자체는 원래 퍽 데이터베이스에 들어 있다 (secret-formula/reality/mod-perks.js).
// 그래서 구매, 퍽 포인트, 현실 리스펙, 퍽 화면 배치가 원래 퍽과 똑같이 동작한다.

import { modPerkConfigs } from "./secret-formula/reality/mod-perks";

const configs = Object.values(modPerkConfigs);

export const ModPerks = {
  count: configs.length,

  // 꺼져 있거나 스피드런 중이면 살 수 없고 효과도 없다
  get isEnabled() {
    return ADMod.modPerks && !ADMod.isSuspended;
  },

  get list() {
    return configs.map(config => Perks.find(config.id));
  },

  get boughtCount() {
    return configs.countWhere(config => Perks.find(config.id).isBought);
  },

  // 원래 퍽처럼 Pelle의 파멸된 현실에서는 쓸모없는 퍽 (시작 자원, EC 자동 완료, TP 소급 배율)
  pelleUselessIds: configs.filter(config => config.pelleUseless).map(config => config.id),

  // 퍽 정보 칸에 보여줄 효과 설명 (효과 퍽이면 지금 값도 붙인다)
  effectText(perk) {
    const reward = ModRewards.find("perk", perk.id);
    return reward === undefined ? "" : ModRewards.describe(reward);
  },
};
