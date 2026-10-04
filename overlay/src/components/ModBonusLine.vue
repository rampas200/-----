<script>
// [AD Mod] 업적 툴팁과 챌린지 상자에 붙는 "모드 보너스" 한 줄
export default {
  name: "ModBonusLine",
  props: {
    source: {
      type: String,
      required: true
    },
    rewardId: {
      type: Number,
      required: true
    },
    // 챌린지 상자처럼 공간이 좁은 곳에서는 메모를 숨긴다
    compact: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      isEnabled: false,
      isActive: false,
      description: "",
      note: "",
    };
  },
  methods: {
    update() {
      const reward = ModRewards.find(this.source, this.rewardId);
      this.isEnabled = reward !== undefined && ModRewards.isEnabled;
      if (!this.isEnabled) return;
      this.isActive = ModRewards.isActive(reward);
      this.description = ModRewards.describe(reward);
      this.note = reward.note;
    }
  }
};
</script>

<template>
  <div
    v-if="isEnabled"
    class="c-ad-mod-bonus"
    :class="{ 'c-ad-mod-bonus--inactive': !isActive }"
  >
    <b>모드 보너스:</b> {{ description }}
    <div
      v-if="!compact"
      class="c-ad-mod-bonus__note"
    >
      {{ note }}
    </div>
  </div>
</template>

<style scoped>
.c-ad-mod-bonus {
  margin-top: 0.3rem;
  color: var(--color-accent);
}

.c-ad-mod-bonus--inactive {
  opacity: 0.75;
}

.c-ad-mod-bonus__note {
  font-style: italic;
  opacity: 0.85;
}
</style>

<style>
/* [AD Mod] 챌린지 상자는 높이가 고정되어 있어서, 보너스 줄이 보일 때만 그만큼 늘린다 */
.c-challenge-box.c-challenge-box--normal:has(.c-ad-mod-bonus) {
  height: 15rem;
}

.c-challenge-box.c-challenge-box--infinity:has(.c-ad-mod-bonus),
.c-challenge-box.c-challenge-box--eternity:has(.c-ad-mod-bonus) {
  height: 20.5rem;
}

.l-challenge-box__bottom--infinity:has(.c-ad-mod-bonus) {
  height: auto;
  min-height: 5.5rem;
}
</style>
