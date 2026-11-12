
const path = require('path');
const { chromium } = require('playwright');

const BASE_URL = 'http://127.0.0.1:4173';
const BROWSER_CHANNEL = 'msedge';
const OUTPUT_DIR = '.';
const DESKTOP = { width: 1440, height: 1000 };
const PHONE = { width: 390, height: 844 };

const WORD_ANSWER = 'TEACHER';
const SECRET_ANSWER = 'thank you';
const REPLY_TEXT = 'Thank you, my wonderful students!';
const CHALLENGE_COUNT = 5;
const QUIZ_QUESTIONS = 3;


const out = file => path.join(OUTPUT_DIR, file);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const shot = (page, file) => page.screenshot({ path: out(file), fullPage: true });

const hasHorizontalOverflow = page =>
  page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);


async function playWordChallenge(page) {
  const letters = page.locator('.letters input');

  await letters.first().fill('X');          
  await page.click('#hint');

  for (let i = 0; i < WORD_ANSWER.length; i++) {
    await letters.nth(i).fill(WORD_ANSWER[i]);
  }
  await page.click('#word-form button');
  await page.click('#continue');
}

async function playMemoryChallenge(page) {
  const faces = await page.locator('.card-face').allTextContents();
  const cards = page.locator('[data-card]');

  for (const symbol of new Set(faces)) {
    const [first, second] = faces.flatMap((face, i) => (face === symbol ? [i] : []));
    await cards.nth(first).click();
    await cards.nth(second).click();
  }
  await page.click('#continue');
}

async function playQuizChallenge(page) {
  await page.locator('[data-answer="0"]').click();   

  for (let q = 0; q < QUIZ_QUESTIONS; q++) {
    await page.locator('[data-answer="3"]').click();
    const isLast = q === QUIZ_QUESTIONS - 1;
    if (!isLast) await page.getByText('Next question →', { exact: true }).click();
  }
  await page.click('#continue');
}

async function playBouquetChallenge(page) {
  await page.click('#finish');                        
  await page.click('[data-flower="tulip"]');
  await page.click('[data-color="#F8C8DC"]');
  await page.click('#add');
  await page.click('#add');
  await page.click('[data-remove="0"]');              
  await page.click('#finish');
  await page.click('#continue');
}

async function playSecretChallenge(page) {
  await page.fill('#secret', 'wrong');                
  await page.click('#secret-form button');
  await page.click('#hint');
  await page.fill('#secret', SECRET_ANSWER);
  await page.click('#secret-form button');
  await page.click('#continue');
}


async function testReplyPersistence(page) {
  await page.locator('summary').click();
  await page.fill('#reply', REPLY_TEXT);
  await page.click('#save-reply');

  await page.reload();
  await page.locator('summary').click();

  const restored = await page.inputValue('#reply');
  assert(restored === REPLY_TEXT, 'Reply persistence failed');
}

async function testDownload(page) {
  const downloadPromise = page.waitForEvent('download');
  await page.click('#download');
  const download = await downloadPromise;
  await download.saveAs(out('test-greeting.png'));
}

async function testMobileLayout(page) {
  await page.setViewportSize(PHONE);
  await shot(page, 'final-mobile.png');
  assert(!(await hasHorizontalOverflow(page)), 'Mobile overflow on the final card');
}

async function testReplayAndSkips(page) {
  await page.click('#replay');
  await shot(page, 'welcome-mobile.png');

  await page.click('#open');
  await page.click('#accept');
  for (let i = 0; i < CHALLENGE_COUNT; i++) {
    await page.click('#skip');
  }
  await page.getByText('Send Some Love ♡').waitFor();
}


async function run() {
  const browser = await chromium.launch({ headless: true, channel: BROWSER_CHANNEL });
  const errors = [];

  try {
    const page = await browser.newPage({ viewport: DESKTOP });
    page.on('pageerror', error => errors.push(error.message));


    await page.goto(BASE_URL);
    await shot(page, 'welcome-desktop.png');
    await page.click('#open');
    await page.click('#accept');

    
    await playWordChallenge(page);
    await playMemoryChallenge(page);
    await playQuizChallenge(page);
    await playBouquetChallenge(page);
    await playSecretChallenge(page);

    // Final card
    await page.click('#love');
    await page.click('#surprise');
    await testReplyPersistence(page);
    await testDownload(page);
    await shot(page, 'final-desktop.png');

    // Mobile, replay and skipping
    await testMobileLayout(page);
    await testReplayAndSkips(page);

    console.log(JSON.stringify({
      result: 'All five challenges, wrong-answer feedback, bouquet remove, reply persistence, PNG export, replay and skips passed',
      errors
    }));
  } finally {
    await browser.close();   
  }

  if (errors.length) process.exitCode = 1;
}

run().catch(error => {
  console.error('✗ Test failed:', error);
  process.exitCode = 1;
});