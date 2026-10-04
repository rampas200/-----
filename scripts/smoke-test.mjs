// 빌드된 게임을 휴대폰 화면 크기로 열어서 모드 기능이 실제로 동작하는지 확인한다. (GitHub Actions에서 실행)
// 사용법: node scripts/smoke-test.mjs <dist 폴더> <스크린샷 폴더>
// playwright-core와 설치된 Google Chrome을 쓴다.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

import { chromium } from "playwright-core";

const DIST = path.resolve(process.argv[2] ?? "game/dist");
const SHOTS = path.resolve(process.argv[3] ?? "smoke-screenshots");
fs.mkdirSync(SHOTS, { recursive: true });

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp",
  ".webm": "video/webm", ".mp3": "audio/mpeg", ".ttf": "font/ttf", ".woff": "font/woff", ".woff2": "font/woff2",
  ".svg": "image/svg+xml", ".txt": "text/plain",
};

// 정적 파일 서버 (GitHub Pages와 같은 역할)
const server = http.createServer((req, res) => {
  let file = path.join(DIST, decodeURIComponent(new URL(req.url, "http://localhost").pathname));
  if (!file.startsWith(DIST)) {
    res.writeHead(403).end();
    return;
  }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream" }).end(data);
  });
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}/`;

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
}

const browser = await chromium.launch({ channel: "chrome" });
// 일반적인 안드로이드 휴대폰 (지원 브라우저 검사를 통과하도록 실제 크롬 UA 사용)
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/141.0.0.0 Mobile Safari/537.36",
});
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", error => pageErrors.push(error.message));
page.on("console", message => {
  if (message.type() === "error") console.log(`      [console error] ${message.text()}`);
});

const wait = ms => page.waitForTimeout(ms);
const text = () => page.evaluate(() => document.body.innerText);

try {
  await page.goto(url, { waitUntil: "load" });
  await page.waitForFunction(() => window.GameUI?.initialized === true, null, { timeout: 60000 });
  await wait(2000);
  await page.screenshot({ path: `${SHOTS}/1-start.png` });
  check("게임 시작", true);

  const layoutWidth = await page.evaluate(() => document.documentElement.clientWidth);
  check("모바일 화면 맞춤 (1100px로 배치 후 축소)", layoutWidth === 1100, `layout width ${layoutWidth}`);

  const basics = await page.evaluate(() => ({
    version: ADMod.version,
    rewards: ModRewards.list.length,
    enabled: ModRewards.isEnabled,
    koreanNews: GameDatabase.news.filter(news => news.id.startsWith("kr")).length,
  }));
  check("ADMod / ModRewards 로드", basics.rewards === 208 && basics.enabled, JSON.stringify(basics));
  check("한국어 뉴스 20개", basics.koreanNews === 20);

  // 업적 11 (1번째 차원 구매) -> 1번째 반물질 차원 ×2
  const ach11 = await page.evaluate(async () => {
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    Achievement(11).unlock();
    await sleep(500);
    const on = AntimatterDimension(1).multiplier;
    ADMod.bonusRewards = false;
    await sleep(500);
    const off = AntimatterDimension(1).multiplier;
    ADMod.bonusRewards = true;
    await sleep(500);
    return { ratio: on.div(off).toNumber(), channel: ModRewards.decimal("adTierMult", 1).toNumber() };
  });
  check("업적 보너스가 실제 차원 배율에 적용 (업적 11: 1번째 차원 ×2)",
    Math.abs(ach11.ratio - 2) < 1e-9 && ach11.channel === 2, JSON.stringify(ach11));

  // 업적 12 -> 시작 반물질 ×10 (기본 10 -> 100)
  const startAM = await page.evaluate(() => {
    Achievement(12).unlock();
    ModRewards.invalidate();
    return Currency.antimatter.startingValue.toNumber();
  });
  check("시작 반물질 보너스 (업적 12)", startAM === 100, `startingValue ${startAM}`);

  // 게임 속도 ×10
  const speed = await page.evaluate(async () => {
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    ADMod.gameSpeed = 10;
    const start = player.records.realTimePlayed;
    await sleep(1000);
    const elapsed = player.records.realTimePlayed - start;
    ADMod.gameSpeed = 1;
    return elapsed;
  });
  check("게임 속도 ×10", speed > 6000 && speed < 14000, `1초 동안 ${Math.round(speed)}ms 진행`);

  // Options -> Mod 탭
  await page.evaluate(() => Tab.options.mod.show(true));
  await wait(800);
  const modTab = await text();
  check("Options → Mod 탭", modTab.includes(`AD Mod v${basics.version}`) && modTab.includes("업적/챌린지 보너스 보상") &&
    modTab.includes("모드 업그레이드 효과"));
  await page.screenshot({ path: `${SHOTS}/2-mod-tab.png` });

  // Achievements -> Mod Bonuses 탭
  await page.evaluate(() => Tab.achievements["mod bonuses"].show(true));
  await wait(1500);
  const rows = await page.locator(".c-ad-mod-rewards__table tr").count();
  const bonusTab = await text();
  check("Achievements → Mod Bonuses 탭 (208줄, 받은 보너스 2개)",
    rows === 208 && /받은 보너스:\s*2\s*\/\s*208/u.test(bonusTab), `rows ${rows}`);
  await page.screenshot({ path: `${SHOTS}/3-mod-bonuses.png` });

  // 업적 툴팁 (휴대폰에서는 탭)
  await page.evaluate(() => Tab.achievements.normal.show(true));
  await wait(800);
  await page.locator(".o-achievement").first().tap();
  await wait(500);
  const tooltip = await page.locator(".o-achievement .c-ad-mod-bonus").first().innerText().catch(() => "");
  check("업적 툴팁의 모드 보너스 (탭으로 열기)", tooltip.includes("1번째 반물질 차원 ×2"), tooltip.replace(/\s+/gu, " "));
  await page.screenshot({ path: `${SHOTS}/4-achievement-tooltip.png` });

  // 챌린지 상자 (챌린지 탭은 무한 이후에 열리므로 무한 1회로 설정)
  await page.evaluate(() => {
    player.infinities = new Decimal(1);
    Tab.challenges.normal.show(true);
  });
  await wait(800);
  const boxBonuses = await page.locator(".c-challenge-box .c-ad-mod-bonus").count();
  check("일반 챌린지 상자 12개에 모드 보너스 표시", boxBonuses === 12, `${boxBonuses}개`);
  await page.screenshot({ path: `${SHOTS}/5-challenges.png` });

  // ---- 모드 업그레이드 ----
  const counts = await page.evaluate(() => ({ list: ModUpgrades.list.length, effects: ModRewards.upgradeList.length }));
  check("모드 업그레이드 30개 로드", counts.list === 30 && counts.effects === 30, JSON.stringify(counts));

  // 1번 "압축된 출발": 차원 부스트 없이 반물질 1e20 -> 조건을 맞추면 다음 틱에 해금
  const up1 = await page.evaluate(async () => {
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const before = ModUpgrades.isUnlocked(1);
    Currency.antimatter.bumpTo(new Decimal(1e21));
    await sleep(500);
    return { before, after: ModUpgrades.isUnlocked(1), boosts: player.dimensionBoosts };
  });
  check("조건 달성 시 자동 해금 (1번: 부스트 없이 반물질 1e20)", !up1.before && up1.after, JSON.stringify(up1));
  const toast = await text();
  check("해금 알림 표시", toast.includes("모드 업그레이드 해금: 압축된 출발"));

  // 6번 "무한의 흐름": 총 무한 100회 -> 매초 무한 1회분의 10% 자동 획득
  const flow = await page.evaluate(async () => {
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    player.infinities = new Decimal(150);
    await sleep(500);
    const unlocked = ModUpgrades.isUnlocked(6);
    const start = Currency.infinities.value.toNumber();
    ADMod.gameSpeed = 100;
    await sleep(2000);
    ADMod.gameSpeed = 1;
    return { unlocked, rate: ModRewards.sum("passiveInfinities"), gained: Currency.infinities.value.toNumber() - start };
  });
  check("무한 횟수 자동 획득 (6번: 무한의 흐름)", flow.unlocked && flow.rate === 0.1 && flow.gained >= 10,
    JSON.stringify(flow));

  // 해금 상태가 세이브에 저장되고 새로고침 후에도 남는지
  await page.evaluate(() => GameStorage.save(true));
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => window.GameUI?.initialized === true, null, { timeout: 60000 });
  await wait(1500);
  const persisted = await page.evaluate(() => ({
    up1: ModUpgrades.isUnlocked(1), up6: ModUpgrades.isUnlocked(6), bits: player.adMod.upgradeBits,
  }));
  check("새로고침 후에도 해금 유지 (세이브 저장)", persisted.up1 && persisted.up6, JSON.stringify(persisted));

  await page.evaluate(() => Tab.achievements["mod upgrades"].show(true));
  await wait(1000);
  const cards = await page.locator(".c-ad-mod-upgrade").count();
  const unlockedCards = await page.locator(".c-ad-mod-upgrade--unlocked").count();
  const upgradesTab = await text();
  check("Achievements → Mod Upgrades 탭 (카드 30장, 해금 2장)",
    cards === 30 && unlockedCards === 2 && /해금:\s*2\s*\/\s*30/u.test(upgradesTab),
    `cards ${cards}, unlocked ${unlockedCards}`);
  await page.screenshot({ path: `${SHOTS}/6-mod-upgrades.png`, fullPage: true });

  check("페이지 오류 없음", pageErrors.length === 0, pageErrors.join(" | "));
} catch (error) {
  check("테스트 실행", false, error.stack);
  await page.screenshot({ path: `${SHOTS}/error.png` }).catch(() => {});
} finally {
  await browser.close();
  server.close();
}

const failed = results.filter(result => !result.ok).length;
console.log(failed ? `\n${failed}개 실패` : `\n모든 확인 통과 (${results.length}개)`);
process.exit(failed ? 1 : 0);
