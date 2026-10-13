<script>
// [AD Mod] 반물질 나무 > 나무 업그레이드: 각 단계의 재화로 한 번 사면 영구히 성장 속도를 올린다
import PrimaryButton from "@/components/PrimaryButton";

export default {
  name: "ModTreeUpgradesTab",
  components: {
    PrimaryButton
  },
  data() {
    return {
      isEnabled: true,
      rows: [],
      boughtCount: 0,
      upgradeMult: 1,
    };
  },
  computed: {
    totalCount() {
      return ModTree.upgrades.length;
    }
  },
  methods: {
    update() {
      this.isEnabled = ModTree.isEnabled;
      this.boughtCount = ModTree.boughtUpgradeCount;
      this.upgradeMult = ModTree.upgradeMultiplier;
      this.rows = ModTree.upgradeRows.map((row, index) => ({
        name: row.name,
        currencyName: row.currencyName,
        cards: ModTree.upgrades
          .filter(upgrade => upgrade.row === index)
          .map(upgrade => ({
            id: upgrade.id,
            name: upgrade.name,
            text: upgrade.text,
            cost: format(upgrade.cost, 2, 0),
            isBought: ModTree.isUpgradeBought(upgrade.id),
            canBuy: ModTree.canBuyUpgrade(upgrade.id),
            current: typeof upgrade.growthMult === "function" ? formatX(upgrade.growthMult(), 2, 2) : "",
          })),
      }));
    },
    buy(id) {
      ModTree.buyUpgrade(id);
    }
  }
};
</script>

<template>
  <div class="c-ad-mod-tree-upgrades">
    <div class="c-ad-mod-tree-upgrades__header">
      각 단계의 재화로 사는 <b>영구 업그레이드</b>입니다. 무한·영원·현실을 해도 사라지지 않습니다.
      <br>
      구매: {{ formatInt(boughtCount) }} / {{ formatInt(totalCount) }} ·
      업그레이드로 늘어난 성장 속도 {{ formatX(upgradeMult, 2, 2) }}
      <div
        v-if="!isEnabled"
        class="c-ad-mod-tree-upgrades__warning"
      >
        지금은 반물질 나무가 꺼져 있어 살 수 없습니다.
      </div>
    </div>
    <div
      v-for="row in rows"
      :key="row.name"
      class="c-ad-mod-tree-upgrades__row"
    >
      <div class="c-ad-mod-tree-upgrades__row-name">
        {{ row.name }} ({{ row.currencyName }}로 구매)
      </div>
      <div class="c-ad-mod-tree-upgrades__grid">
        <div
          v-for="card in row.cards"
          :key="card.id"
          class="c-ad-mod-tree-upgrade"
          :class="{ 'c-ad-mod-tree-upgrade--bought': card.isBought }"
        >
          <div class="c-ad-mod-tree-upgrade__name">
            {{ card.name }}
          </div>
          <div>{{ card.text }}</div>
          <div v-if="card.current">
            지금 {{ card.current }}
          </div>
          <PrimaryButton
            v-if="!card.isBought"
            class="c-ad-mod-tree-upgrade__buy"
            :enabled="card.canBuy"
            @click="buy(card.id)"
          >
            {{ card.cost }} {{ row.currencyName }}
          </PrimaryButton>
          <div
            v-else
            class="c-ad-mod-tree-upgrade__state"
          >
            <i class="fas fa-check" /> 구매함
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.c-ad-mod-tree-upgrades {
  max-width: 90rem;
  margin: 0 auto;
  color: var(--color-text);
}

.c-ad-mod-tree-upgrades__header {
  margin-bottom: 1rem;
}

.c-ad-mod-tree-upgrades__warning {
  color: var(--color-bad);
}

.c-ad-mod-tree-upgrades__row {
  margin-bottom: 1rem;
}

.c-ad-mod-tree-upgrades__row-name {
  margin-bottom: 0.4rem;
  font-weight: bold;
  text-align: left;
}

.c-ad-mod-tree-upgrades__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.c-ad-mod-tree-upgrade {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  border: 0.2rem solid var(--color-bad);
  border-radius: 0.5rem;
  padding: 0.6rem;
  font-size: 1.2rem;
  background-color: var(--color-base);
}

.c-ad-mod-tree-upgrade--bought {
  border-color: var(--color-good);
}

.c-ad-mod-tree-upgrade__name {
  font-size: 1.4rem;
  font-weight: bold;
}

.c-ad-mod-tree-upgrade__buy {
  margin-top: auto;
}

.c-ad-mod-tree-upgrade__state {
  margin-top: auto;
  font-weight: bold;
  color: var(--color-good);
}
</style>
