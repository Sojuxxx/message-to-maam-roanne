// animations.js
// Confetti, floating hearts, and the background music.

// true if the visitor asked their device to reduce motion
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Confetti ----------
function celebrate() {
  if (reducedMotion || !window.confetti) return;

  confetti({
    particleCount: 90,
    spread: 75,
    origin: { y: 0.65 },
    colors: ['#B9A7F5', '#F8C8DC', '#49376B', '#e6be75']
  });
}

// ---------- Floating hearts ----------
function sendHearts() {
  if (reducedMotion) {
    announce('Sending you lots of love! 💜');
    return;
  }

  const symbols = ['♡', '♥', '💜'];
  const effects = document.getElementById('effects');

  for (let i = 0; i < 16; i++) {
    const heart = document.createElement('span');
    heart.className = 'flying-heart';
    heart.textContent = symbols[i % 3];
    heart.style.left = 10 + Math.random() * 80 + '%';
    heart.style.animationDelay = Math.random() + 's';
    heart.style.fontSize = 20 + Math.random() * 25 + 'px';
    effects.appendChild(heart);

    // remove the heart after the animation ends
    setTimeout(function () {
      heart.remove();
    }, 4500);
  }
}

// ---------- Background music (made with the Web Audio API) ----------
const notes = [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 349.23];
let audioContext = null;
let musicTimer = null;
let noteIndex = 0;

function playNote() {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;

  oscillator.type = 'sine';
  oscillator.frequency.value = notes[noteIndex % notes.length];
  noteIndex++;

  // fade in quickly, then fade out slowly
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.045, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(now + 1.5);
}

// Turns the music on or off. Returns true if the music is now playing.
function toggleSound() {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
    audioContext.suspend();
    return false;
  }

  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  audioContext.resume();

  noteIndex = 0;
  playNote();
  musicTimer = setInterval(playNote, 650);
  return true;
}
