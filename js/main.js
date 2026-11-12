// main.js
// Controls the screens: welcome -> intro -> 5 challenges -> final card.

// Screen numbers
const WELCOME_SCREEN = 0;
const INTRO_SCREEN = 1;
const FIRST_CHALLENGE_SCREEN = 2;   // screens 2 to 6 are the 5 challenges
const FINAL_SCREEN = 7;

const CHALLENGE_LABELS = [
  'A little word',
  'Sweet memories',
  'Classroom quiz',
  'A bouquet for you',
  'The secret'
];
const CHALLENGE_COUNT = CHALLENGE_LABELS.length;

const app = document.getElementById('app');

/* ---------- Small helper functions ---------- */

// Makes text safe to place inside innerHTML
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Replaces {name} with the instructor's name
function personalize(text) {
  return text.replaceAll('{name}', config.instructorName);
}

// 5 -> "05"
function pad2(number) {
  return String(number).padStart(2, '0');
}

// Sends a message to screen readers
function announce(text) {
  document.getElementById('announcement').textContent = text;
}

/* ---------- Saved progress ---------- */

// state remembers where the player is
//   screen    - the current screen number
//   completed - the challenges already won (0 to 4)
//   reply     - the message typed by the instructor
function loadState() {
  const saved = loadSaved();
  const state = { screen: WELCOME_SCREEN, completed: [], reply: '' };

  if (Number.isInteger(saved.screen) && saved.screen >= 0 && saved.screen <= FINAL_SCREEN) {
    state.screen = saved.screen;
  }

  if (Array.isArray(saved.completed)) {
    state.completed = saved.completed.filter(function (n) {
      return Number.isInteger(n) && n >= 0 && n < CHALLENGE_COUNT;
    });
  }

  if (typeof saved.reply === 'string') {
    state.reply = saved.reply;
  }

  return state;
}

const state = loadState();

function saveState() {
  return saveData(state);
}

// cleanup is a function that stops timers when the screen changes.
// A screen can replace it (see the welcome screen and challenges.js).
let cleanup = function () {};

/* ---------- Moving between screens ---------- */

function go(screen) {
  cleanup();
  cleanup = function () {};

  state.screen = screen;
  saveState();
  render();

  app.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
}

// Called by a challenge when the player wins
function complete(index, message) {
  if (!state.completed.includes(index)) {
    state.completed.push(index);
  }
  saveState();
  celebrate();

  const isLast = index === CHALLENGE_COUNT - 1;
  const buttonText = isLast ? 'Open your greeting card' : 'On to the next little adventure';

  document.getElementById('feedback').innerHTML = `
    <div class="success">
      <span>✦ A LITTLE WIN, JUST FOR YOU</span>
      <p>${escapeHTML(message)}</p>
      <button class="primary" id="continue">${buttonText} <span>→</span></button>
    </div>`;

  const continueButton = document.getElementById('continue');
  continueButton.addEventListener('click', function () {
    go(index + FIRST_CHALLENGE_SCREEN + 1);
  });
  continueButton.focus();

  // show the check mark on the tracker
  document.querySelectorAll('.step').forEach(function (step, i) {
    step.classList.toggle('done', state.completed.includes(i));
  });
}

/* ---------- The progress tracker (01 02 03 04 05) ---------- */

function buildTracker() {
  let steps = '';

  for (let i = 0; i < CHALLENGE_COUNT; i++) {
    const screen = i + FIRST_CHALLENGE_SCREEN;
    const done = state.completed.includes(i);
    const active = state.screen === screen;
    const locked = screen > state.screen && !done;   // can't jump ahead

    steps += `
      <button class="step ${done ? 'done' : ''} ${active ? 'active' : ''}"
              data-step="${screen}" ${locked ? 'disabled' : ''}>
        <span>${done ? '✓' : pad2(i + 1)}</span>
        <small>${CHALLENGE_LABELS[i]}</small>
      </button>`;
  }

  return `<nav class="tracker" aria-label="Your adventure">${steps}</nav>`;
}

/* ---------- Screen 0: Welcome ---------- */

