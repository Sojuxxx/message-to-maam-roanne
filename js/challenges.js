// challenges.js
// The five mini-games. Each game has its own function.
// complete(index, message) is called (from main.js) when the player wins.

// Shows a message under the game (used by challenges 1, 4, and 5)
function showHint(message) {
  document.getElementById('hint-text').textContent = message;
}

// Decides which challenge to show
function mountChallenge(index) {
  if (index === 0) {
    startWordChallenge();
  } else if (index === 1) {
    startMemoryChallenge();
  } else if (index === 2) {
    startQuizChallenge();
  } else if (index === 3) {
    startBouquetChallenge();
  } else {
    startSecretChallenge();
  }
}

/* ==========================================================
   Challenge 1: A little word
   ========================================================== */
function startWordChallenge() {
  const game = document.getElementById('game');
  const answer = config.word.answer.toUpperCase();

  // one input box per letter
  let boxes = '';
  for (let i = 0; i < answer.length; i++) {
    boxes += `<input aria-label="Letter ${i + 1}" maxlength="1" autocomplete="off" inputmode="text" pattern="[A-Za-z]" required>`;
  }

  game.innerHTML = `
    <h1>A word that <em>means so much.</em></h1>
    <p class="lede">${escapeHTML(config.word.clue)}</p>
    <form id="word-form">
      <div class="letters">${boxes}</div>
      <button class="primary">Check my answer <span>→</span></button>
    </form>
    <button class="text-button" id="hint">✧ A little hint?</button>
    <p id="hint-text" class="hint" role="status"></p>`;

  const inputs = game.querySelectorAll('.letters input');

  inputs.forEach(function (input, i) {
    // typing: keep letters only, make them uppercase, jump to the next box
    input.addEventListener('input', function () {
      input.value = input.value.replace(/[^a-z]/gi, '').toUpperCase();
      if (input.value !== '' && i + 1 < inputs.length) {
        inputs[i + 1].focus();
      }
    });

    // backspace on an empty box: go back to the previous box
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Backspace' && input.value === '' && i > 0) {
        inputs[i - 1].focus();
      }
    });

    // pasting: spread the pasted letters across the boxes
    input.addEventListener('paste', function (event) {
      event.preventDefault();
      const pasted = event.clipboardData.getData('text').replace(/[^a-z]/gi, '').toUpperCase();

      for (let j = 0; j < pasted.length && i + j < inputs.length; j++) {
        inputs[i + j].value = pasted[j];
      }

      const last = Math.min(i + pasted.length, inputs.length - 1);
      inputs[last].focus();
    });
  });

  document.getElementById('hint').addEventListener('click', function () {
    showHint(config.word.hint);
  });

  document.getElementById('word-form').addEventListener('submit', function (event) {
    event.preventDefault();

    // join all the letters together
    let typed = '';
    inputs.forEach(function (input) {
      typed += input.value;
    });

    if (typed === answer) {
      complete(0, "You're more than an instructor. You're an inspiration!");
    } else {
      showHint('Not quite, but you’re close to a little win. Try again!');
      inputs[0].focus();
    }
  });
}

/* ==========================================================
   Challenge 2: Sweet memories (matching cards)
   ========================================================== */

// Mixes up the items of an array (Fisher-Yates shuffle)
function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = items[i];
    items[i] = items[j];
    items[j] = temp;
  }
  return items;
}

