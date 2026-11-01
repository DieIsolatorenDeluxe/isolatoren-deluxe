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
test('mobile browser variants keep the same installation fallback available',async()=>{
  const variants=[
    ['iPhone Safari','iosInstructions'],['iPhone CriOS/143','iosInstructions'],
    ['iPhone FxiOS/145','iosInstructions'],['iPhone EdgiOS/143','iosInstructions'],
    ['Android Chrome/143','androidInstructions'],['Android Firefox/145','androidInstructions'],
    ['Android SamsungBrowser/29','androidInstructions'],['Android EdgA/143','androidInstructions'],
    ['iPhone Instagram','iosInstructions'],['Android FBAN/FB4A','androidInstructions']
  ];
  for(const [userAgent,id] of variants){
    const app=setup({navigator:{userAgent}});
    await app.nodes.installApp.listeners.click();
    assert.equal(app.nodes.installHelp.open,true,userAgent);
    assert.equal(app.nodes[id].hidden,false,userAgent);
  }
});
test('installation help can copy a link even without native sharing',async()=>{
  let copied;
  const app=setup({navigator:{clipboard:{writeText:async value=>copied=value}}});
  await app.nodes.copyAppLink.listeners.click();
  assert.equal(copied,'https://example.test/isolatoren-deluxe/');
  assert.match(app.nodes.installFeedback.textContent,/Link kopiert/);
  const blocked=setup();await blocked.nodes.copyAppLink.listeners.click();
  assert.match(blocked.nodes.installFeedback.textContent,/Link zum Kopieren/);
});
test('all instructions can be shown if the browser hides its device identity',()=>{
  const app=setup();app.nodes.showAllInstructions.listeners.click();
  for(const id of ['iosInstructions','androidInstructions','desktopInstructions']) assert.equal(app.nodes[id].hidden,false);
});
test('installed app hides installation action',()=>{
  assert.equal(setup({standalone:true}).nodes.installApp.hidden,true);
  assert.equal(setup({navigator:{standalone:true}}).nodes.installApp.hidden,true);
});
test('desktop Chrome gets exact menu instructions and only matching device help',async()=>{
  const app=setup({navigator:{userAgent:'Windows Chrome',platform:'Win32'}});
  assert.equal(app.nodes.desktopInstructions.hidden,false);
  assert.equal(app.nodes.iosInstructions.hidden,true);
  assert.equal(app.nodes.androidInstructions.hidden,true);
  await app.nodes.installApp.listeners.click();
  assert.equal(app.nodes.installHelp.open,true);
  assert.match(app.nodes.desktopStep1.textContent,/Chrome/);
  assert.match(app.nodes.desktopStep2.textContent,/Streamen, speichern und teilen/);
});
test('manual installation opens a short guide with advanced options collapsed',async()=>{
  const app=setup();await app.nodes.installApp.listeners.click();
  app.nodes.moreInstallHelp.open=true;
  app.nodes.closeInstallHelp.listeners.click();
  await app.nodes.installApp.listeners.click();
  assert.equal(app.nodes.installHelp.open,true);
  assert.equal(app.nodes.moreInstallHelp.open,false);
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  assert.ok(html.includes('<summary>Weitere Möglichkeiten</summary>'));
  assert.ok(html.includes('id="installApp" type="button" aria-haspopup="dialog"'));
});
test('Mac Safari gets a three-step Add to Dock guide',()=>{
  const app=setup({navigator:{userAgent:'Macintosh Safari',platform:'MacIntel'}});
  assert.match(app.nodes.desktopStep1.textContent,/Ablage/);
  assert.match(app.nodes.desktopStep2.textContent,/Zum Dock hinzufügen/);
  assert.match(app.nodes.desktopStep3.textContent,/Hinzufügen/);
});

test('desktop browser detection and manual selection show distinct installation and icon instructions',()=>{
  for(const [userAgent,browser,expected] of [
    ['Windows Chrome/150 Edg/150','edge',/Weitere Tools/],
    ['Windows Firefox/150','firefox',/Firefox/],
    ['Windows Chrome/150 OPR/130','other',/Lesezeichen/]
  ]){
    const app=setup({navigator:{userAgent,platform:'Win32'}});
    assert.equal(app.nodes.desktopBrowser.value,browser);
    assert.match(app.nodes.desktopStep2.textContent+app.nodes.desktopStep3.textContent,expected);
    app.nodes.desktopBrowser.value='chrome';app.nodes.desktopBrowser.listeners.change();
    assert.match(app.nodes.shortcutStep1.textContent,/chrome:\/\/apps/);
    assert.match(app.nodes.shortcutStep3.textContent,/Desktop/);
    app.nodes.desktopBrowser.value='safari';app.nodes.desktopBrowser.listeners.change();
    assert.equal(app.nodes.desktopStep4.hidden,true);
    assert.match(app.nodes.desktopLocation.textContent,/Dock/);
    app.nodes.desktopBrowser.value='other';app.nodes.desktopBrowser.listeners.change();
    assert.equal(app.nodes.browserHelpLink.hidden,true);
  }
});

test('desktop installation feedback does not promise a mobile homescreen icon',()=>{
  const app=setup({navigator:{userAgent:'Windows Chrome/150',platform:'Win32'}});
  app.events.appinstalled();
  assert.match(app.nodes.appFeedback.textContent,/Desktop-Symbol/);
  assert.doesNotMatch(app.nodes.appFeedback.textContent,/Startbildschirm/);
});
test('installation does not offer ZIP downloads or manual desktop shortcuts',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  assert.doesNotMatch(html,/desktop-verknuepfungen|gemischrechner\.(url|webloc)|saveDesktop/);
  assert.equal((html.match(/id="installApp"/g)||[]).length,1);
});
test('QR code opens in a separate dialog and links to the public installation page',()=>{
  const app=setup();app.nodes.showQRCode.listeners.click();
  assert.equal(app.nodes.qrHelp.open,true);
  app.nodes.closeQRCode.listeners.click();assert.equal(app.nodes.qrHelp.open,false);
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  assert.ok(html.includes('src="teilen-qr.png"'));
  assert.ok(html.includes('href="teilen-qr.png" download="Isolatoren-Deluxe-QR.png"'));
  const png=fs.readFileSync(path.join(__dirname,'../teilen-qr.png'));
  assert.equal(png.readUInt32BE(16),768);assert.equal(png.readUInt32BE(20),768);
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
test('iPhone icon has the declared size and uses a new cache-safe filename',()=>{
  const root=path.join(__dirname,'..');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.ok(html.includes('rel="apple-touch-icon" href="app-icon-180.png" sizes="180x180"'));
  const image=fs.readFileSync(path.join(root,'app-icon-180.png'));
  assert.equal(image.readUInt32BE(16),180);assert.equal(image.readUInt32BE(20),180);
});
test('desktop icon contains valid images for small and large displays',()=>{
  const ico=fs.readFileSync(path.join(__dirname,'../app-icon.ico'));
  assert.equal(ico.readUInt16LE(0),0);assert.equal(ico.readUInt16LE(2),1);
  assert.equal(ico.readUInt16LE(4),6);
  for(let i=0;i<6;i++){
    const start=6+i*16,bytes=ico.readUInt32LE(start+8),offset=ico.readUInt32LE(start+12);
    assert.ok(offset+bytes<=ico.length);
    assert.equal(ico.subarray(offset,offset+8).toString('hex'),'89504e470d0a1a0a');
    assert.equal(ico.readUInt32BE(offset+16),ico[start]||256);
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
