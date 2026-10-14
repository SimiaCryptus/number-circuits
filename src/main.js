import { initCalculator } from './ui/calculator.js';
import { initBrowser } from './ui/browser.js';

for (const btn of document.querySelectorAll('.tab')) {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === btn.dataset.tab));
  });
}

const getOps = () => ({
   pow: document.getElementById('op-pow').checked,
   fact: document.getElementById('op-fact').checked,
});

const updateCalc = initCalculator(document.getElementById('calc'), getOps);
initBrowser(document.getElementById('browser'), getOps);
for (const id of ['op-pow', 'op-fact']) document.getElementById(id).addEventListener('change', updateCalc);
// Example chips: drop an expression into the calculator.
const cInput = document.getElementById('c-input');
for (const chip of document.querySelectorAll('[data-example]')) {
   chip.addEventListener('click', () => {
     document.getElementById('c-mode').value = 'expr';
     cInput.value = chip.dataset.example;
     cInput.dispatchEvent(new Event('input'));
     cInput.focus();
   });
}
// Theme hue: one custom property recolours the whole page.
const hue = document.getElementById('hue');
hue.addEventListener('input', () => {
   document.documentElement.style.setProperty('--hue', hue.value);
   window.dispatchEvent(new Event('themechange'));
});