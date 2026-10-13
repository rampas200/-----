<script>
// [AD Mod] 반물질 나무 > 나무 도전과제: 조건을 달성하면 영구히 완료되고 성장 속도가 오른다
export default {
  name: "ModTreeQuestsTab",
  data() {
    return {
      isEnabled: true,
      quests: [],
      doneCount: 0,
      questMult: 1,
    };
  },
  computed: {
    totalCount() {
      return ModTree.quests.length;
    }
  },
  methods: {
    update() {
      this.isEnabled = ModTree.isEnabled;
      this.doneCount = ModTree.doneQuestCount;
      this.questMult = ModTree.questMultiplier;
      this.quests = ModTree.quests.map(quest => {
        const isDone = ModTree.isQuestDone(quest.id);
        return {
          id: quest.id,
          name: quest.name,
          text: quest.text,
          bonus: formatPercents(quest.bonus, 0),
          isDone,
          progress: !isDone && quest.progress ? quest.progress() : "",
        };
      });
    }
  }
};
</script>

<template>
  <div class="c-ad-mod-tree-quests">
    <div class="c-ad-mod-tree-quests__header">
      조건을 달성하면 <b>자동으로 완료</b>되고, 완료한 도전과제마다 나무 성장 속도가 영구히 오릅니다 (서로 더해짐).
      <br>
      완료: {{ formatInt(doneCount) }} / {{ formatInt(totalCount) }} ·
      도전과제로 늘어난 성장 속도 {{ formatX(questMult, 2, 2) }}
      <div
        v-if="!isEnabled"
        class="c-ad-mod-tree-quests__warning"
      >
        지금은 반물질 나무가 꺼져 있어 도전과제를 확인하지 않습니다.
      </div>
    </div>
    <div class="c-ad-mod-tree-quests__grid">
      <div
        v-for="quest in quests"
        :key="quest.id"
        class="c-ad-mod-tree-quest"
        :class="{ 'c-ad-mod-tree-quest--done': quest.isDone }"
      >
        <div class="c-ad-mod-tree-quest__name">
          <i :class="quest.isDone ? 'fas fa-check' : 'fas fa-seedling'" />
          {{ quest.name }}
        </div>
        <div>{{ quest.text }}</div>
        <div v-if="quest.progress">
          진행: {{ quest.progress }}
        </div>
        <div class="c-ad-mod-tree-quest__reward">
          성장 속도 +{{ quest.bonus }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.c-ad-mod-tree-quests {
  max-width: 100rem;
  margin: 0 auto;
  color: var(--color-text);
}

.c-ad-mod-tree-quests__header {
  margin-bottom: 1rem;
}

.c-ad-mod-tree-quests__warning {
  color: var(--color-bad);
}

.c-ad-mod-tree-quests__grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.6rem;
}

.c-ad-mod-tree-quest {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  border: 0.2rem solid var(--color-text);
  border-radius: 0.5rem;
  padding: 0.6rem;
  font-size: 1.15rem;
  text-align: left;
  opacity: 0.65;
  background-color: var(--color-base);
}

.c-ad-mod-tree-quest--done {
  border-color: var(--color-good);
  opacity: 1;
}

.c-ad-mod-tree-quest__name {
  font-size: 1.3rem;
  font-weight: bold;
}

.c-ad-mod-tree-quest__reward {
  margin-top: auto;
  font-weight: bold;
}
</style>
