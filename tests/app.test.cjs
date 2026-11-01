const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
function setup(options={}) {
  const nodes={}, events={}, documentEvents={};
  const get=id=>nodes[id]||=(
    {hidden:false,disabled:false,textContent:'',listeners:{},
      addEventListener(type,fn){this.listeners[type]=fn;},
      showModal(){this.open=true;},close(){this.open=false;}}
  );
  let registrationOptions,updates=0;
  const navigator={userAgent:'Android',platform:'Linux',maxTouchPoints:0,onLine:true,
    serviceWorker:{register:async (...args)=>{registrationOptions=args;return {update:async()=>{updates++;}};},ready:Promise.resolve()},
    ...options.navigator};
  const context=vm.createContext({URL,navigator,document:{getElementById:get,
    visibilityState:'visible',addEventListener:(name,fn)=>documentEvents[name]=fn},
    window:{location:{href:'https://example.test/isolatoren-deluxe/?private=value#result'},
      matchMedia:()=>({matches:!!options.standalone,addEventListener(){}}),
      addEventListener:(name,fn)=>events[name]=fn}
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'),context);
  return {nodes,navigator,events,documentEvents,get updates(){return updates;},get registrationOptions(){return registrationOptions;}};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('Android without a native prompt shows manual installation instructions',async()=>{
  const app=setup(); await app.nodes.installApp.listeners.click();
  assert.equal(app.nodes.installHelp.open,true);
  assert.equal(app.nodes.iosInstructions.hidden,true);
  assert.equal(app.nodes.androidInstructions.hidden,false);
});
test('iPhone and desktop-mode iPad show Apple instructions',()=>{
  for(const navigator of [{userAgent:'iPhone Safari'},{userAgent:'Macintosh Safari',platform:'MacIntel',maxTouchPoints:5}]){
    const app=setup({navigator});
    assert.equal(app.nodes.androidInstructions.hidden,true);
    assert.equal(app.nodes.iosInstructions.hidden,false);
  }
});
test('installed app hides installation action',()=>{
  assert.equal(setup({standalone:true}).nodes.installApp.hidden,true);
  assert.equal(setup({navigator:{standalone:true}}).nodes.installApp.hidden,true);
});
test('native Android installation requires a button click and handles dismissal',async()=>{
  const app=setup();let prompted=0,prevented=false;
  app.events.beforeinstallprompt({preventDefault(){prevented=true;},prompt:async()=>{prompted++;},userChoice:Promise.resolve({outcome:'dismissed'})});
  assert.equal(prompted,0);assert.equal(prevented,true);
  await app.nodes.installApp.listeners.click();
  assert.equal(prompted,1);assert.equal(app.nodes.installApp.disabled,false);
  await app.nodes.installApp.listeners.click();assert.equal(app.nodes.installHelp.open,true);
  app.events.appinstalled();assert.equal(app.nodes.installApp.hidden,true);
});
test('sharing sends only the public URL and does not copy after user cancellation',async()=>{
  let copied=false,payload;
  const app=setup({navigator:{share:async value=>{payload=value;throw {name:'AbortError'};},clipboard:{writeText:async()=>{copied=true;}}}});
  await app.nodes.shareApp.listeners.click();
  assert.equal(payload.url,'https://example.test/isolatoren-deluxe/');
  assert.equal(copied,false);assert.equal(app.nodes.appFeedback.textContent,'');
});
test('browsers without native sharing copy the link and handle blocked clipboard',async()=>{
  let copied;
  const app=setup({navigator:{clipboard:{writeText:async text=>copied=text}}});
  await app.nodes.shareApp.listeners.click();
  assert.equal(copied,'https://example.test/isolatoren-deluxe/');
  assert.match(app.nodes.appFeedback.textContent,/Link kopiert/);
  const blocked=setup();await blocked.nodes.shareApp.listeners.click();
  assert.match(blocked.nodes.appFeedback.textContent,/Link zum Kopieren/);
});
test('offline readiness waits for service worker and returning online checks for updates',async()=>{
  const app=setup();await flush();
  assert.equal(app.registrationOptions[1].updateViaCache,'none');
  assert.match(app.nodes.connectionStatus.textContent,/offline verfügbar/);
  app.navigator.onLine=false;app.events.offline();
  assert.match(app.nodes.connectionStatus.textContent,/Du bist offline/);
  app.documentEvents.visibilitychange();assert.equal(app.updates,0);
  app.navigator.onLine=true;app.documentEvents.visibilitychange();await flush();
  assert.equal(app.updates,1);
});
test('manifest stays inside the project and supplies a separate maskable icon',()=>{
  const root=path.join(__dirname,'..');
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  assert.equal(manifest.id,'./');assert.equal(manifest.scope,'./');assert.equal(manifest.start_url,'./');
  assert.ok(manifest.icons.some(icon=>icon.purpose==='maskable'));
  for(const icon of manifest.icons){
    const png=fs.readFileSync(path.join(root,icon.src));
    assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`,icon.sizes);
  }
});
test('all social links are named, external HTTPS links with compact local icons',()=>{
  const root=path.join(__dirname,'..');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const links=[...html.matchAll(/<a href="([^"]+)"[^>]*class="social-tile"[^>]*>/g)];
  assert.equal(links.length,23);
  const names=new Set();
  for(const [tag,href] of links){
    const url=new URL(href);
    assert.equal(url.protocol,'https:');
    assert.match(url.hostname,/^(www\.)?(instagram|facebook|tiktok)\.com$/);
    assert.match(tag,/rel="noopener noreferrer external"/);
    const name=tag.match(/aria-label="([^"]+)"/)?.[1];
    assert.ok(name);assert.equal(names.has(name),false);names.add(name);
  }
  for(const platform of ['instagram','facebook','tiktok']){
    assert.ok(fs.statSync(path.join(root,`icon_${platform}.webp`)).size<5000);
    assert.ok(html.includes(`src="icon_${platform}.webp"`));
  }
});
