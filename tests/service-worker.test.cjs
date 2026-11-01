const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup(oldKeys = []) {
  const scope = 'https://example.test/isolatoren-deluxe/';
  const handlers = {}, entries = new Map(), deleted = [], navigated = [];
  let network = async () => new Response('new app'), claimed = false, waiting = false;
  const cache = {
    addAll: async requests => { for (const request of requests) {
      assert.equal(request.cache,'reload'); entries.set(request.url,new Response('installed app'));
    }},
    match: async request => entries.get(typeof request === 'string' ? request : request.url)?.clone(),
    put: async (request,response) => entries.set(request.url,response)
  };
  const windows = [scope, 'https://example.test/unrelated/'].map(url => ({
    url, navigate:async target => navigated.push(target)
  }));
  const context = vm.createContext({Request,Response,URL,
    caches:{open:async () => cache, keys:async () => [...oldKeys,'gemischrechner-v4'],
      delete:async key => deleted.push(key)},
    self:{registration:{scope},addEventListener:(type,fn) => handlers[type]=fn,
      skipWaiting:async () => {waiting=true;},clients:{claim:async () => {claimed=true;},matchAll:async () => windows}},
    fetch:(...args) => network(...args)
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8'),context);
  return {scope,entries,deleted,navigated, get claimed(){return claimed;},get waiting(){return waiting;},
    network:fn => {network=fn;},
    dispatch:async (type,request) => {
      let response, lifetime;
      handlers[type]({request,waitUntil:promise=>lifetime=promise,respondWith:promise=>response=promise});
      await lifetime;
      return response;
    }};
}
test('install fetches the complete calculator shell without using HTTP cache',async () => {
  const app=setup(); await app.dispatch('install');
  assert.equal(app.entries.size,17); assert.equal(app.waiting,true);
  assert.ok(app.entries.has(app.scope+'calculator.js'));
  for (const file of ['app.js','icon_instagram.webp','icon_facebook.webp','icon_tiktok.webp','app-maskable-512.png']) {
    assert.ok(app.entries.has(app.scope+file));
  }
});
test('upgrading from v1 refreshes old app windows and preserves unrelated caches',async () => {
  const app=setup(['gemischrechner-v1','another-project']);
  await app.dispatch('activate');
  assert.deepEqual(app.deleted,['gemischrechner-v1']);
  assert.equal(app.claimed,true); assert.deepEqual(app.navigated,[app.scope]);
});
test('first installation does not reload the user page',async () => {
  const app=setup(); await app.dispatch('activate'); assert.deepEqual(app.navigated,[]);
});
test('online navigation replaces stale cached HTML and bypasses HTTP cache',async () => {
  const app=setup(); const request={method:'GET',url:app.scope,mode:'navigate'};
  app.entries.set(request.url,new Response('old negative calculator'));
  app.network(async (req,options)=>{assert.equal(options.cache,'no-store');return new Response('fixed calculator');});
  assert.equal(await (await app.dispatch('fetch',request)).text(),'fixed calculator');
  assert.equal(await app.entries.get(request.url).text(),'fixed calculator');
});
test('calculator remains available offline and query strings use the cached shell',async () => {
  const app=setup(); await app.dispatch('install'); app.network(async()=>{throw new Error('offline');});
  for (const request of [
    {method:'GET',url:app.scope+'calculator.js',mode:'cors'},
    {method:'GET',url:app.scope+'?updated=1',mode:'navigate'}
  ]) assert.equal(await (await app.dispatch('fetch',request)).text(),'installed app');
});
test('external requests and writes are not intercepted',async () => {
  const app=setup();
  assert.equal(await app.dispatch('fetch',{method:'GET',url:'https://other.test/',mode:'cors'}),undefined);
  assert.equal(await app.dispatch('fetch',{method:'POST',url:app.scope,mode:'cors'}),undefined);
});