function startMemoryChallenge() {
  const game = document.getElementById('game');
  const symbols = ['📚', '💜', '⭐', '🌸', '🎓', '✏️'];
  const cards = shuffle(symbols.concat(symbols));

  let selected = [];     // positions of the cards flipped this turn
  let matched = [];      // positions of the cards already matched
  let moves = 0;
  let locked = false;    // true while two wrong cards are showing
  let flipTimer;

  let cardButtons = '';
  for (let i = 0; i < cards.length; i++) {
    cardButtons += `
      <button class="memory-card" data-card="${i}" aria-label="Reveal card ${i + 1}">
        <span class="card-back">✧</span>
        <span class="card-face" aria-hidden="true">${cards[i]}</span>
      </button>`;
  }

  game.innerHTML = `
    <h1>Little moments.<br><em>Lasting memories.</em></h1>
    <p class="lede">Find the six pairs. Every match is a little memory.</p>
    <p class="memory-meta"><span id="moves">0 moves</span><span id="pairs">0 / 6 pairs</span></p>
    <div class="memory-grid">${cardButtons}</div>`;

  const buttons = game.querySelectorAll('.memory-card');
  const movesText = document.getElementById('moves');
  const pairsText = document.getElementById('pairs');

  function flipBack(i) {
    buttons[i].classList.remove('flipped');
    buttons[i].setAttribute('aria-label', `Reveal card ${i + 1}`);
  }

  function markMatched(i) {
    buttons[i].classList.add('matched');
    buttons[i].disabled = true;
  }

  buttons.forEach(function (button, i) {
    button.addEventListener('click', function () {
      // ignore clicks while waiting, or on cards already flipped
      if (locked || selected.includes(i) || matched.includes(i)) return;

      selected.push(i);
      button.classList.add('flipped');
      button.setAttribute('aria-label', `Card ${i + 1}: ${cards[i]}`);

      // wait until two cards are flipped
      if (selected.length < 2) return;

      moves++;
      movesText.textContent = `${moves} moves`;

      const first = selected[0];
      const second = selected[1];

      if (cards[first] === cards[second]) {
        // it's a match!
        matched.push(first, second);
        markMatched(first);
        markMatched(second);
        selected = [];
        pairsText.textContent = `${matched.length / 2} / 6 pairs`;

        if (matched.length === cards.length) {
          complete(1, "Every lesson you've shared is a memory we'll always treasure.");
        }
      } else {
        // not a match: flip both cards back after a short wait
        locked = true;
        flipTimer = setTimeout(function () {
          flipBack(first);
          flipBack(second);
          selected = [];
          locked = false;
        }, 950);
      }
    });
  });

  // if the player leaves this screen, stop the timer
  cleanup = function () {
    clearTimeout(flipTimer);
  };
}

/* ==========================================================
   Challenge 3: Classroom quiz
   ========================================================== */
function startQuizChallenge() {
  const game = document.getElementById('game');
  let questionNumber = 0;

  function showQuestion() {
    const item = config.quiz[questionNumber];

    let options = '';
    for (let i = 0; i < item.answers.length; i++) {
      options += `
        <button class="quiz-option" data-answer="${i}">
          <span>${String.fromCharCode(65 + i)}</span>${escapeHTML(item.answers[i])}<b>↗</b>
        </button>`;
    }

    game.innerHTML = `
      <h1>A little classroom <em>quiz.</em></h1>
      <p class="eyebrow question-count">QUESTION ${questionNumber + 1} OF ${config.quiz.length}</p>
      <h2>${escapeHTML(item.question)}</h2>
      <div class="quiz-options">${options}</div>
      <p id="quiz-feedback" role="status"></p>`;

    const optionButtons = game.querySelectorAll('.quiz-option');
    const feedback = document.getElementById('quiz-feedback');

    optionButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const chosen = Number(button.dataset.answer);

        if (chosen !== item.correct) {
          button.classList.add('incorrect');
          feedback.textContent = 'A lovely quality! Is there an answer that includes everyone? Try again.';
          return;
        }

        // correct answer
        button.classList.add('correct');
        feedback.textContent = 'Exactly! A wonderful instructor brings all of these.';
        optionButtons.forEach(function (b) {
          b.disabled = true;
        });

        const isLastQuestion = questionNumber === config.quiz.length - 1;
        if (isLastQuestion) {
          complete(2, 'A perfect reminder: you deserve every bit of appreciation.');
        } else {
          const nextButton = document.createElement('button');
          nextButton.className = 'primary';
          nextButton.textContent = 'Next question →';
          nextButton.addEventListener('click', function () {
            questionNumber++;
            showQuestion();
          });
          game.appendChild(nextButton);
          nextButton.focus();
        }
      });
    });
  }

  showQuestion();
}

