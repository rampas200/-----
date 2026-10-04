# AD Mod - 안티매터 디멘션 모드

[Antimatter Dimensions](https://github.com/IvarK/AntimatterDimensionsSourceCode) 원본 소스에 얹어 쓰는 모드입니다.
원본 저장소를 통째로 복사하지 않고 **패치 + 추가 파일(overlay)** 만 보관합니다.

## 기능

게임 안의 **Options → Mod** 탭에서 바꿀 수 있습니다.

| 기능 | 설명 |
| --- | --- |
| 게임 속도 | ×1 ~ ×1000. 실제 시간 1초에 진행되는 게임 시간을 늘립니다. 오프라인 진행 계산에는 적용하지 않습니다. |
| 반물질 차원 생산 배율 | ×1 ~ ×1e100. 모든 반물질 차원의 공통 배율에 곱해집니다. |
| 한국어 뉴스 | 화면 위 뉴스 티커에 한국어 메시지 20개를 추가합니다. 끄면 나오지 않습니다. |
| 설정 초기화 | 모드 설정을 기본값으로 되돌립니다. |

- 모드 설정은 세이브 파일이 아니라 브라우저 `localStorage`(`ADModSettings` 키)에 따로 저장합니다.
  그래서 같은 세이브를 원본 게임에 불러와도 문제가 없습니다.
- 스피드런 모드에서는 기록이 오염되지 않도록 게임 속도와 생산 배율이 자동으로 꺼집니다.
- 브라우저 콘솔에서도 바꿀 수 있습니다: `ADMod.gameSpeed = 10`, `ADMod.productionExponent = 5`

## 사용법

필요한 것: [Git](https://git-scm.com/), [Node.js](https://nodejs.org/) (LTS 권장)

```bash
scripts/apply-mod.sh          # ./game 폴더에 원본을 받고 모드를 적용
cd game
npm ci
npm run serve                 # 터미널에 나오는 주소(보통 http://localhost:8080)로 접속
```

Windows에서는 Git Bash에서 실행하면 됩니다.

## 폴더 구성

```
UPSTREAM_COMMIT        모드를 맞춘 원본 소스 커밋
patches/ad-mod.patch   원본 파일 수정 내용 (모드가 들어갈 지점 연결)
overlay/               원본에 새로 추가하는 파일
  src/core/ad-mod.js                              모드 설정 (ADMod 전역 객체)
  src/core/secret-formula/mod-news.js             한국어 뉴스
  src/components/tabs/options-mod/OptionsModTab.vue  Options → Mod 탭 화면
scripts/apply-mod.sh   원본 받기 + 패치 적용 + overlay 복사
scripts/export-mod.sh  game/ 폴더에서 고친 내용을 patches/, overlay/로 되돌려 저장
```

패치가 고치는 원본 파일:

| 파일 | 변경 내용 |
| --- | --- |
| `src/game.js` | 게임 루프의 경과 시간에 게임 속도 배율 적용 |
| `src/core/dimensions/antimatter-dimension.js` | 반물질 차원 공통 배율에 생산 배율 곱하기 |
| `src/core/secret-formula/news.js` | 한국어 뉴스 목록 추가 |
| `src/core/secret-formula/tabs.js` | Options 아래에 Mod 서브탭 추가 |
| `src/components/tabs/index.js` | Mod 탭 컴포넌트 등록 |
| `src/core/globals.js` | `ADMod`를 전역으로 노출 |

## 모드 고치기

1. `scripts/apply-mod.sh` 로 `game/` 폴더를 만듭니다.
2. `game/` 안에서 코드를 고치고 `npm run serve` 로 확인합니다. (저장하면 새로고침만 하면 됩니다.)
3. `scripts/export-mod.sh` 를 실행하면 고친 내용이 `patches/`, `overlay/` 에 저장됩니다.
   새 파일을 추가했다면 `overlay/` 아래 같은 경로에 빈 파일을 먼저 만들어 두세요.

## 알려진 한계

- 통계의 Multiplier Breakdown 탭에는 모드 생산 배율이 따로 표시되지 않습니다.
- 게임 속도 배율은 게임 안의 플레이 시간 통계에도 반영됩니다.
- 화면에 표시되는 원본 게임 속도(블랙홀 등)에는 모드 배율이 포함되지 않습니다.

## 라이선스

원본 Antimatter Dimensions는 MIT 라이선스입니다 (Copyright (c) 2017 IvarK).
패치에는 원본 코드 일부가 문맥으로 포함되어 있습니다.
