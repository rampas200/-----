<script>
import PrimaryButton from "@/components/PrimaryButton";
import PrimaryToggleButton from "@/components/PrimaryToggleButton";

// [AD Mod] 업적 탭 > Mod Bonuses: 모든 보너스 보상 목록과 채널별 합계
const FILTERS = [
  { key: "all", label: "전체" },
  { key: "achievement", label: "업적" },
  { key: "secret", label: "비밀 업적" },
  { key: "normalChallenge", label: "일반 챌린지" },
  { key: "infinityChallenge", label: "무한 챌린지" },
  { key: "eternityChallenge", label: "영원 챌린지" },
];

// 목록 전체를 매 틱 다시 만들면 무거우니 몇 틱에 한 번만 갱신한다
const REFRESH_EVERY_UPDATES = 10;

export default {
  name: "ModRewardsTab",
  components: {
    PrimaryButton,
    PrimaryToggleButton
  },
  data() {
    return {
      filter: "all",
      onlyActive: false,
      isEnabled: true,
      rows: [],
      totals: [],
      activeCount: 0,
      updateCount: 0,
    };
  },
  computed: {
    filters() {
      return FILTERS;
    },
    totalCount() {
      return ModRewards.list.length;
    },
    visibleRows() {
      return this.rows.filter(row =>
        (this.filter === "all" || row.source === this.filter) && (!this.onlyActive || row.isActive));
    }
  },
  methods: {
    update() {
      this.isEnabled = ModRewards.isEnabled;
      if (this.updateCount++ % REFRESH_EVERY_UPDATES !== 0) return;
      this.refresh();
    },
    refresh() {
      const rows = [];
      let activeCount = 0;
      for (const reward of ModRewards.list) {
        const isActive = ModRewards.isActive(reward);
        if (isActive) activeCount++;
        const isHidden = this.isSpoiler(reward, isActive);
        rows.push({
          key: reward.key,
          source: reward.source,
          sourceLabel: ModRewards.sources[reward.source].label,
          title: isHidden ? "???" : ModRewards.title(reward),
          note: isHidden ? "???" : reward.note,
          description: ModRewards.describe(reward),
          isActive,
        });
      }
      this.rows = rows;
      this.activeCount = activeCount;
      this.totals = this.channelTotals();
    },
    // 아직 못 얻은 비밀 업적과 Pelle 이전의 마지막 줄 업적은 이름/메모를 가린다
    isSpoiler(reward, isActive) {
      if (isActive) return false;
      if (reward.source === "secret") return true;
      return reward.source === "achievement" && reward.id > 180 && !Pelle.isDoomed;
    },
    channelTotals() {
      const totals = [];
      for (const [channel, config] of Object.entries(ModRewards.channels)) {
        if (config.tiered) {
          for (let tier = 1; tier <= 8; tier++) {
            const value = ModRewards.decimal(channel, tier);
            if (value.lte(1)) continue;
            totals.push({ key: `${channel}${tier}`, channel, label: `${tier}번째 ${config.label}`, value });
          }
          continue;
        }
        let value;
        if (config.kind === "decimal") value = ModRewards.decimal(channel);
        else if (config.kind === "number") value = ModRewards.number(channel);
        else value = ModRewards.sum(channel);
        let isNeutral;
        if (config.kind === "decimal") isNeutral = value.lte(1);
        else if (config.kind === "number") isNeutral = value <= 1;
        else isNeutral = value === 0;
        if (!isNeutral) totals.push({ key: channel, channel, label: config.label, value });
      }
      return totals.map(total => ({
        key: total.key,
        text: `${total.label} ${ModRewards.formatChannelValue(total.channel, total.value)}`
      }));
    },
    setFilter(key) {
      this.filter = key;
    }
  }
};
</script>

<template>
  <div class="c-ad-mod-rewards">
    <div class="c-ad-mod-rewards__header">
      모든 업적과 챌린지에는 원래 보상 외에 <b>모드 보너스</b>가 하나씩 더 붙어 있습니다.
      <br>
      받은 보너스: {{ formatInt(activeCount) }} / {{ formatInt(totalCount) }}
      <div v-if="!isEnabled">
        보너스 보상이 꺼져 있습니다. (Options → Mod에서 켜기. 스피드런 중에는 자동으로 꺼집니다.)
      </div>
    </div>

    <div
      v-if="totals.length > 0"
      class="c-ad-mod-rewards__totals"
    >
      <b>현재 받고 있는 효과 합계</b>
      <div class="c-ad-mod-rewards__total-list">
        <span
          v-for="total in totals"
          :key="total.key"
          class="c-ad-mod-rewards__total"
        >
          {{ total.text }}
        </span>
      </div>
    </div>

    <div class="c-ad-mod-rewards__filters">
      <PrimaryButton
        v-for="option in filters"
        :key="option.key"
        class="o-primary-btn--subtab-option c-ad-mod-rewards__filter"
        :class="{ 'c-ad-mod-rewards__filter--selected': filter === option.key }"
        @click="setFilter(option.key)"
      >
        {{ option.label }}
      </PrimaryButton>
      <PrimaryToggleButton
        v-model="onlyActive"
        class="o-primary-btn--subtab-option"
        label="받은 것만:"
        on="예"
        off="아니오"
      />
    </div>

    <table class="c-ad-mod-rewards__table">
      <tr
        v-for="row in visibleRows"
        :key="row.key"
        :class="{ 'c-ad-mod-rewards__row--inactive': !row.isActive }"
      >
        <td class="c-ad-mod-rewards__source">
          {{ row.sourceLabel }}
        </td>
        <td class="c-ad-mod-rewards__title">
          {{ row.title }}
          <div class="c-ad-mod-rewards__note">
            {{ row.note }}
          </div>
        </td>
        <td>{{ row.description }}</td>
        <td class="c-ad-mod-rewards__state">
          <i :class="row.isActive ? 'fas fa-check' : 'fas fa-lock'" />
        </td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
.c-ad-mod-rewards {
  max-width: 100rem;
  margin: 0 auto;
  color: var(--color-text);
}

.c-ad-mod-rewards__header,
.c-ad-mod-rewards__totals,
.c-ad-mod-rewards__filters {
  margin-bottom: 1rem;
}

.c-ad-mod-rewards__total-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem 1.2rem;
  margin-top: 0.4rem;
}

.c-ad-mod-rewards__filter {
  margin: 0.2rem;
}

.c-ad-mod-rewards__filter--selected {
  font-weight: bold;
  box-shadow: 0 0 0.5rem var(--color-accent);
}

.c-ad-mod-rewards__total {
  color: var(--color-accent);
}

.c-ad-mod-rewards__table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.c-ad-mod-rewards__table td {
  padding: 0.4rem 0.8rem;
  border-bottom: 0.1rem solid var(--color-text);
  vertical-align: top;
}

.c-ad-mod-rewards__row--inactive {
  opacity: 0.6;
}

.c-ad-mod-rewards__source {
  white-space: nowrap;
}

.c-ad-mod-rewards__title {
  width: 35%;
}

.c-ad-mod-rewards__note {
  font-style: italic;
  opacity: 0.8;
}

.c-ad-mod-rewards__state {
  text-align: center;
}
</style>
