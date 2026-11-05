const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Minimal DOM adapter: tests run the production calculator and its event handlers.
function setup() {
  class Element {
    constructor() {
      this.value = ''; this.textContent = ''; this.style = {}; this.children = [];
      this.attributes = {}; this.listeners = {}; this.dataset = {};
      this.classList = {toggle() {}};
    }
    setAttribute(key, value) { this.attributes[key] = value; }
    removeAttribute(key) { delete this.attributes[key]; }
    appendChild(child) { this.children.push(child); }
    replaceChildren() { this.children = []; this.textContent = ''; }
    addEventListener(type, fn) { this.listeners[type] = fn; }
    focus() {}
    showModal() { this.open = true; }
    close() { this.open = false; }
  }
  const nodes = {};
  const vehicles = ['Trabant','Simson','MZ','Sonstige Zweitakter'].map(name => {
    const element = new Element();
    element.dataset = {name, rec:name === 'Sonstige Zweitakter' ? '' : '50'};
    return element;
  });
  const context = vm.createContext({document:{
    getElementById: id => nodes[id] ||= new Element(),
    querySelectorAll: () => vehicles,
    createElement: () => new Element()
  }});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../calculator.js'),'utf8'), context);
  const submit = (form, input, value) => {
    nodes[input].value = value;
    nodes[form].listeners.submit({preventDefault(){}});
  };
  return {nodes, vehicles, context, submit, result:kind => nodes[kind+'Result'].children.map(el=>el.textContent).join(' ')};
}
test('5 litres at 1:50 gives 100 ml; decimals at 1:33 round correctly', () => {
  const app=setup(); app.vehicles[1].onclick();
  app.nodes.fuelInput.value='5'; app.context.calculateMix();
  assert.match(app.result('mix'), /100 ml/);
  app.context.setRatio(33); app.nodes.fuelInput.value='2.5'; app.context.calculateMix();
  assert.match(app.result('mix'), /76 ml/);
});
test('ratio indicator follows custom choices and vehicle changes without stale selection', () => {
  const app=setup(); app.vehicles[1].onclick();
  assert.match(app.nodes.activeRatioBadge.textContent,/1 : 50/);
  app.context.openRatioModal();
  assert.equal(app.nodes.ratioOptions.children[2].attributes['aria-pressed'],'true');
  app.submit('ratioForm','ratioInput','25');
  assert.match(app.nodes.activeRatioBadge.textContent,/1 : 25/);
  app.context.openRatioModal();
  assert.ok(app.nodes.ratioOptions.children.every(e=>e.attributes['aria-pressed']==='false'));
  assert.match(app.nodes.currentRatioModalStatus.textContent,/1 : 25/);
  app.vehicles[3].onclick();
  assert.match(app.nodes.activeRatioBadge.textContent,/Bitte Mischungsverhältnis wählen/);
});
test('invalid fuel amounts remove previous results and explain the error', () => {
  for (const value of ['-2','-5','0','','Infinity','NaN']) {
    const app=setup(); app.vehicles[1].onclick();
    app.nodes.fuelInput.value='5'; app.context.calculateMix();
    app.nodes.fuelInput.value=value; app.context.calculateMix();
    assert.equal(app.nodes.mixResult.style.display,'none');
    assert.match(app.nodes.mixError.textContent,/größer als 0/);
  }
});
test('missing ratio gives an actionable message', () => {
  const app=setup(); app.context.calculateMix(); app.context.calculateBack();
  assert.match(app.nodes.mixError.textContent,/Mischungsverhältnis wählen/);
  assert.match(app.nodes.backError.textContent,/Mischungsverhältnis wählen/);
});
test('custom ratio rejects fractions, trailing characters and out-of-range values', () => {
  for (const value of ['0','101','33.5','50abc','']) {
    const app=setup(); app.context.openRatioModal();
    app.submit('ratioForm','ratioInput',value);
    assert.equal(app.nodes.ratioModal.open,true);
    assert.match(app.nodes.ratioError.textContent,/ganze Zahl/);
  }
});
test('custom ratio works for other vehicles and is displayed', () => {
  const app=setup(); app.vehicles[3].onclick(); app.context.openRatioModal();
  app.submit('ratioForm','ratioInput','40');
  assert.equal(app.nodes.ratioModal.open,false);
  assert.match(app.nodes.mixState.textContent,/1 : 40/);
  app.nodes.fuelInput.value='4'; app.context.calculateMix();
  assert.match(app.result('mix'),/100 ml/);
});
test('recommended ratio remains available after manual selection', () => {
  const app=setup(); app.vehicles[1].onclick(); app.context.setRatio(33);
  app.context.openRatioModal();
  const recommended=app.nodes.ratioOptions.children.find(el=>el.textContent.includes('empfohlen'));
  recommended.onclick();
  assert.match(app.nodes.mixState.textContent,/1 : 50 \(empfohlen\)/);
});
test('reverse calculator gives 5 litres from 100 ml at 1:50 and rejects invalid amounts', () => {
  const app=setup(); app.submit('backRatioForm','backRatioInput','50');
  app.nodes.oilInput.value='100'; app.context.calculateBack();
  assert.match(app.result('back'),/5,00 Liter/);
  for (const value of ['-100','0','','Infinity']) {
    app.nodes.oilInput.value=value; app.context.calculateBack();
    assert.equal(app.nodes.backResult.style.display,'none');
    assert.match(app.nodes.backError.textContent,/größer als 0/);
  }
});
test('editing an amount immediately clears stale output', () => {
  const app=setup(); app.vehicles[1].onclick();
  app.nodes.fuelInput.value='5'; app.context.calculateMix();
  app.nodes.fuelInput.listeners.input();
  assert.equal(app.nodes.mixResult.style.display,'none');
});
test('tiny positive amounts do not misleadingly round to zero', () => {
  const app=setup(); app.vehicles[1].onclick(); app.nodes.fuelInput.value='0.001'; app.context.calculateMix();
  assert.match(app.result('mix'),/< 1 ml/);
  app.submit('backRatioForm','backRatioInput','50'); app.nodes.oilInput.value='0.001'; app.context.calculateBack();
  assert.match(app.result('back'),/< 0,01 Liter/);
});