/* ==========================================================
   Challenge 4: A bouquet for you
   ========================================================== */
const FLOWER_TYPES = ['daisy', 'tulip', 'rose'];
const FLOWER_ICONS = ['✿', '🌷', '❀'];
const FLOWER_COLORS = ['#B9A7F5', '#F8C8DC', '#e9b85c', '#ea8d8b'];
const COLOR_NAMES = ['Lavender', 'Pink', 'Golden', 'Coral'];
const MAX_FLOWERS = 9;

// Returns the SVG drawing of one flower
function flowerSVG(type, color) {
  let head = '';

  if (type === 'tulip') {
    head = `<path d="M23 25L37 35L50 15L62 35L77 25Q81 75 50 75Q19 75 23 25" fill="${color}"/>`;
  } else if (type === 'rose') {
    head = `<circle cx="50" cy="48" r="30" fill="${color}"/>
            <path d="M31 49Q31 25 58 31Q80 40 60 62Q37 75 35 51Q35 37 53 39Q66 47 51 53" fill="none" stroke="#49376B" stroke-opacity=".25" stroke-width="3"/>`;
  } else {
    // daisy: 8 petals turned around the center
    for (let i = 0; i < 8; i++) {
      head += `<ellipse cx="50" cy="27" rx="11" ry="19" transform="rotate(${i * 45} 50 48)" fill="${color}"/>`;
    }
    head += `<circle cx="50" cy="48" r="11" fill="#e9bd66"/>`;
  }

  return `<svg viewBox="0 0 100 150" aria-hidden="true">
    <path d="M50 45Q40 100 53 150" stroke="#77977b" stroke-width="4" fill="none"/>
    <path d="M48 108Q15 80 25 112Q36 126 49 124M49 90Q84 62 76 96Q65 110 49 107" fill="#8fa98b"/>
    ${head}
  </svg>`;
}

