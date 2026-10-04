// [AD Mod] 모드 업그레이드: 조건을 달성하면 해금되는 일회성 업그레이드
// 해금 상태는 세이브(player.adMod.upgradeBits)에 저장되어 내보내기/가져오기와 함께 움직이고,
// 하드 리셋하면 같이 초기화된다. 효과 계산은 ModRewards 엔진이 맡는다.

import { modUpgrades } from "./secret-formula/mod-upgrades";

const ROW_NAMES = ["반물질", "무한 초반", "무한 후반", "영원 초반", "영원 후반", "시간 팽창"];

const upgradesById = new Map(modUpgrades.map(upgrade => [upgrade.id, upgrade]));

// 이벤트별로 검사할 업그레이드를 묶어 둔다
const upgradesByEvent = new Map();
for (const upgrade of modUpgrades) {
  const events = Array.isArray(upgrade.checkEvent) ? upgrade.checkEvent : [upgrade.checkEvent];
  for (const event of events) {
    if (!upgradesByEvent.has(event)) upgradesByEvent.set(event, []);
    upgradesByEvent.get(event).push(upgrade);
  }
}

function unlockedBits() {
  return player.adMod?.upgradeBits ?? 0;
}

export const ModUpgrades = {
  list: modUpgrades,
  rowNames: ROW_NAMES,

  byId(id) {
    return upgradesById.get(id);
  },

  isUnlocked(id) {
    return (unlockedBits() & (1 << id)) !== 0;
  },

  get unlockedCount() {
    return modUpgrades.countWhere(upgrade => this.isUnlocked(upgrade.id));
  },

  // 아직 해금하지 않았고, 이번 판에서는 더 이상 조건을 채울 수 없는 상태인지 (화면 표시용)
  hasFailed(upgrade) {
    return !this.isUnlocked(upgrade.id) && upgrade.hasFailed !== undefined && upgrade.hasFailed();
  },

  unlock(id) {
    if (this.isUnlocked(id)) return;
    if (player.adMod === undefined) player.adMod = { upgradeBits: 0 };
    player.adMod.upgradeBits |= 1 << id;
    ModRewards.invalidate();
    GameUI.notify.success(`모드 업그레이드 해금: ${upgradesById.get(id).name}`, 6000);
  },

  check(event) {
    // 스피드런 기록이 오염되지 않도록 스피드런 중에는 해금하지 않는다
    if (ADMod.isSuspended) return;
    for (const upgrade of upgradesByEvent.get(event)) {
      if (!this.isUnlocked(upgrade.id) && upgrade.checkRequirement()) this.unlock(upgrade.id);
    }
  },
};

for (const event of upgradesByEvent.keys()) {
  EventHub.logic.on(event, () => ModUpgrades.check(event));
}
