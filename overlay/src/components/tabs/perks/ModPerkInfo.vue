<script>
// [AD Mod] 퍽 탭의 퍽 정보 칸
// 마우스를 올리거나 탭한 퍽의 설명과 상태를 보여준다. 휴대폰처럼 마우스를 올릴 수 없는 화면에서는
// 첫 탭으로 퍽을 고르고(설명 표시), 같은 퍽을 한 번 더 탭하면 산다.

const FAMILY_NAMES = {
  ANTIMATTER: "반물질",
  INFINITY: "무한",
  ETERNITY: "영원",
  DILATION: "시간 팽창",
  REALITY: "현실",
  AUTOMATION: "자동화",
  ACHIEVEMENT: "업적",
};

export default {
  name: "ModPerkInfo",
  data() {
    return {
      hasSelection: false,
      label: "",
      familyName: "",
      description: "",
      effect: "",
      automatorPoints: 0,
      isModPerk: false,
      state: "",
      canBuy: false,
      isBought: false,
      isTouchMode: false,
      modBought: 0,
      modEnabled: true,
    };
  },
  computed: {
    modCount() {
      return ModPerks.count;
    },
    hint() {
      return this.isTouchMode
        ? "퍽을 탭하면 설명이 나오고, 같은 퍽을 한 번 더 탭하면 삽니다."
        : "퍽에 마우스를 올리면 설명이 나오고, 클릭하면 삽니다.";
    }
  },
  methods: {
    update() {
      this.modBought = ModPerks.boughtCount;
      this.modEnabled = ModPerks.isEnabled;
      this.isTouchMode = PerkNetwork.isTouchMode;
      const id = PerkNetwork.selectedPerkId;
      const perk = id === undefined ? undefined : Perks.find(id);
      this.hasSelection = perk !== undefined;
      if (perk === undefined) return;
      this.label = perk.label;
      this.familyName = FAMILY_NAMES[perk.config.family] ?? perk.config.family;
      this.description = perk.config.description;
      this.automatorPoints = perk.automatorPoints;
      this.isModPerk = perk.isModPerk;
      this.isBought = perk.isBought;
      this.canBuy = perk.canBeBought;
      this.effect = perk.isModPerk && perk.canBeApplied ? ModPerks.effectText(perk) : "";
      this.state = this.stateText(perk);
    },
    stateText(perk) {
      if (perk.isBought) return perk.canBeApplied ? "구매함" : "구매함 (지금은 효과 없음)";
      if (perk.isModPerk && !ModPerks.isEnabled) return "모드 퍽이 꺼져 있어 살 수 없음";
      if (!perk.isAvailableForPurchase) return "연결된 퍽을 먼저 사야 함";
      if (!perk.canBeBought) return "퍽 포인트 부족";
      return this.isTouchMode ? "구매 가능 (한 번 더 탭하면 구매, 퍽 포인트 1)" : "구매 가능 (클릭하면 구매, 퍽 포인트 1)";
    }
  }
};
</script>

<template>
  <div class="c-ad-mod-perk-info">
    <div class="c-ad-mod-perk-info__summary">
      별 모양 퍽은 모드 퍽입니다 ({{ formatInt(modBought) }} / {{ formatInt(modCount) }} 구매).
      <span v-if="!modEnabled">지금은 모드 퍽이 꺼져 있습니다 (Options → Mod).</span>
      <br>
      {{ hint }}
    </div>
    <div
      v-if="hasSelection"
      class="c-ad-mod-perk-info__card"
      :class="{
        'c-ad-mod-perk-info__card--bought': isBought,
        'c-ad-mod-perk-info__card--buyable': canBuy
      }"
    >
      <div class="c-ad-mod-perk-info__title">
        <b>{{ label }}</b>
        <span class="c-ad-mod-perk-info__family">
          {{ familyName }}{{ isModPerk ? " · 모드 퍽" : "" }}
        </span>
      </div>
      <div>{{ description }}</div>
      <div v-if="automatorPoints > 0">
        오토메이터 포인트 +{{ formatInt(automatorPoints) }}
      </div>
      <div v-if="effect">
        <b>지금 효과:</b> {{ effect }}
      </div>
      <div class="c-ad-mod-perk-info__state">
        {{ state }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.c-ad-mod-perk-info {
  width: 100%;
  max-width: 80rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.c-ad-mod-perk-info__summary {
  margin-bottom: 0.6rem;
  font-size: 1.2rem;
}

.c-ad-mod-perk-info__card {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-height: 9rem;
  border: 0.2rem solid var(--color-text);
  border-radius: 0.5rem;
  padding: 0.6rem 1rem;
  text-align: left;
  background-color: var(--color-base);
}

.c-ad-mod-perk-info__card--buyable {
  border-color: var(--color-reality);
}

.c-ad-mod-perk-info__card--bought {
  border-color: var(--color-good);
}

.c-ad-mod-perk-info__family {
  margin-left: 0.6rem;
  opacity: 0.8;
}

.c-ad-mod-perk-info__state {
  margin-top: auto;
  font-weight: bold;
}
</style>
