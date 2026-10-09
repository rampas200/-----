<script>
import OptionsButton from "@/components/OptionsButton";
import PrimaryToggleButton from "@/components/PrimaryToggleButton";
import SliderComponent from "@/components/SliderComponent";

// [AD Mod] 슬라이더 칸마다 대응하는 게임 속도 배율
const GAME_SPEED_STEPS = [1, 2, 3, 5, 10, 20, 50, 100, 200, 500, 1000];

export default {
  name: "OptionsModTab",
  components: {
    OptionsButton,
    PrimaryToggleButton,
    SliderComponent
  },
  data() {
    return {
      gameSpeedIndex: 0,
      productionExponent: 0,
      koreanNews: true,
      bonusRewards: true,
      modUpgrades: true,
      modStudies: true,
      modPerks: true,
      isSuspended: false,
    };
  },
  computed: {
    gameSpeed() {
      return GAME_SPEED_STEPS[this.gameSpeedIndex];
    },
    productionMultiplier() {
      return Decimal.pow10(this.productionExponent);
    },
    sliderPropsGameSpeed() {
      return {
        min: 0,
        max: GAME_SPEED_STEPS.length - 1,
        interval: 1,
        width: "100%",
        tooltip: false
      };
    },
    sliderPropsProduction() {
      return {
        min: AD_MOD_LIMITS.productionExponent.min,
        max: AD_MOD_LIMITS.productionExponent.max,
        interval: 1,
        width: "100%",
        tooltip: false
      };
    },
    modVersion() {
      return `${ADMod.name} v${ADMod.version}`;
    }
  },
  watch: {
    koreanNews(newValue) {
      ADMod.koreanNews = newValue;
    },
    bonusRewards(newValue) {
      ADMod.bonusRewards = newValue;
    },
    modUpgrades(newValue) {
      ADMod.modUpgrades = newValue;
    },
    modStudies(newValue) {
      ADMod.modStudies = newValue;
    },
    modPerks(newValue) {
      ADMod.modPerks = newValue;
    },
  },
  methods: {
    update() {
      this.gameSpeedIndex = this.closestSpeedIndex(ADMod.gameSpeed);
      this.productionExponent = ADMod.productionExponent;
      this.koreanNews = ADMod.koreanNews;
      this.bonusRewards = ADMod.bonusRewards;
      this.modUpgrades = ADMod.modUpgrades;
      this.modStudies = ADMod.modStudies;
      this.modPerks = ADMod.modPerks;
      this.isSuspended = ADMod.isSuspended;
    },
    // 콘솔에서 슬라이더에 없는 값(예: 7)을 넣었을 때도 가장 가까운 칸을 보여준다
    closestSpeedIndex(speed) {
      let best = 0;
      for (let i = 0; i < GAME_SPEED_STEPS.length; i++) {
        if (Math.abs(GAME_SPEED_STEPS[i] - speed) < Math.abs(GAME_SPEED_STEPS[best] - speed)) best = i;
      }
      return best;
    },
    adjustGameSpeed(value) {
      this.gameSpeedIndex = parseInt(value, 10);
      ADMod.gameSpeed = this.gameSpeed;
    },
    adjustProduction(value) {
      this.productionExponent = parseInt(value, 10);
      ADMod.productionExponent = this.productionExponent;
    },
    resetMod() {
      ADMod.reset();
      this.update();
    }
  }
};
</script>

<template>
  <div class="l-options-tab">
    <div class="c-ad-mod-header">
      <b>{{ modVersion }}</b> - 안티매터 디멘션 모드 설정
      <div v-if="isSuspended">
        스피드런 중에는 게임 속도, 생산 배율, 보너스 보상, 모드 업그레이드, 모드 시간 연구, 모드 퍽이 적용되지 않습니다.
      </div>
    </div>
    <div class="l-options-grid">
      <div class="l-options-grid__row">
        <div class="o-primary-btn o-primary-btn--option o-primary-btn--slider l-options-grid__button">
          <b>게임 속도: {{ formatX(gameSpeed, 0, 0) }}</b>
          <SliderComponent
            class="o-primary-btn--slider__slider"
            v-bind="sliderPropsGameSpeed"
            :value="gameSpeedIndex"
            @input="adjustGameSpeed($event)"
          />
        </div>
        <div class="o-primary-btn o-primary-btn--option o-primary-btn--slider l-options-grid__button">
          <b>반물질 차원 생산 배율: {{ formatX(productionMultiplier, 0, 0) }}</b>
          <SliderComponent
            class="o-primary-btn--slider__slider"
            v-bind="sliderPropsProduction"
            :value="productionExponent"
            @input="adjustProduction($event)"
          />
        </div>
        <PrimaryToggleButton
          v-model="koreanNews"
          class="o-primary-btn--option l-options-grid__button"
          label="한국어 뉴스:"
          on="켜짐"
          off="꺼짐"
        />
      </div>
      <div class="l-options-grid__row">
        <PrimaryToggleButton
          v-model="bonusRewards"
          class="o-primary-btn--option l-options-grid__button"
          label="업적/챌린지 보너스 보상:"
          on="켜짐"
          off="꺼짐"
        />
        <PrimaryToggleButton
          v-model="modPerks"
          class="o-primary-btn--option l-options-grid__button"
          label="모드 퍽:"
          on="켜짐"
          off="꺼짐"
        />
        <PrimaryToggleButton
          v-model="modUpgrades"
          class="o-primary-btn--option l-options-grid__button"
          label="모드 업그레이드 효과:"
          on="켜짐"
          off="꺼짐"
        />
        <PrimaryToggleButton
          v-model="modStudies"
          class="o-primary-btn--option l-options-grid__button"
          label="모드 시간 연구:"
          on="켜짐"
          off="꺼짐"
        />
        <OptionsButton
          class="o-primary-btn--option"
          @click="resetMod"
        >
          모드 설정 초기화
        </OptionsButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.c-ad-mod-header {
  margin-bottom: 1rem;
  color: var(--color-text);
}
</style>
