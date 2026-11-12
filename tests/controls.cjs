const { chromium } = require('playwright');

const BASE_URL = 'http://127.0.0.1:4173';
const BROWSER_CHANNEL = 'msedge';
const PHONE_VIEWPORT = { width: 390, height: 844 };
const CHALLENGE_COUNT = 5;
const REPLY_TEXT = 'A beautiful surprise!';


function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const hasHorizontalOverflow = page =>
  page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

const readClipboard = page =>
  page.evaluate(() => navigator.clipboard.readText());

async function testSoundToggle(page) {
  await page.click('#sound');
  const pressed = await page.getAttribute('#sound', 'aria-pressed');
  assert(pressed === 'true', 'Sound button should be pressed after the first click');

  await page.click('#sound'); 
}

async function testIntroFlow(page) {
  await page.click('#open');    
  await page.click('#accept');  
  await page.click('#restart'); 
}

async function testChallengesFitOnPhone(page) {
  for (let i = 0; i < CHALLENGE_COUNT; i++) {
    assert(!(await hasHorizontalOverflow(page)), `Horizontal overflow on challenge ${i + 1}`);
    await page.click('#skip');
  }
}

async function testCopyMessage(page) {
  await page.locator('summary').click();
  await page.fill('#reply', REPLY_TEXT);
  await page.click('#copy');

  const copied = await readClipboard(page);
  assert(copied === REPLY_TEXT, `Clipboard should contain "${REPLY_TEXT}" but had "${copied}"`);
}

async function run() {
  const browser = await chromium.launch({ headless: true, channel: BROWSER_CHANNEL });

  try {
    const context = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'],
      viewport: PHONE_VIEWPORT,
      reducedMotion: 'reduce'
    });
    const page = await context.newPage();
    await page.goto(BASE_URL);

    await testSoundToggle(page);
    await testIntroFlow(page);
    await testChallengesFitOnPhone(page);
    await testCopyMessage(page);

    console.log('✓ Music toggle, copy, restart, reduced motion, and all mobile challenge widths passed.');
  } finally {
    await browser.close(); // always close, even when a check fails
  }
}

run().catch(error => {
  console.error('✗ Test failed:', error);
  process.exitCode = 1;
});