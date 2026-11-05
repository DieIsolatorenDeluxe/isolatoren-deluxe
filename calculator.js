'use strict';
const byId = id => document.getElementById(id);
const elements = Object.fromEntries(['mixResult','backResult','mixState','backState','fuelInput','oilInput','mixError','backError','ratioModal','backModal','ratioOptions','ratioForm','backRatioForm','ratioInput','backRatioInput','ratioError','backRatioError'].map(id => [id, byId(id)]));
elements.activeRatioBadge = byId('activeRatioBadge');
elements.currentRatioModalStatus = byId('currentRatioModalStatus');
let vehicle = null;
let recommendedRatio = null;
let activeRatio = null;
let backRatio = null;

function clearResult(kind) {
  elements[kind + 'Result'].style.display = 'none';
  elements[kind + 'Result'].textContent = '';
  elements[kind + 'Error'].textContent = '';
  elements[kind === 'mix' ? 'fuelInput' : 'oilInput'].removeAttribute('aria-invalid');
}
function fail(kind, message) {
  clearResult(kind);
  elements[kind + 'Error'].textContent = message;
}
document.querySelectorAll('.vehicle').forEach(button => {
  button.onclick = () => {
    document.querySelectorAll('.vehicle').forEach(other => {
      other.classList.toggle('active', other === button);
      other.setAttribute('aria-pressed', String(other === button));
    });
    vehicle = button.dataset.name;
    recommendedRatio = Number(button.dataset.rec) || null;
    activeRatio = recommendedRatio;
    clearResult('mix');
    updateMixState();
  };
});
function updateMixState() {
  elements.activeRatioBadge.textContent = activeRatio ? `✓ Ausgewählt: 1 : ${activeRatio}` : 'Bitte Mischungsverhältnis wählen';
  elements.activeRatioBadge.classList.toggle('has-ratio', Boolean(activeRatio));
  elements.mixState.textContent = vehicle
    ? `Ausgewählt: ${vehicle} · ${activeRatio ? `Aktiv: 1 : ${activeRatio} (${activeRatio === recommendedRatio ? 'empfohlen' : 'manuell'})` : 'Bitte Mischungsverhältnis wählen'}`
    : activeRatio ? `Aktiv: 1 : ${activeRatio} (manuell)` : '';
}
function openRatioModal() {
  elements.currentRatioModalStatus.textContent = activeRatio ? `Aktuell ausgewählt: 1 : ${activeRatio}` : 'Noch kein Verhältnis ausgewählt';
  elements.ratioOptions.replaceChildren();
  [33,40,50].forEach(ratio => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option';
    button.setAttribute('aria-pressed', String(ratio === activeRatio));
    button.textContent = `${ratio === activeRatio ? '✓ ' : ''}1 : ${ratio}${ratio === activeRatio ? ' · Ausgewählt' : ''}${ratio === recommendedRatio ? ' (empfohlen)' : ''}`;
    button.onclick = () => setRatio(ratio);
    elements.ratioOptions.appendChild(button);
  });
  elements.ratioInput.value = activeRatio || '';
  elements.ratioInput.removeAttribute('aria-invalid');
  elements.ratioError.textContent = '';
  elements.ratioModal.showModal();
}
function closeRatioModal() { elements.ratioModal.close(); }
function setRatio(ratio) {
  activeRatio = ratio;
  clearResult('mix');
  updateMixState();
  closeRatioModal();
}
function openBackModal() {
  elements.backRatioInput.value = backRatio || '';
  elements.backRatioInput.removeAttribute('aria-invalid');
  elements.backRatioError.textContent = '';
  elements.backModal.showModal();
}
function closeBackModal() { elements.backModal.close(); }
function submitRatio(input, error, apply) {
  const value = Number(input.value);
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    error.textContent = 'Bitte eine ganze Zahl von 1 bis 100 eingeben.';
    input.setAttribute('aria-invalid', 'true');
    input.focus();
    return;
  }
  input.removeAttribute('aria-invalid');
  apply(value);
}
elements.ratioForm.addEventListener('submit', event => {
  event.preventDefault();
  submitRatio(elements.ratioInput, elements.ratioError, setRatio);
});
elements.backRatioForm.addEventListener('submit', event => {
  event.preventDefault();
  submitRatio(elements.backRatioInput, elements.backRatioError, value => {
    backRatio = value;
    elements.backState.textContent = `Aktives Mischungsverhältnis: 1 : ${value}`;
    clearResult('back');
    closeBackModal();
  });
});
function readAmount(kind, ratio) {
  clearResult(kind);
  if (!ratio) {
    fail(kind, 'Bitte zuerst ein Mischungsverhältnis wählen.');
    return null;
  }
  const input = elements[kind === 'mix' ? 'fuelInput' : 'oilInput'];
  const amount = Number(input.value);
  if (!Number.isFinite(amount) || amount <= 0) {
    fail(kind, 'Bitte eine Menge größer als 0 eingeben.');
    input.setAttribute('aria-invalid', 'true');
    return null;
  }
  return amount;
}
function showResult(kind, amount, ratio) {
  const result = elements[kind + 'Result'];
  result.replaceChildren();
  for (const [className, text] of [['result-main', amount], ['result-info', `Berechnet mit 1 : ${ratio}`]]) {
    const line = document.createElement('div');
    line.className = className;
    line.textContent = text;
    result.appendChild(line);
  }
  result.style.display = 'block';
}
function calculateMix() {
  const fuel = readAmount('mix', activeRatio);
  if (fuel === null) return;
  const oil = fuel / activeRatio * 1000;
  if (!Number.isFinite(oil)) return fail('mix', 'Die eingegebene Menge ist zu groß.');
  const display = oil < 1 ? '< 1' : Math.round(oil).toLocaleString('de-DE');
  showResult('mix', `${display} ml Öl zugeben`, activeRatio);
}
function calculateBack() {
  const oil = readAmount('back', backRatio);
  if (oil === null) return;
  const fuel = oil / 1000 * backRatio;
  if (!Number.isFinite(fuel)) return fail('back', 'Die eingegebene Menge ist zu groß.');
  const display = fuel < 0.01 ? '< 0,01' : fuel.toLocaleString('de-DE', {minimumFractionDigits:2, maximumFractionDigits:2});
  showResult('back', `${display} Liter Benzin`, backRatio);
}
for (const [id, kind, calculate] of [['fuelInput','mix',calculateMix],['oilInput','back',calculateBack]]) {
  elements[id].addEventListener('input', () => clearResult(kind));
  elements[id].addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); calculate(); }
  });
}
