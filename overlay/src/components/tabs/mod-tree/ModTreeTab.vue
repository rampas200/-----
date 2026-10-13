<script>
// [AD Mod] 반물질 나무 탭: 나무 그림, 성장, 물 주기, 양분(가지) 배분, 이정표 열매
import PrimaryButton from "@/components/PrimaryButton";

const GROUND_Y = 210;
const CENTER_X = 100;

function timeText(seconds) {
  if (!Number.isFinite(seconds)) return "멈춤";
  return TimeSpan.fromSeconds(Math.max(seconds, 0)).toStringShort();
}

export default {
  name: "ModTreeTab",
  components: {
    PrimaryButton
  },
  data() {
    return {
      isEnabled: true,
      level: 0,
      growth: 0,
      cost: 1,
      totalGrowth: 0,
      rate: 0,
      baseRateMult: 1,
      stageMult: 1,
      milestoneMult: 1,
      upgradeMult: 1,
      questMult: 1,
      waterMult: 2,
      waterDuration: 60000,
      autoWater: false,
      secondsToNext: Infinity,
      isWatered: false,
      waterTimeLeft: 0,
      waterCooldown: 0,
      canWater: false,
      levelEffect: "",
      availablePoints: 0,
      branches: [],
      milestones: [],
      stages: [],
    };
  },
  computed: {
    growthPercent() {
      return Math.min(100 * this.growth / this.cost, 100);
    },
    waterText() {
      if (this.isWatered) {
        return `물을 머금는 중: 성장 ${formatX(this.waterMult)} (${timeText(this.waterTimeLeft / 1000)} 남음)`;
      }
      const auto = this.autoWater ? " (자동)" : "";
      if (this.waterCooldown > 0) return `다시 물 주기까지 ${timeText(this.waterCooldown / 1000)}${auto}`;
      return `물 주기: ${timeText(this.waterDuration / 1000)} 동안 성장 ${formatX(this.waterMult)}${auto}`;
    },
    // ---- 나무 그림 ----
    shownLevel() {
      return Math.min(this.level, 60);
    },
    trunkHeight() {
      return 40 + 2 * this.shownLevel;
    },
    trunkTop() {
      return GROUND_Y - this.trunkHeight;
    },
    trunkPoints() {
      const width = 6 + 0.2 * this.shownLevel;
      return [
        `${CENTER_X - width / 2},${GROUND_Y}`, `${CENTER_X + width / 2},${GROUND_Y}`,
        `${CENTER_X + width / 5},${this.trunkTop}`, `${CENTER_X - width / 5},${this.trunkTop}`,
      ].join(" ");
    },
    canopyRadius() {
      return 8 + 0.6 * Math.min(this.level, 80);
    },
    branchShapes() {
      return this.branches
        .filter(branch => branch.points > 0)
        .map(branch => {
          const index = branch.id - 1;
          const shown = Math.min(branch.points, 25);
          const side = index % 2 === 0 ? -1 : 1;
          const startY = GROUND_Y - this.trunkHeight * (0.3 + 0.12 * index);
          const length = 12 + 2 * shown;
          const angle = Math.PI / 5;
          return {
            id: branch.id,
            color: branch.color,
            x1: CENTER_X, y1: startY,
            x2: CENTER_X + side * length * Math.cos(angle), y2: startY - length * Math.sin(angle),
            width: 2 + shown * 0.15,
            leaf: 4 + shown * 0.3,
          };
        });
    },
    fruitShapes() {
      const reached = this.milestones.filter(milestone => milestone.reached);
      // 수관 위쪽 반원에 고르게 매단다
      const radius = this.canopyRadius * 0.7;
      return reached.map((milestone, index) => {
        const angle = Math.PI * (1 + (index + 1) / (reached.length + 1));
        return {
          level: milestone.level,
          x: CENTER_X + radius * Math.cos(angle),
          y: this.trunkTop + radius * Math.sin(angle),
        };
      });
    }
  },
  methods: {
    update() {
      this.isEnabled = ModTree.isEnabled;
      this.level = ModTree.level;
      this.growth = ModTree.growth;
      this.cost = ModTree.levelCost();
      this.totalGrowth = ModTree.totalGrowth;
      this.rate = ModTree.growthPerSecond;
      this.baseRateMult = ModTree.baseRateMultiplier;
      this.stageMult = ModTree.stageMultiplier;
      this.milestoneMult = ModTree.milestoneMultiplier;
      this.upgradeMult = ModTree.upgradeMultiplier;
      this.questMult = ModTree.questMultiplier;
      this.waterMult = ModTree.waterMult;
      this.waterDuration = ModTree.waterDurationMs;
      this.autoWater = ModTree.hasAutoWater;
      this.secondsToNext = ModTree.secondsToNextLevel;
      this.isWatered = ModTree.isWatered;
      this.waterTimeLeft = ModTree.waterTimeLeft;
      this.waterCooldown = ModTree.waterCooldown;
      this.canWater = ModTree.canWater;
      this.levelEffect = formatX(Decimal.pow(ModTree.growthConfig.levelADMult, this.level), 2, 2);
      this.availablePoints = ModTree.availablePoints;
      this.branches = ModTree.branches.map(branch => ({
        id: branch.id,
        name: branch.name,
        color: branch.color,
        perPoint: branch.perPoint,
        unlockText: branch.unlockText,
        isUnlocked: branch.isUnlocked(),
        points: ModTree.branchPoints(branch.id),
        canInvest: ModTree.canInvest(branch.id),
        effect: ModRewards.describe(ModRewards.find("tree", branch.id)),
      }));
      this.milestones = ModTree.milestones.map(milestone => ({
        level: milestone.level,
        text: milestone.text,
        reached: this.level >= milestone.level,
      }));
      this.stages = ModTree.stages.map(stage => ({ name: stage.name, reached: stage.isReached() }));
    },
    water() {
      ModTree.water();
    },
    invest(id, amount) {
      ModTree.invest(id, amount);
    },
    respec() {
      ModTree.respec();
    },
    growthConfigStageBonus() {
      return ModTree.growthConfig.stageBonus;
    },
    timeText,
  }
};
</script>

