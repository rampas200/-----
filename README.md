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
| 모드 업그레이드 효과 | 아래 [모드 업그레이드](#모드-업그레이드) 참고. 꺼도 해금 기록은 남습니다. |
| 모드 시간 연구 | 아래 [모드 시간 연구](#모드-시간-연구) 참고. 끄면 트리에서 숨고 살 수 없습니다. |
| 모드 퍽 | 아래 [모드 퍽](#모드-퍽) 참고. 끄면 효과가 멈추고 살 수 없습니다 (이미 산 퍽은 남음). |
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

## 모드 업그레이드

현실(Reality)의 일회성 업그레이드처럼 **조건 + 효과** 로 된 업그레이드 30개를 현실 이전 단계에 추가했습니다.
현실 업그레이드와 달리 **구매하지 않습니다.** 조건을 달성하는 순간 영구히 해금되고 알림이 뜹니다.
**Achievements → Mod Upgrades** 탭에서 6단계 × 5개 카드로 조건, 효과, 진행 상황을 볼 수 있습니다.

| 단계 | 업그레이드 (조건 → 효과) |
| --- | --- |
| 1 반물질 | 압축된 출발 (부스트 없이 반물질 1e20 → 부스트 1회당 모든 차원 ×1.1), 고독한 은하 (갤럭시 없이 무한 → 갤럭시당 틱스피드 ×1.02), 희생의 미학, 8 없는 무한, 손수 만든 무한 |
| 2 무한 초반 | **무한의 흐름** (무한 100회 → 매초 무한 1회분의 10% 자동 획득), 셀 수 없는 구성, 도전 정신, 업그레이드 애호가, 빠른 손 |
| 3 무한 후반 | **한계 너머** (브레이크 후 한 번에 IP 1e20 → 매초 IP 1% 자동 획득), 무한 차원 개척자, 무한 챌린지 정복자 (먼 갤럭시 비용 증가 지연), 레플리칸티 각성, 무한 파워 충전 |
| 4 영원 초반 | **영원의 흐름** (영원 100회 → 매초 영원 1회분의 10% 자동 획득), 복제 없는 영원, 독학의 영원, 영원의 순간 (1분 안에 영원 → 영원 시작 IP 1e30), 무한 은행 |
| 5 영원 후반 | 텔레메카닉 (시간 차원 5~8 없이 EP 1e100), 역설의 영원, 영원 챌린지 탐험가, **영원의 샘** (EP 1e200 → 매초 EP 1% 자동 획득), 연구 수집가 (TT 자동 생성) |
| 6 시간 팽창 | 팽창 입문, 팽창 속 질주, 타키온 가속, 팽창 시간 축적 (TT 자동 생성), 현실의 문턱 (EP 1e3000 → 첫 현실 RM ×3, 글리프 레벨 +10) |

- 현실 업그레이드처럼 "**~없이** ~하기" 조건이 많습니다. 이번 판에서 이미 조건을 어겼으면 카드에 "이번 판에서는 실패"가 표시되고, 다음 판에 다시 도전할 수 있습니다.
- 몇몇은 현실 업그레이드를 그대로 본떴습니다. 예: 'The Boundless Flow' → 무한의 흐름, 'Cosmic Conglomerate' → 무한 챌린지 정복자.
- 해금 상태는 **세이브에 저장**됩니다. 내보내기/가져오기에 함께 들어가고, 하드 리셋하면 초기화됩니다.
  (모드 설정은 브라우저에 따로 저장)
- IP/EP 자동 획득은 챌린지 안에서는 멈춥니다. 무한/영원 횟수 자동 획득은 EC4 안에서 멈춥니다.
- 데이터 위치: `overlay/src/core/secret-formula/mod-upgrades.js`

## 모드 시간 연구

영원(Eternity)의 **시간 연구 트리 맨 아래**에 5갈래 × 10단계 연구와 업적 자동 해금 연구 3개, 총 53개를 추가했습니다.
원래 연구처럼 TT로 사고, 리스펙하면 돌려받고, 트리 내보내기/가져오기와 오토메이터에서도 id로 쓸 수 있습니다.

| 갈래 | id | 시작 조건 | 주요 효과 |
| --- | --- | --- | --- |
| 반물질 (초록) | 241~250 | 연구 71 | 반물질 비례 차원 배율, 부스트/갤럭시/희생 강화, 10개 구매 배율, 먼 갤럭시 지연, 영원 시간 비례 최대 ×1e300 |
| 무한 차원 (주황) | 251~260 | 연구 72 | IP/영원 횟수 비례 무한 차원, **무한 파워 변환 지수 +0.25/+0.5**, 8번째 무한 차원 ×1e10, EC 완료 비례 |
| EP (보라) | 261~270 | 연구 61 | EP 배율, 영원 시작 IP 1e50, 영원 횟수 ×5, TT 생성, EP 자동 획득, 시간 차원 강화 |
| 복제자 (파랑) | 271~280 | 연구 22 | 레플리칸티 속도, **레플리칸티 갤럭시 최대치 +5/+10**, 레플리칸티 갤럭시 효과 +10%/+25% |
| 시간 팽창 | 281~290 | 시간 팽창 해금 | 팽창 시간/타키온 입자 증가, **팽창 페널티 완화 (지수 0.75 → 0.78)**, 팽창 중 반물질 차원 ×1e20, 타키온 은하 +5, 타키온 비례 TT 생성 |
| 업적 자동 해금 (노랑) | 291~293 | 연구 11 | 30분 → 10분 → 2분(게임 시간)마다 아직 못 얻은 현실 이전 업적을 하나씩 자동 해금 |

- 갈래의 첫 연구는 시작 조건 연구가 필요하고, 그다음은 바로 위 연구가 필요합니다.
  반물질/무한 차원 갈래는 차원 경로(71/72)와 묶여 있어서, 경로를 하나만 고를 수 있을 때는 그 갈래만 열립니다.
- 비용은 단계마다 4, 6, 9, 13, 20, 30, 45, 70, 110, 170 TT입니다 (갈래당 477 TT).
  시간 팽창 갈래는 20~850 TT (총 2385 TT), 업적 자동 해금은 15 / 60 / 250 TT입니다.
- 업적 자동 해금은 원래 게임에서는 현실 이후에만 있는 기능입니다. 모드판은 타이머를 세이브(`adMod.achTimer`)에 따로 저장하고,
  산 연구 중 가장 짧은 주기를 씁니다. 자동으로 얻은 업적은 원래 게임처럼 "자동 업적"으로 기록됩니다
  (현실 업그레이드 'Paradoxically Attain' 조건에 영향).
- Shift+클릭하면 시작 조건 연구부터 누른 연구까지 한 번에 삽니다.
- 업적 162 "모든 시간 연구"는 원래 연구 58개만 셉니다.
- 데이터 위치: `overlay/src/core/secret-formula/eternity/time-studies/mod-time-studies.js`

## 모드 퍽

현실(Reality)의 **퍽 트리 가지 끝**에서 이어지는 퍽 36개를 추가했습니다 (원래 48개 → 84개).
원래 퍽처럼 퍽 포인트 1개로 사고, 현실의 퍽 리스펙으로 돌려받습니다. 퍽 화면에서 **별 모양**이 모드 퍽입니다.

| 이어지는 퍽 | 모드 퍽 | 효과 |
| --- | --- | --- |
| SAM / SIP2 / SEP3 / STP | SAM2 / SIP3 / SEP4 / STP2 | 시작 반물질 1e200, 시작 IP 1e300, 시작 EP 1e100, 팽창 해금 시 TP 1e6 |
| PEC3 | PEC4 → PEC5 | 영원 챌린지 자동 완료 10분 → 4분마다 |
| TP4 | TP5 | 3번째 반복 팽창 업그레이드 TP 소급 배율 ×4 |
| ANR (반물질) | AD+ → GAL+ → DB+ → GSD | 반물질 차원 ×1e100, 갤럭시 효과 +10%, 부스트 배율 ×2, 먼 갤럭시 200개 지연 |
| IDR (무한) | ID+ → IP+ → IPC → PIP | 무한 차원 ×1e50, IP ×1e20, 무한 파워 변환 지수 +1, IP 자동 획득 1%/초 |
| SEP4 / ECB / TTM (영원) | EP+ → PEP → ETM, TD+, TTG | EP ×1e10, EP 자동 획득 1%/초, 영원 횟수 ×(현실 횟수+1), 시간 차원 ×1e30, EP 비례 TT 생성 |
| REPAS (복제자) | REP+ → RGM → RGP | 레플리칸티 속도 ×10, 레플리칸티 갤럭시 최대치 +50, 효과 +15% |
| DAB / ATD (시간 팽창) | DT+ → TPM → DILX, TG+ | 팽창 시간 ×5, 타키온 입자 ×3, 팽창 지수 +0.03, 타키온 은하 +20 |
| REAL (현실) | RM+ → GL+ → BH+ → RM2 → GL2 | 현실 기계 ×2, 글리프 레벨 +100, 블랙홀 위력 +25%, 현실 횟수 비례 RM·글리프 레벨 |
| ACHNR (업적) | ACA → ACT → ACR → ACG | 달성한 업적 수에 비례해 반물질 차원, 시간 차원, 현실 기계, 글리프 레벨 증가 |

- 퍽 탭 위의 **퍽 정보 칸**에 고른 퍽의 설명과 상태(구매 가능, 연결된 퍽 필요 등)가 나옵니다.
  휴대폰처럼 터치하는 화면에서는 **첫 탭은 설명만 보여주고, 같은 퍽을 한 번 더 탭하면 삽니다** (잘못 눌러 사는 것을 막음).
  마우스로는 원래처럼 올리면 설명, 클릭하면 구매입니다.
- 기본 배치는 이어지는 퍽 옆의 빈자리를 자동으로 찾아 놓습니다. 모든 배치(Default, Android, Square 등)에서 겹치지 않습니다.
- 시작 자원, EC 자동 완료, TP 소급 퍽은 원래 퍽처럼 Pelle의 파멸된 현실에서는 효과가 없습니다.
- 업적 146 "모든 퍽 구매"는 원래 퍽 48개만 셉니다. 모드 퍽은 오토메이터 포인트를 주지 않습니다.
- 모드를 지운 원본 게임에 세이브를 불러오면 원본 게임이 알 수 없는 퍽을 발견하고 퍽을 리셋해 포인트를 돌려줍니다.
- 데이터 위치: `overlay/src/core/secret-formula/reality/mod-perks.js`

## 휴대폰으로 플레이하기

푸시할 때마다 GitHub Actions(`.github/workflows/build-game.yml`)가 모드를 적용해 게임을 빌드합니다.
빌드가 끝나면 `scripts/smoke-test.mjs`가 게임을 **휴대폰 화면 크기(390×844, 터치)** 로 열어 자동으로 확인합니다.
확인 항목: 게임 시작, 화면 맞춤, 보너스 보상 적용, 시작 반물질, 게임 속도, Mod 탭과 Mod Bonuses 탭,
탭으로 여는 업적 툴팁, 챌린지 상자, 모드 업그레이드 자동 해금과 알림, 무한 횟수 자동 획득,
새로고침 후 해금 유지, Mod Upgrades 탭, 모드 시간 연구(구매 순서, 실제 효과, Shift+클릭, 내보내기/리스펙/가져오기,
트리 화면 표시, 끄기/켜기, 시간 팽창 갈래, 업적 자동 해금). 하나라도 실패하면 배포하지 않습니다.
스크린샷은 Actions 실행 결과의 `smoke-screenshots` 에 올라갑니다.
저장소가 **공개(public)** 일 때는 빌드 결과를 `gh-pages` 브랜치에 올려 웹사이트로 띄웁니다.
무료 GitHub 계정은 비공개 저장소에서 GitHub Pages를 쓸 수 없어서, 비공개일 때는 빌드만 합니다.

한 번만 설정하면 됩니다. 저장소 설정은 GitHub 앱보다 휴대폰 브라우저로 github.com에 들어가서 바꾸는 게 확실합니다.

1. 저장소 **Settings → General → 맨 아래 Danger Zone → Change repository visibility → Public**
2. **Actions** 탭 → **Build game** → **Run workflow** (또는 아무 커밋이나 푸시)
3. 빌드가 끝나면(3~5분) 브랜치 목록에 **gh-pages** 가 생깁니다. **Settings → Pages → Build and deployment** 에서
   - Source: **Deploy from a branch**
   - Branch: **gh-pages**, 폴더 **/ (root)** → **Save**
4. 1~2분 뒤 **https://rampas200.github.io/-----/** 에서 플레이

**게임 대신 README 같은 문서 화면이 보이면** Pages가 `gh-pages` 가 아닌 다른 브랜치(예: `main`, `ccr-…`)를 띄우고 있는 것입니다.
3번에서 Branch를 **gh-pages** 로 바꾸고 저장하세요. 바꾼 뒤에도 예전 화면이 보이면 1~2분 기다렸다가 새로고침하세요.

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
  src/core/mod-upgrades.js                           모드 업그레이드 해금 처리 (ModUpgrades 전역 객체)
  src/core/secret-formula/mod-upgrades.js            모드 업그레이드 30개 데이터
  src/core/mod-time-studies.js                       모드 시간 연구 배치/연결선/연속 구매 (ModTimeStudies 전역 객체)
  src/core/secret-formula/eternity/time-studies/mod-time-studies.js  모드 시간 연구 53개 데이터
  src/core/mod-perks.js                              모드 퍽 상태 (ModPerks 전역 객체)
  src/core/secret-formula/reality/mod-perks.js       모드 퍽 36개 데이터와 자동 배치
  src/components/tabs/perks/ModPerkInfo.vue          퍽 탭의 퍽 정보 칸 (터치 두 번 탭 구매)
  src/core/secret-formula/mod-news.js                한국어 뉴스
  src/components/ModBonusLine.vue                    툴팁/챌린지 상자의 "모드 보너스" 줄
  src/components/tabs/mod-rewards/ModRewardsTab.vue  Achievements → Mod Bonuses 탭 화면
  src/components/tabs/mod-upgrades/ModUpgradesTab.vue Achievements → Mod Upgrades 탭 화면
  src/components/tabs/options-mod/OptionsModTab.vue  Options → Mod 탭 화면
  public/manifest.webmanifest                        홈 화면에 추가할 때 쓰는 앱 정보
scripts/apply-mod.sh   원본 받기 + 패치 적용 + overlay 복사
scripts/export-mod.sh  game/ 폴더에서 고친 내용을 patches/, overlay/로 되돌려 저장
scripts/smoke-test.mjs 빌드된 게임을 휴대폰 화면 크기로 열어 모드 기능 확인 (CI에서 실행)
.github/workflows/build-game.yml  모드 적용 + 빌드 + 휴대폰 화면 테스트 + (공개 저장소일 때) gh-pages 배포
```

패치가 고치는 원본 파일:

| 파일 | 변경 내용 |
| --- | --- |
| `src/game.js` | 게임 속도 배율, 무한 횟수/EP 보너스, 무한/영원 횟수·IP·EP 자동 획득, TT 생성, 업적 자동 해금 타이머 |
| `src/core/dimensions/antimatter-dimension.js` | 생산 배율, 모든/특정 차원 보너스, 10개 구매 배율 보너스 |
| `src/core/tickspeed.js` | 틱스피드, 갤럭시 효과 보너스, 레플리칸티 갤럭시 효과, 추가 타키온 은하 |
| `src/core/dimboost.js`, `src/core/galaxy.js` | 차원 부스트 배율, 부스트/갤럭시 요구량 보너스, 먼 갤럭시 비용 증가 지연 |
| `src/core/currency.js`, `src/core/sacrifice.js` | 시작 반물질/IP/EP (모드 퍽 포함), 영원 시작 IP, 차원 희생 보너스 |
| `src/core/player.js` | 세이브에 모드 업그레이드 해금 상태(`adMod.upgradeBits`)와 업적 자동 해금 타이머(`adMod.achTimer`) 추가 |
| `src/core/infinity-upgrades.js`, `src/core/replicanti.js` | IP, 레플리칸티 속도 보너스, 레플리칸티 갤럭시 최대치 |
| `src/core/dimensions/infinity-dimension.js`, `src/core/dimensions/time-dimension.js` | 무한/시간 차원 보너스, 무한 차원별 배율, 무한 파워 변환 지수 |
| `src/core/secret-formula/eternity/time-studies/normal-time-studies.js` | 시간 연구 데이터베이스에 모드 연구 53개 추가 |
| `src/core/time-studies/normal-time-study.js` | 모드 연구 Shift+클릭 연속 구매 |
| 시간 연구 탭 컴포넌트 3개 (`time-study-tree-layout.js`, `TimeStudiesTab.vue`, `TimeStudyButton.vue`) | 트리 아래 모드 연구 구역, 연결선, 갈래 색 |
| `src/core/secret-formula/achievements/normal-achievements.js` | 업적 162가 원래 연구만, 업적 146이 원래 퍽만 세도록 |
| `src/core/secret-formula/reality/perks.js`, `src/core/perks.js` | 퍽 데이터베이스에 모드 퍽 36개와 연결 추가, 모드 퍽 켜기/끄기 |
| `src/components/tabs/perks/PerksTab.vue` | 모드 퍽 별 모양, 퍽 정보 칸, 터치 첫 탭은 설명만 |
| `src/core/eternity-challenge.js`, `src/core/time-studies/dilation-time-study.js`, `src/core/celestials/pelle/pelle.js` | EC 자동 완료 4~5단계, 시작 TP 2단계, Pelle에서 쓸모없는 모드 퍽 |
| `src/core/eternity.js`, `src/core/dilation.js` | 영원 횟수, 타키온 입자, 팽창 시간 보너스, 팽창 지수 완화, TP 소급 5단계 |
| `src/core/machines.js`, `src/core/glyphs/auto-glyph-processor.js`, `src/core/black-hole.js` | 현실 기계, 글리프 레벨, 블랙홀 보너스 |
| 업적/챌린지 화면 컴포넌트 5개 | 툴팁과 챌린지 상자에 "모드 보너스" 줄 추가 |
| `src/core/secret-formula/news.js` | 한국어 뉴스 목록 추가 |
| `src/core/secret-formula/tabs.js`, `src/components/tabs/index.js` | Options → Mod, Achievements → Mod Bonuses / Mod Upgrades 탭 추가 |
| `src/core/globals.js` | `ADMod`, `ModRewards`, `ModUpgrades`, `ModTimeStudies`, `ModPerks`를 전역으로 노출 |
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
