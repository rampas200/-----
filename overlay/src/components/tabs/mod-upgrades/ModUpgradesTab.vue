<script>
// [AD Mod] 업적 탭 > Mod Upgrades: 조건을 달성하면 해금되는 일회성 업그레이드 목록

// 30개 카드를 매 틱 다시 만들 필요는 없으니 몇 틱에 한 번만 갱신한다
const REFRESH_EVERY_UPDATES = 5;

export default {
  name: "ModUpgradesTab",
  data() {
    return {
      rows: [],
      unlockedCount: 0,
      isEnabled: true,
      isSuspended: false,
      updateCount: 0,
    };
  },
  computed: {
    totalCount() {
      return ModUpgrades.list.length;
    }
  },
  methods: {
    update() {
      this.isEnabled = ADMod.modUpgrades;
      this.isSuspended = ADMod.isSuspended;
      if (this.updateCount++ % REFRESH_EVERY_UPDATES !== 0) return;
      this.refresh();
    },
    refresh() {
      const rows = ModUpgrades.rowNames.map((name, index) => ({ key: index + 1, name, cards: [] }));
      for (const upgrade of ModUpgrades.list) {
        const isUnlocked = ModUpgrades.isUnlocked(upgrade.id);
        rows[upgrade.row - 1].cards.push({
          id: upgrade.id,
          name: upgrade.name,
          requirement: upgrade.requirement(),
          effect: ModRewards.describe(ModRewards.find("upgrade", upgrade.id)),
          note: upgrade.note,
          isUnlocked,
          hasFailed: ModUpgrades.hasFailed(upgrade),
        });
      }
      this.rows = rows;
      this.unlockedCount = ModUpgrades.unlockedCount;
    },
    cardClass(card) {
      return {
        "c-ad-mod-upgrade--unlocked": card.isUnlocked,
        "c-ad-mod-upgrade--failed": card.hasFailed,
      };
    }
  }
};
</script>

<template>
  <div class="c-ad-mod-upgrades">
    <div class="c-ad-mod-upgrades__header">
      현실의 일회성 업그레이드처럼 <b>조건을 달성하면 바로 해금</b>되는 업그레이드입니다.
      구매할 필요가 없고, 한 번 해금되면 영구적입니다.
      <br>
      해금: {{ formatInt(unlockedCount) }} / {{ formatInt(totalCount) }}
      <div v-if="isSuspended">
        스피드런 중에는 해금도, 효과도 멈춥니다.
      </div>
      <div v-else-if="!isEnabled">
        모드 업그레이드 효과가 꺼져 있습니다. 해금 기록은 그대로 남습니다. (Options → Mod에서 켜기)
      </div>
    </div>

    <div
      v-for="row in rows"
      :key="row.key"
      class="c-ad-mod-upgrades__row"
    >
      <div class="c-ad-mod-upgrades__row-name">
        {{ row.key }}단계 · {{ row.name }}
      </div>
      <div class="c-ad-mod-upgrades__grid">
        <div
          v-for="card in row.cards"
          :key="card.id"
          class="c-ad-mod-upgrade"
          :class="cardClass(card)"
        >
          <div class="c-ad-mod-upgrade__name">
            {{ card.name }}
          </div>
          <div class="c-ad-mod-upgrade__line">
            <b>조건:</b> {{ card.requirement }}
            <span
              v-if="card.hasFailed"
              class="c-ad-mod-upgrade__failed"
            >
              (이번 판에서는 실패)
            </span>
          </div>
          <div class="c-ad-mod-upgrade__line">
            <b>효과:</b> {{ card.effect }}
          </div>
          <div class="c-ad-mod-upgrade__note">
            {{ card.note }}
          </div>
          <div class="c-ad-mod-upgrade__state">
            <i :class="card.isUnlocked ? 'fas fa-check' : 'fas fa-lock'" />
            {{ card.isUnlocked ? "해금됨" : "잠김" }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.c-ad-mod-upgrades {
  max-width: 104rem;
  margin: 0 auto;
  color: var(--color-text);
}

.c-ad-mod-upgrades__header {
  margin-bottom: 1rem;
}

.c-ad-mod-upgrades__row {
  margin-bottom: 1.2rem;
}

.c-ad-mod-upgrades__row-name {
  margin-bottom: 0.4rem;
  font-weight: bold;
  text-align: left;
}

.c-ad-mod-upgrades__grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.6rem;
}

.c-ad-mod-upgrade {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  border: 0.2rem solid var(--color-bad);
  border-radius: 0.5rem;
  padding: 0.6rem;
  font-size: 1.1rem;
  text-align: left;
  background-color: var(--color-base);
}

.c-ad-mod-upgrade--unlocked {
  border-color: var(--color-good);
}

.c-ad-mod-upgrade--failed {
  opacity: 0.6;
}

.c-ad-mod-upgrade__name {
  font-size: 1.3rem;
  font-weight: bold;
  text-align: center;
}

.c-ad-mod-upgrade__failed {
  color: var(--color-bad);
}

.c-ad-mod-upgrade__note {
  font-style: italic;
  opacity: 0.8;
}

.c-ad-mod-upgrade__state {
  margin-top: auto;
  text-align: center;
  font-weight: bold;
}

.c-ad-mod-upgrade--unlocked .c-ad-mod-upgrade__state {
  color: var(--color-good);
}
</style>