<template>
  <div class="c-ad-mod-tree">
    <div class="c-ad-mod-tree__intro">
      반물질 나무는 <b>게임 전체에 걸쳐 아주 천천히</b> 자랍니다. 무한·영원·현실 어떤 리셋에도 초기화되지 않고,
      게임을 꺼 둔 동안에도 자랍니다 (모드 게임 속도는 적용되지 않습니다).
      <div
        v-if="!isEnabled"
        class="c-ad-mod-tree__warning"
      >
        지금은 나무가 자라지 않고 효과도 없습니다 (스피드런 중이거나 Options → Mod에서 꺼져 있음).
      </div>
    </div>

    <div class="c-ad-mod-tree__top">
      <svg
        class="c-ad-mod-tree__picture"
        viewBox="0 0 200 220"
        role="img"
        :aria-label="`반물질 나무 레벨 ${level}`"
      >
        <line
          x1="10"
          :y1="210"
          x2="190"
          :y2="210"
          class="c-ad-mod-tree__ground"
        />
        <circle
          v-if="level > 0"
          :cx="100"
          :cy="trunkTop"
          :r="canopyRadius"
          class="c-ad-mod-tree__canopy"
        />
        <polygon
          :points="trunkPoints"
          class="c-ad-mod-tree__trunk"
        />
        <g
          v-for="shape in branchShapes"
          :key="shape.id"
        >
          <line
            :x1="shape.x1"
            :y1="shape.y1"
            :x2="shape.x2"
            :y2="shape.y2"
            :stroke="shape.color"
            :stroke-width="shape.width"
            stroke-linecap="round"
          />
          <circle
            :cx="shape.x2"
            :cy="shape.y2"
            :r="shape.leaf"
            :fill="shape.color"
            fill-opacity="0.75"
          />
        </g>
        <circle
          v-for="fruit in fruitShapes"
          :key="fruit.level"
          :cx="fruit.x"
          :cy="fruit.y"
          r="3.5"
          class="c-ad-mod-tree__fruit"
        />
      </svg>

      <div class="c-ad-mod-tree__status">
        <div class="c-ad-mod-tree__level">
          레벨 {{ formatInt(level) }}
        </div>
        <div class="c-ad-mod-tree__bar">
          <div
            class="c-ad-mod-tree__bar-fill"
            :style="{ width: `${growthPercent}%` }"
          />
        </div>
        <div>
          성장도 {{ format(growth, 2, 1) }} / {{ format(cost, 2, 1) }}
          (다음 레벨까지 {{ timeText(secondsToNext) }})
        </div>
        <div>
          성장 속도: 초당 {{ format(rate, 2, 2) }}{{ isWatered ? ` (물 주기 ${formatX(waterMult)} 포함)` : "" }}
        </div>
        <div class="c-ad-mod-tree__breakdown">
          진행 단계 {{ formatX(stageMult, 2, 2) }} · 열매 {{ formatX(milestoneMult, 2, 2) }} ·
          나무 업그레이드 {{ formatX(upgradeMult, 2, 2) }} · 도전과제 {{ formatX(questMult, 2, 2) }}
          = {{ formatX(baseRateMult, 2, 2) }}
        </div>
        <div>지금까지 자란 양: {{ format(totalGrowth, 2, 1) }}</div>
        <div>레벨 효과: 모든 반물질 차원 {{ levelEffect }}</div>
        <PrimaryButton
          class="c-ad-mod-tree__water"
          :enabled="canWater"
          @click="water"
        >
          {{ waterText }}
        </PrimaryButton>
        <div class="c-ad-mod-tree__stages">
          성장 속도를 올리는 진행 단계 (하나마다 +{{ formatPercents(growthConfigStageBonus(), 0) }}):
          <span
            v-for="stage in stages"
            :key="stage.name"
            :class="{ 'c-ad-mod-tree__stage--reached': stage.reached }"
            class="c-ad-mod-tree__stage"
          >
            {{ stage.name }}
          </span>
        </div>
      </div>
    </div>

    <div class="c-ad-mod-tree__section">
      <div class="c-ad-mod-tree__section-title">
        가지 (남은 양분 {{ formatInt(availablePoints) }}개 · 레벨 1마다 양분 1개)
        <PrimaryButton
          class="c-ad-mod-tree__respec"
          @click="respec"
        >
          가지치기 (양분 모두 돌려받기)
        </PrimaryButton>
      </div>
      <div class="c-ad-mod-tree__branches">
        <div
          v-for="branch in branches"
          :key="branch.id"
          class="c-ad-mod-tree__branch"
          :class="{ 'c-ad-mod-tree__branch--locked': !branch.isUnlocked }"
          :style="{ 'border-color': branch.color }"
        >
          <div class="c-ad-mod-tree__branch-name">
            {{ branch.name }} · {{ formatInt(branch.points) }}단계
          </div>
          <div>양분 1개당 {{ branch.perPoint }}</div>
          <div v-if="!branch.isUnlocked">
            잠김: {{ branch.unlockText }}
          </div>
          <div v-else-if="branch.points > 0">
            지금: {{ branch.effect }}
          </div>
          <div class="c-ad-mod-tree__branch-buttons">
            <PrimaryButton
              :enabled="branch.canInvest"
              @click="invest(branch.id, 1)"
            >
              +1
            </PrimaryButton>
            <PrimaryButton
              :enabled="branch.canInvest"
              @click="invest(branch.id, 1e9)"
            >
              모두
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>

    <div class="c-ad-mod-tree__section">
      <div class="c-ad-mod-tree__section-title">
        열매 (이정표)
      </div>
      <div class="c-ad-mod-tree__milestones">
        <div
          v-for="milestone in milestones"
          :key="milestone.level"
          class="c-ad-mod-tree__milestone"
          :class="{ 'c-ad-mod-tree__milestone--reached': milestone.reached }"
        >
          <b>레벨 {{ formatInt(milestone.level) }}</b>: {{ milestone.text }}
          <i :class="milestone.reached ? 'fas fa-apple-whole' : 'fas fa-lock'" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.c-ad-mod-tree {
  max-width: 100rem;
  margin: 0 auto;
  color: var(--color-text);
}