function startBouquetChallenge() {
  const game = document.getElementById('game');
  let flowers = [];               // each flower is { type, color }
  let chosenType = 'daisy';
  let chosenColor = '#B9A7F5';

  // buttons for choosing a flower
  let flowerButtons = '';
  for (let i = 0; i < FLOWER_TYPES.length; i++) {
    flowerButtons += `<button class="flower-choice ${i === 0 ? 'selected' : ''}" data-flower="${FLOWER_TYPES[i]}" aria-pressed="${i === 0}">${FLOWER_ICONS[i]} <span>${FLOWER_TYPES[i]}</span></button>`;
  }

  // buttons for choosing a color
  let colorButtons = '';
  for (let i = 0; i < FLOWER_COLORS.length; i++) {
    colorButtons += `<button class="swatch ${i === 0 ? 'selected' : ''}" style="--swatch:${FLOWER_COLORS[i]}" data-color="${FLOWER_COLORS[i]}" aria-label="${COLOR_NAMES[i]}" aria-pressed="${i === 0}"></button>`;
  }

  game.innerHTML = `
    <h1>Kindness, <em>in full bloom.</em></h1>
    <p class="lede">Pick a flower, choose a color, and make it yours.</p>
    <div class="bouquet-builder">
      <div class="bouquet" id="bouquet" aria-label="Your bouquet">
        <span class="empty-bouquet">Your little garden starts here.</span>
      </div>
      <div class="bouquet-controls">
        <fieldset>
          <legend>01 / CHOOSE A FLOWER</legend>
          ${flowerButtons}
        </fieldset>
        <fieldset>
          <legend>02 / A TOUCH OF COLOR</legend>
          ${colorButtons}
        </fieldset>
        <button class="secondary" id="add">+ Add a flower</button>
        <p class="fine">Tap a flower to remove it. Up to ${MAX_FLOWERS} blooms.</p>
      </div>
    </div>
    <button class="primary" id="finish">Finish my bouquet <span>→</span></button>
    <p class="hint" id="hint-text" role="status"></p>`;

  const bouquet = document.getElementById('bouquet');

  // draws all the flowers in the bouquet
  function drawBouquet() {
    if (flowers.length === 0) {
      bouquet.innerHTML = '<span class="empty-bouquet">Your little garden starts here.</span>';
      return;
    }

    let html = '<span class="bouquet-wrap"></span>';
    for (let i = 0; i < flowers.length; i++) {
      const left = 14 + (i % 3) * 27;
      const top = 12 + Math.floor(i / 3) * 19;
      const rotate = ((i % 3) - 1) * 14;

      html += `
        <button class="bloom" style="--flower:${flowers[i].color};left:${left}%;top:${top}%;transform:rotate(${rotate}deg)" data-remove="${i}" aria-label="Remove ${flowers[i].type} ${i + 1}">
          ${flowerSVG(flowers[i].type, flowers[i].color)}
        </button>`;
    }
    bouquet.innerHTML = html;

    // clicking a flower removes it
    bouquet.querySelectorAll('[data-remove]').forEach(function (button) {
      button.addEventListener('click', function () {
        flowers.splice(Number(button.dataset.remove), 1);
        drawBouquet();
      });
    });
  }

  // choose a flower type
  const flowerChoices = game.querySelectorAll('[data-flower]');
  flowerChoices.forEach(function (button) {
    button.addEventListener('click', function () {
      chosenType = button.dataset.flower;
      flowerChoices.forEach(function (other) {
        const isThis = other === button;
        other.classList.toggle('selected', isThis);
        other.setAttribute('aria-pressed', String(isThis));
      });
    });
  });

  // choose a color
  const colorChoices = game.querySelectorAll('[data-color]');
  colorChoices.forEach(function (button) {
    button.addEventListener('click', function () {
      chosenColor = button.dataset.color;
      colorChoices.forEach(function (other) {
        const isThis = other === button;
        other.classList.toggle('selected', isThis);
        other.setAttribute('aria-pressed', String(isThis));
      });
    });
  });

  document.getElementById('add').addEventListener('click', function () {
    if (flowers.length < MAX_FLOWERS) {
      flowers.push({ type: chosenType, color: chosenColor });
      drawBouquet();
      showHint('A lovely addition!');
    } else {
      showHint('Nine beautiful blooms! Remove one to make room for another.');
    }
  });

  document.getElementById('finish').addEventListener('click', function () {
    if (flowers.length === 0) {
      showHint('Add at least one flower to your bouquet.');
      return;
    }
    complete(3, "Just like these flowers, the knowledge and kindness you've shared continue to bloom.");
  });
}

/* ==========================================================
   Challenge 5: The secret
   ========================================================== */

// Keeps only letters and numbers, in uppercase: "Thank you!" -> "THANKYOU"
function normalize(text) {
  return text.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function startSecretChallenge() {
  const game = document.getElementById('game');

  game.innerHTML = `
    <h1>Two words.<br><em>A whole lot of meaning.</em></h1>
    <div class="gift" aria-hidden="true">
      <div class="gift-bow">୨୧</div>
      <div class="gift-lid"></div>
      <div class="gift-body">♡</div>
    </div>
    <p class="lede">${escapeHTML(config.secret.clue)}</p>
    <form id="secret-form">
      <label class="sr-only" for="secret">The secret words</label>
      <input id="secret" class="secret-input" placeholder="The magic words…" autocomplete="off" required>
      <button class="primary">Unlock the surprise <span>→</span></button>
    </form>
    <button class="text-button" id="hint">✧ A little hint?</button>
    <p class="hint" id="hint-text" role="status"></p>`;

  document.getElementById('hint').addEventListener('click', function () {
    showHint(config.secret.hint);
  });

  document.getElementById('secret-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const typed = document.getElementById('secret').value;

    if (normalize(typed) === normalize(config.secret.answer)) {
      document.querySelector('.gift').classList.add('unlocked');
      complete(4, 'Yes, thank you. For more than words can say.');
    } else {
      showHint('Almost! Two words, from all of our hearts. Try again.');
    }
  });
}
