// [AD Mod] 모드 설정 모듈
// 설정은 게임 세이브(player)와 분리해서 localStorage에 저장한다. 그래서 모드를 지운 원본 게임에
// 같은 세이브를 불러와도 알 수 없는 키 때문에 깨지지 않는다.
// 전역(window)에 노출되므로 브라우저 콘솔에서 `ADMod.gameSpeed = 10` 처럼 바로 바꿀 수도 있다.

import { DC } from "./constants";

const STORAGE_KEY = "ADModSettings";

const DEFAULT_SETTINGS = {
  // 실제 시간 1초당 진행되는 게임 시간 배율 (오프라인 진행 계산에는 적용하지 않음)
  gameSpeed: 1,
  // 반물질 차원 공통 배율의 10의 지수 (0이면 ×1, 3이면 ×1000)
  productionExponent: 0,
  // 한국어 뉴스 티커 메시지 표시 여부
  koreanNews: true,
};

export const AD_MOD_LIMITS = {
  gameSpeed: { min: 1, max: 1000 },
  productionExponent: { min: 0, max: 100 },
};

function clampNumber(value, { min, max }, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, min), max);
}

function loadSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

const settings = loadSettings();

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // 사생활 보호 모드 등에서 localStorage를 못 쓰면 이번 세션에만 적용된다.
  }
}

export const ADMod = {
  name: "AD Mod",
  version: "0.1.0",

  // 스피드런 기록이 오염되지 않도록 스피드런 중에는 속도/생산 배율을 끈다.
  get isSuspended() {
    return player.speedrun.isActive;
  },

  get gameSpeed() {
    return clampNumber(settings.gameSpeed, AD_MOD_LIMITS.gameSpeed, 1);
  },
  set gameSpeed(value) {
    settings.gameSpeed = clampNumber(value, AD_MOD_LIMITS.gameSpeed, 1);
    saveSettings();
  },

  get productionExponent() {
    return clampNumber(settings.productionExponent, AD_MOD_LIMITS.productionExponent, 0);
  },
  set productionExponent(value) {
    settings.productionExponent = Math.round(clampNumber(value, AD_MOD_LIMITS.productionExponent, 0));
    saveSettings();
  },

  get koreanNews() {
    return Boolean(settings.koreanNews);
  },
  set koreanNews(value) {
    settings.koreanNews = Boolean(value);
    saveSettings();
  },

  // 게임 루프에서 실제로 쓰는 값들
  get effectiveGameSpeed() {
    return this.isSuspended ? 1 : this.gameSpeed;
  },
  get productionMultiplier() {
    if (this.isSuspended || this.productionExponent === 0) return DC.D1;
    return Decimal.pow10(this.productionExponent);
  },

  reset() {
    Object.assign(settings, DEFAULT_SETTINGS);
    saveSettings();
  },
};
