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
| 업적/챌린지 보너스 보상 | 아래 [보너스 보상](#보너스-보상) 참고. 끄면 원래 게임 밸런스로 돌아갑니다. |
| 설정 초기화 | 모드 설정을 기본값으로 되돌립니다. |

- 모드 설정은 세이브 파일이 아니라 브라우저 `localStorage`(`ADModSettings` 키)에 따로 저장합니다.
  그래서 같은 세이브를 원본 게임에 불러와도 문제가 없습니다.
- 스피드런 모드에서는 기록이 오염되지 않도록 게임 속도, 생산 배율, 보너스 보상이 자동으로 꺼집니다.
- 브라우저 콘솔에서도 바꿀 수 있습니다: `ADMod.gameSpeed = 10`, `ADMod.productionExponent = 5`

## 보너스 보상

게임을 더 완만하게 진행할 수 있도록 **모든 업적(144개), 비밀 업적(32개), 일반 챌린지(12개),
무한 챌린지(8개), 영원 챌린지(12개)** 에 원래 보상과 별개로 보너스 보상을 하나씩 더 붙였습니다. 총 208개입니다.

보상은 업적이나 챌린지의 내용과 이어지도록 골랐고, 각각 그 이유를 적은 짧은 메모가 붙어 있습니다.

| 업적/챌린지 | 보너스 보상 | 메모 |
| --- | --- | --- |
| 13. Half life 3 CONFIRMED (3번째 차원 구매) | 3번째 반물질 차원 ×3 | 3편은 결국 나온다 |
| 23. The 9th Dimension is a lie (8번째 차원 정확히 99개) | 8번째 차원 99개마다 8번째 차원 +×1 (최대 ×9) | 9번째 차원은 없으니 8번째를 더 |
| 26. You got past The Big Wall (첫 갤럭시) | 반물질 갤럭시 필요 차원 수 -5 | 거대한 벽이 조금 낮아진다 |
| 43. How the antitables have turned (차원 배율 순서 뒤집기) | 높은 차원일수록 강해짐 (8번째 ×1.8 … 1번째 ×1.1) | 차원 서열이 뒤집혔다 |
| C2 (구매하면 생산이 멈추고 3분에 걸쳐 회복) | 무한 직후 모든 차원 ×3, 3분에 걸쳐 ×1로 감소 | C2와 반대로, 무한 직후 생산 폭발 |
| IC8 (구매하지 않으면 생산이 계속 떨어짐) | 최근 10초 안에 구매했다면 모든 차원 ×3 | 구매해야 생산이 유지되던 IC8 |
| EC5 (갤럭시 비용 증가가 바로 시작) | 완료당 갤럭시 필요 차원 수 -4, 부스트 필요 차원 수 -1 | 갤럭시 비용이 바로 치솟던 EC5 |

보상이 걸리는 곳(22가지): 모든/특정 반물질 차원, 틱스피드, 10개 구매 배율, 시작 반물질, 차원 부스트 배율과 요구량,
갤럭시 효과와 요구량, 차원 희생, IP, 무한 횟수, 무한 차원, 레플리칸티 속도, EP, 영원 횟수, 시간 차원,
타키온 입자, 팽창 시간, 현실 기계, 글리프 레벨, 블랙홀 위력.

- **확인하는 곳**
  - 업적에 마우스를 올리면 툴팁에 `모드 보너스: …` 가 나옵니다. 비밀 업적은 달성한 뒤에만 보입니다.
  - 챌린지 상자 아래쪽에도 보너스가 표시됩니다.
  - **Achievements → Mod Bonuses** 탭에서 전체 목록, 받은 개수, 지금 받고 있는 효과 합계를 볼 수 있습니다.
    아직 못 얻은 비밀 업적과 Pelle 이전의 마지막 줄 업적은 이름과 메모를 가립니다.
- **규칙**
  - 영원 챌린지 보너스는 완료 횟수(최대 5회)만큼 쌓입니다.
  - 보너스는 항상 유리하게만 작용합니다. 곱은 ×1 아래로, 요구량은 1 아래로 내려가지 않습니다.
  - EC11처럼 원래 배율을 막는 챌린지 안에서는 보너스도 같이 막힙니다.
- **데이터 위치:** `overlay/src/core/secret-formula/mod-rewards.js` 에 보상이 한 줄에 하나씩 있어서
  값이나 메모를 바로 고칠 수 있습니다.

## 휴대폰으로 플레이하기

푸시할 때마다 GitHub Actions(`.github/workflows/build-game.yml`)가 모드를 적용해 게임을 빌드합니다.
저장소가 **공개(public)** 일 때는 빌드 결과를 `gh-pages` 브랜치에 올려 웹사이트로 띄웁니다.
무료 GitHub 계정은 비공개 저장소에서 GitHub Pages를 쓸 수 없어서, 비공개일 때는 빌드만 합니다.

한 번만 설정하면 됩니다. 저장소 설정은 GitHub 앱보다 휴대폰 브라우저로 github.com에 들어가서 바꾸는 게 확실합니다.

1. 저장소 **Settings → General → 맨 아래 Danger Zone → Change repository visibility → Public**
2. **Actions** 탭 → **Build game** → **Run workflow** (또는 아무 커밋이나 푸시)
3. 빌드가 끝나면(3~5분) **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **gh-pages**, 폴더 **/ (root)** → **Save**
4. 1~2분 뒤 **https://rampas200.github.io/-----/** 에서 플레이

팁:
- 화면은 PC와 같은 배치를 휴대폰 크기로 줄여서 보여 줍니다. **가로 모드**가 보기 편하고, 두 손가락으로 확대할 수 있습니다.
- 업적 툴팁은 업적을 한 번 탭하면 나옵니다.
- 브라우저 메뉴의 **홈 화면에 추가**를 쓰면 앱처럼 전체 화면으로 열립니다.
- 세이브는 그 브라우저에 저장됩니다. 기기를 바꿀 때는 Options → Saving의 Export/Import를 쓰세요.

## 사용법 (PC에서 직접 실행)

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
  src/core/ad-mod.js                                 모드 설정 (ADMod 전역 객체)
  src/core/mod-rewards.js                            보너스 보상 엔진 (ModRewards 전역 객체)
  src/core/secret-formula/mod-rewards.js             보너스 보상 208개 데이터
  src/core/secret-formula/mod-news.js                한국어 뉴스
  src/components/ModBonusLine.vue                    툴팁/챌린지 상자의 "모드 보너스" 줄
  src/components/tabs/mod-rewards/ModRewardsTab.vue  Achievements → Mod Bonuses 탭 화면
  src/components/tabs/options-mod/OptionsModTab.vue  Options → Mod 탭 화면
  public/manifest.webmanifest                        홈 화면에 추가할 때 쓰는 앱 정보
scripts/apply-mod.sh   원본 받기 + 패치 적용 + overlay 복사
scripts/export-mod.sh  game/ 폴더에서 고친 내용을 patches/, overlay/로 되돌려 저장
.github/workflows/build-game.yml  모드 적용 + 빌드 + (공개 저장소일 때) gh-pages 배포
```

패치가 고치는 원본 파일:

| 파일 | 변경 내용 |
| --- | --- |
| `src/game.js` | 게임 속도 배율, 무한 횟수/EP 보너스 |
| `src/core/dimensions/antimatter-dimension.js` | 생산 배율, 모든/특정 차원 보너스, 10개 구매 배율 보너스 |
| `src/core/tickspeed.js` | 틱스피드, 갤럭시 효과 보너스 |
| `src/core/dimboost.js`, `src/core/galaxy.js` | 차원 부스트 배율, 부스트/갤럭시 요구량 보너스 |
| `src/core/currency.js`, `src/core/sacrifice.js` | 시작 반물질, 차원 희생 보너스 |
| `src/core/infinity-upgrades.js`, `src/core/replicanti.js` | IP, 레플리칸티 속도 보너스 |
| `src/core/dimensions/infinity-dimension.js`, `src/core/dimensions/time-dimension.js` | 무한/시간 차원 보너스 |
| `src/core/eternity.js`, `src/core/dilation.js` | 영원 횟수, 타키온 입자, 팽창 시간 보너스 |
| `src/core/machines.js`, `src/core/glyphs/auto-glyph-processor.js`, `src/core/black-hole.js` | 현실 기계, 글리프 레벨, 블랙홀 보너스 |
| 업적/챌린지 화면 컴포넌트 5개 | 툴팁과 챌린지 상자에 "모드 보너스" 줄 추가 |
| `src/core/secret-formula/news.js` | 한국어 뉴스 목록 추가 |
| `src/core/secret-formula/tabs.js`, `src/components/tabs/index.js` | Options → Mod, Achievements → Mod Bonuses 탭 추가 |
| `src/core/globals.js` | `ADMod`, `ModRewards`를 전역으로 노출 |
| `public/index.html` | 모바일 화면 맞춤(viewport), 홈 화면 앱 설정 |

## 모드 고치기

1. `scripts/apply-mod.sh` 로 `game/` 폴더를 만듭니다.
2. `game/` 안에서 코드를 고치고 `npm run serve` 로 확인합니다. (저장하면 새로고침만 하면 됩니다.)
3. `scripts/export-mod.sh` 를 실행하면 고친 내용이 `patches/`, `overlay/` 에 저장됩니다.
   새 파일을 추가했다면 `overlay/` 아래 같은 경로에 빈 파일을 먼저 만들어 두세요.

## 알려진 한계

- 통계의 Multiplier Breakdown 탭에는 모드 생산 배율과 보너스 보상이 따로 표시되지 않습니다.
  대신 Achievements → Mod Bonuses 탭에서 보너스 합계를 볼 수 있습니다.
- 글리프 레벨 상세 화면에는 보너스 레벨이 따로 표시되지 않습니다. 최종 레벨에는 반영됩니다.
- 게임 속도 배율은 게임 안의 플레이 시간 통계에도 반영됩니다.
- 화면에 표시되는 원본 게임 속도(블랙홀 등)에는 모드 배율이 포함되지 않습니다.

## 라이선스

원본 Antimatter Dimensions는 MIT 라이선스입니다 (Copyright (c) 2017 IvarK).
패치에는 원본 코드 일부가 문맥으로 포함되어 있습니다.