.c-ad-mod-tree__intro {
  margin-bottom: 1rem;
}

.c-ad-mod-tree__warning {
  color: var(--color-bad);
}

.c-ad-mod-tree__top {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.c-ad-mod-tree__picture {
  width: 26rem;
  height: 28.6rem;
  border: 0.2rem solid var(--color-text);
  border-radius: 0.8rem;
  background-color: var(--color-base);
}

.c-ad-mod-tree__ground {
  stroke: #795548;
  stroke-width: 3;
}

.c-ad-mod-tree__trunk {
  fill: #6d4c41;
}

.c-ad-mod-tree__canopy {
  fill: #2e7d32;
  fill-opacity: 0.45;
}

.c-ad-mod-tree__fruit {
  fill: #ff5252;
  stroke: #b71c1c;
  stroke-width: 0.8;
}

.c-ad-mod-tree__status {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 44rem;
  text-align: left;
}

.c-ad-mod-tree__level {
  font-size: 2.4rem;
  font-weight: bold;
}

.c-ad-mod-tree__bar {
  overflow: hidden;
  height: 1.4rem;
  border: 0.1rem solid var(--color-text);
  border-radius: 0.7rem;
}

.c-ad-mod-tree__bar-fill {
  height: 100%;
  background-color: var(--color-good);
}

.c-ad-mod-tree__breakdown {
  font-size: 1.2rem;
  opacity: 0.85;
}

.c-ad-mod-tree__water {
  margin-top: 0.4rem;
}

.c-ad-mod-tree__stages {
  font-size: 1.2rem;
}

.c-ad-mod-tree__stage {
  display: inline-block;
  margin: 0.2rem;
  border: 0.1rem solid var(--color-text);
  border-radius: 0.4rem;
  padding: 0 0.4rem;
  opacity: 0.5;
}

.c-ad-mod-tree__stage--reached {
  border-color: var(--color-good);
  opacity: 1;
}

.c-ad-mod-tree__section {
  margin-bottom: 1.5rem;
}

.c-ad-mod-tree__section-title {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.6rem;
  font-weight: bold;
}

.c-ad-mod-tree__branches {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.6rem;
}

.c-ad-mod-tree__branch {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  border: 0.2rem solid;
  border-radius: 0.5rem;
  padding: 0.6rem;
  font-size: 1.1rem;
  text-align: left;
  background-color: var(--color-base);
}

.c-ad-mod-tree__branch--locked {
  opacity: 0.5;
}

.c-ad-mod-tree__branch-name {
  font-size: 1.3rem;
  font-weight: bold;
}

.c-ad-mod-tree__branch-buttons {
  display: flex;
  gap: 0.4rem;
  margin-top: auto;
}

.c-ad-mod-tree__milestones {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
}

.c-ad-mod-tree__milestone {
  border: 0.1rem solid var(--color-text);
  border-radius: 0.4rem;
  padding: 0.4rem;
  font-size: 1.1rem;
  opacity: 0.6;
}

.c-ad-mod-tree__milestone--reached {
  border-color: var(--color-good);
  opacity: 1;
}
</style>
