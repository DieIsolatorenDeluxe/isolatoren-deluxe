/* IndexNow: nur die öffentliche Hauptseite dieses Projekts, keine Besucherdaten. */
const fs = require('node:fs');
const path = require('node:path');
const BASE = 'https://dieisolatorendeluxe.github.io/isolatoren-deluxe/';
const KEY_FILE = '4820a1659e584b95a3d707d5283eda70.txt';
const endpoint = 'https://api.indexnow.org/indexnow';

async function main() {
  const key = fs.readFileSync(path.join(__dirname, KEY_FILE), 'utf8').trim();
  if (!/^[a-f0-9]{32}$/.test(key)) throw new Error('Ungültige IndexNow-Prüfdatei.');
  const payload = {host:new URL(BASE).host, key,
    keyLocation:new URL(KEY_FILE, BASE).href, urlList:[BASE]};
  if (!process.argv.includes('--submit')) {
    console.log(JSON.stringify({mode:'Vorschau – noch nichts gesendet',endpoint,...payload},null,2));
    console.log('Nach einer tatsächlichen Inhaltsänderung: node suchmaschinen-melden.cjs --submit');
    return;
  }
  const options = {signal:AbortSignal.timeout(20000),cache:'no-store'};
  const keyResponse = await fetch(payload.keyLocation, options);
  if (!keyResponse.ok || (await keyResponse.text()).trim() !== key) {
    throw new Error('Prüfdatei ist noch nicht korrekt live erreichbar. Keine Meldung gesendet.');
  }
  const page = await fetch(BASE, {...options,signal:AbortSignal.timeout(20000)});
  if (!page.ok || page.url !== BASE) throw new Error('Hauptseite nicht unter der erwarteten Adresse erreichbar.');
  const html = await page.text();
  if (!html.includes('<link rel="canonical" href="'+BASE+'">') ||
      /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
    throw new Error('Canonical oder Indexierungsfreigabe prüfen. Keine Meldung gesendet.');
  }
  const response = await fetch(endpoint, {method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},
    body:JSON.stringify(payload),signal:AbortSignal.timeout(30000)});
  const body = await response.text();
  console.log(JSON.stringify({time:new Date().toISOString(),endpoint,urlList:payload.urlList,
    status:response.status,meaning:response.status===200?'Meldung empfangen; Indexierung nicht garantiert':
      response.status===202?'Meldung empfangen; Schlüsselprüfung noch ausstehend':'Meldung fehlgeschlagen',body},null,2));
  if (![200,202].includes(response.status)) process.exitCode = 1;
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
