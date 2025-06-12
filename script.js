const rulerInner = document.getElementById('rulerInner');
const rulerWrapper = document.querySelector('.ruler-wrapper');
const heightDisplay = document.getElementById('heightDisplay');

let markHeight = 0;
let isDragging = false;
let velocity = 0;
let lastY = 0;
let lastTime = 0;
let previousValue = "";
let currentTranslate = 0;

// Центр індикатора — строго центр .ruler-wrapper
const indicatorOffset = () => {
  const wrapperRect = rulerWrapper.getBoundingClientRect();
  return wrapperRect.height / 2 - 53.5;
};

// Генерація шкали: 2'1" – 9'0"
for (let ft = 2; ft <= 9; ft++) {
  for (let inch = 1; inch <= 11; inch++) {
    const div = document.createElement('div');
    div.className = 'ruler-mark';
    div.dataset.value = `${ft}'${inch}"`;

    const tick = document.createElement('div');
    tick.className = 'tick';
    div.appendChild(tick);
    rulerInner.appendChild(div);
  }

  const div = document.createElement('div');
  div.className = 'ruler-mark big';
  div.textContent = `${ft + 1}`;
  div.dataset.value = `${ft + 1}'0"`;

  rulerInner.appendChild(div);
}

// Межі
const minDisplayIndex = (3 - 2) * 12;
const maxDisplayIndex = (8 - 2) * 12 + 11;
const minScrollIndex = minDisplayIndex - 2;
const maxScrollIndex = maxDisplayIndex + 2;

function clampTranslate() {
  const minScroll = indicatorOffset() - minScrollIndex * markHeight;
  const maxScroll = indicatorOffset() - maxScrollIndex * markHeight;
  if (currentTranslate > minScroll) currentTranslate = minScroll;
  if (currentTranslate < maxScroll) currentTranslate = maxScroll;
}

function getSnappedIndex() {
  const raw = (indicatorOffset() - currentTranslate) / markHeight;
  return Math.max(minDisplayIndex, Math.min(maxDisplayIndex, Math.round(raw)));
}

function updateDisplay() {
  const index = getSnappedIndex();
  const item = rulerInner.children[index];
  if (!item) return;

  heightDisplay.textContent = item.dataset.value;

  if (item.dataset.value !== previousValue && navigator.vibrate) {
    navigator.vibrate(10);
    previousValue = item.dataset.value;
  }
}

function animateInertia() {
  velocity *= 0.95;
  currentTranslate -= velocity;
  clampTranslate();
  rulerInner.style.transform = `translateY(${currentTranslate}px)`;
  updateDisplay();
  if (Math.abs(velocity) > 0.1) {
    requestAnimationFrame(animateInertia);
  } else {
    const snappedIndex = getSnappedIndex();
    currentTranslate = indicatorOffset() - snappedIndex * markHeight;
    clampTranslate();
    rulerInner.style.transform = `translateY(${currentTranslate}px)`;
    updateDisplay();
  }
}

// Drag
document.addEventListener('pointerdown', (e) => {
  if (e.target.closest('button')) return;
  e.preventDefault();
  isDragging = true;
  lastY = e.clientY;
  lastTime = performance.now();
  velocity = 0;
});

document.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  e.preventDefault();
  const delta = e.clientY - lastY;
  currentTranslate -= delta;
  clampTranslate();
  rulerInner.style.transform = `translateY(${currentTranslate}px)`;
  const now = performance.now();
  velocity = delta / (now - lastTime) * 16;
  lastY = e.clientY;
  lastTime = now;
  updateDisplay();
});

document.addEventListener('pointerup', () => {
  isDragging = false;
  animateInertia();
});

// Ініціалізація
window.onload = () => {
  const tick1 = rulerInner.children[0].querySelector('.tick');
  const tick2 = rulerInner.children[1].querySelector('.tick');
  markHeight = tick2.getBoundingClientRect().top - tick1.getBoundingClientRect().top;

  const initialIndex = (5 - 2) * 12 + 7; // 5'7"
  currentTranslate = indicatorOffset() - initialIndex * markHeight;
  clampTranslate();
  rulerInner.style.transform = `translateY(${currentTranslate}px)`;
  updateDisplay();
};