function renderWelcome() {
  app.innerHTML = `
    <section class="welcome">
      <div class="eyebrow"><span></span> A SMALL SURPRISE. A BIG THANK YOU.</div>
      <h1>Someone special has<br>a <em>message for you…</em></h1>
      <p class="lede">Dear ${escapeHTML(config.instructorName)}, we prepared something special just for you!</p>

      <button class="envelope" aria-label="Open your envelope">
        <span class="letter">A little note for you <b>♡</b></span>
        <span class="envelope-back"></span>
        <span class="flap"></span>
        <span class="envelope-front"></span>
        <span class="seal">♥</span>
        <span class="spark s1">✧</span>
        <span class="spark s2">✦</span>
        <span class="tiny-heart">♡</span>
      </button>

      <p class="handwritten">a little joy, sealed with love</p>
      <button class="primary" id="open">Open Your Surprise 💌 <span>→</span></button>
      <p class="fine">5 little challenges <span>·</span> countless reasons to appreciate you</p>
    </section>`;

  const envelope = document.querySelector('.envelope');
  const openButton = document.getElementById('open');

  function openEnvelope() {
    envelope.classList.add('opened');
    openButton.disabled = true;

    // wait for the envelope animation, then go to the intro
    const delay = reducedMotion ? 0 : 900;
    const timer = setTimeout(function () {
      go(INTRO_SCREEN);
    }, delay);

    cleanup = function () {
      clearTimeout(timer);
    };
  }

  envelope.addEventListener('click', openEnvelope);
  openButton.addEventListener('click', openEnvelope);
}

/* ---------- Screen 1: Intro ---------- */

function renderIntro() {
  app.innerHTML = `
    <section class="intro">
      <div class="eyebrow">YOUR INVITATION TO A LITTLE ADVENTURE</div>
      <h1>Five little challenges.<br><em>One heartfelt surprise.</em></h1>
      <p class="lede">Before you receive your special message, we have prepared<br>5 little challenges for you!</p>
      ${buildTracker()}
      <div class="invitation">
        <span>✧</span>
        <p>No timers. No pressure. Just a few happy moments<br>and something special waiting at the end.</p>
      </div>
      <button class="primary" id="accept">Accept the Challenge! <span>→</span></button>
      <p class="fine">Take your time. Your progress is saved on this device.</p>
    </section>`;

  document.getElementById('accept').addEventListener('click', function () {
    go(FIRST_CHALLENGE_SCREEN);
  });
}

/* ---------- Screens 2-6: Challenges ---------- */

function renderChallenge() {
  const index = state.screen - FIRST_CHALLENGE_SCREEN;

  app.innerHTML = `
    ${buildTracker()}
    <section class="challenge">
      <div class="eyebrow">CHALLENGE ${pad2(index + 1)} / ${pad2(CHALLENGE_COUNT)}</div>
      <div id="game"></div>
      <div id="feedback" role="status" aria-live="polite"></div>
      <div class="challenge-tools">
        <button class="text-button" id="restart">↻ Restart challenge</button>
        <button class="text-button" id="skip">Skip this little challenge →</button>
      </div>
    </section>`;

  mountChallenge(index);   // see challenges.js

  document.getElementById('restart').addEventListener('click', function () {
    go(state.screen);
  });
  document.getElementById('skip').addEventListener('click', function () {
    go(state.screen + 1);
  });
}

/* ---------- Screen 7: Final greeting card ---------- */

function renderFinal() {
  // each blank line in the message becomes its own paragraph
  const parts = personalize(config.greetingMessage).split('\n\n');
  let paragraphs = '';
  for (let i = 0; i < parts.length; i++) {
    paragraphs += `<p>${escapeHTML(parts[i])}</p>`;
  }

  let sectionLine = '';
  if (config.sectionName) {
    sectionLine = `<br>${escapeHTML(config.sectionName)}`;
  }

  app.innerHTML = `
    <section class="final">
      <div class="eyebrow">THE BEST PART WAS ALWAYS YOU</div>

      <article id="greeting-card">
        <div class="card-flower">✿</div>
        <span class="eyebrow">WITH LOVE & APPRECIATION</span>
        <h1>${escapeHTML(personalize(config.greetingHeading))}</h1>
        <div class="greeting-copy">${paragraphs}</div>
        <p class="signature">
          With love and appreciation,<br>
          <b>${escapeHTML(config.studentNames.join(', '))} 💜</b>${sectionLine}
        </p>
        <div class="card-bottom">YOU MAKE A DIFFERENCE. EVERY SINGLE DAY.</div>
      </article>

      <div class="final-actions">
        <button class="primary" id="love">Send Some Love ♡</button>
        <button class="secondary" id="surprise">Open Another Surprise ✧</button>
        <button class="secondary" id="download">Download Greeting Card ↓</button>
      </div>
      <p id="extra" class="extra" role="status"></p>

      <details class="reply">
        <summary>Leave a Message <span>↗</span></summary>
        <label for="reply">A little note back to your students</label>
        <textarea id="reply" rows="4" placeholder="Your kind words go here…"></textarea>
        <p class="fine" id="save-status">Saved only on this device. Copy it to share with your students.</p>
        <button id="save-reply" class="secondary">Save Message</button>
        <button id="copy" class="secondary">Copy Message</button>
      </details>

      <button class="text-button replay" id="replay">↻ Replay Adventure</button>
    </section>`;

  setupFinalButtons();
}

function setupFinalButtons() {
  const extra = document.getElementById('extra');
  const saveStatus = document.getElementById('save-status');
  const replyBox = document.getElementById('reply');

  // ----- Send Some Love -----
  document.getElementById('love').addEventListener('click', function () {
    sendHearts();
    announce('Sending you love!');
  });

  // ----- Open Another Surprise -----
  let surpriseNumber = 0;
  document.getElementById('surprise').addEventListener('click', function () {
    extra.textContent = config.surprises[surpriseNumber % config.surprises.length];
    surpriseNumber++;
    sendHearts();
  });

  // ----- Leave a Message: save and copy -----
  replyBox.value = state.reply;

  function saveReply() {
    state.reply = replyBox.value;

    if (saveState()) {
      saveStatus.textContent = 'Your message is saved on this device. Copy it to share.';
    } else {
      saveStatus.textContent = 'This browser cannot save locally. Please copy your message to keep it.';
    }
  }

  replyBox.addEventListener('input', saveReply);
  document.getElementById('save-reply').addEventListener('click', saveReply);

  // used when the browser does not allow automatic copying
  function selectReply() {
    replyBox.focus();
    replyBox.select();
    saveStatus.textContent = 'Your message is selected. Press Ctrl+C (or touch and hold to copy).';
  }

  document.getElementById('copy').addEventListener('click', function () {
    saveReply();

    if (!navigator.clipboard) {
      selectReply();
      return;
    }

    navigator.clipboard.writeText(replyBox.value)
      .then(function () {
        announce('Message copied.');
        saveStatus.textContent = 'Copied! Ready to share with your students.';
      })
      .catch(selectReply);
  });

  // ----- Replay Adventure (the reply is kept) -----
  document.getElementById('replay').addEventListener('click', function () {
    state.completed = [];
    go(WELCOME_SCREEN);
  });

  // ----- Download Greeting Card as a PNG picture -----
  const downloadButton = document.getElementById('download');

  downloadButton.addEventListener('click', function () {
    const originalText = downloadButton.textContent;
    downloadButton.disabled = true;
    downloadButton.textContent = 'Preparing your card…';

    function finish() {
      downloadButton.disabled = false;
      downloadButton.textContent = originalText;
    }

    if (!window.html2canvas) {
      extra.textContent = 'Image export is unavailable. Reload the page and try again.';
      finish();
      return;
    }

    html2canvas(document.getElementById('greeting-card'), { backgroundColor: '#FFF9F2', scale: 2 })
      .then(function (canvas) {
        const link = document.createElement('a');
        link.download = 'a-little-appreciation.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        announce('Your greeting card is ready.');
        finish();
      })
      .catch(function (error) {
        extra.textContent = error.message;
        finish();
      });
  });
}

/* ---------- Drawing the current screen ---------- */

function applyTheme() {
  document.title = config.websiteTitle;

  // sets CSS variables like --lavender and --purple
  for (const key in config.theme) {
    document.documentElement.style.setProperty('--' + key, config.theme[key]);
  }
}

function render() {
  applyTheme();

  if (state.screen === WELCOME_SCREEN) {
    renderWelcome();
  } else if (state.screen === INTRO_SCREEN) {
    renderIntro();
  } else if (state.screen < FINAL_SCREEN) {
    renderChallenge();
  } else {
    renderFinal();
  }

  // the tracker buttons jump to the screen written in data-step
  document.querySelectorAll('[data-step]').forEach(function (button) {
    button.addEventListener('click', function () {
      go(Number(button.dataset.step));
    });
  });
}

/* ---------- Header buttons ---------- */

const soundButton = document.getElementById('sound');

soundButton.addEventListener('click', function () {
  try {
    const isOn = toggleSound();
    soundButton.textContent = isOn ? '♫ Sound on' : '♫ Sound off';
    soundButton.setAttribute('aria-pressed', String(isOn));
  } catch (error) {
    announce('Sound is unavailable in this browser.');
  }
});

document.querySelector('.brand').addEventListener('click', function (event) {
  event.preventDefault();
  app.focus();
});

/* ---------- Start! ---------- */
render();
