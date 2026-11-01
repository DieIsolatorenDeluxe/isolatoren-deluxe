'use strict';
(() => {
  const get = id => document.getElementById(id);
  const install = get('installApp');
  const share = get('shareApp');
  const saveDesktop = get('saveDesktop');
  const help = get('installHelp');
  const feedback = get('appFeedback');
  const status = get('connectionStatus');
  const standalone = window.matchMedia('(display-mode: standalone)');
  const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(navigator.userAgent);
  let pendingInstall = null;
  let offlineReady = false;
  let installed = navigator.standalone === true || standalone.matches;
  let registration = null;
  let updateCheck = null;

  function updateStatus() {
    status.textContent = navigator.onLine === false
      ? 'Du bist offline. Der Rechner funktioniert; Social-Media-Profile benötigen Internet.'
      : offlineReady ? 'Rechner offline verfügbar. Social-Media-Profile benötigen Internet.'
      : 'Zum Offline-Nutzen die Seite einmal mit Internet geöffnet lassen.';
  }
  function updateInstall() {
    install.hidden = installed || standalone.matches || navigator.standalone === true;
  }
  get('iosInstructions').hidden = !isIOS;
  get('androidInstructions').hidden = !isAndroid;
  get('desktopInstructions').hidden = isIOS || isAndroid;
  saveDesktop.hidden = isIOS || isAndroid;
  updateInstall();
  updateStatus();
  standalone.addEventListener?.('change', updateInstall);
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    pendingInstall = event;
    updateInstall();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    pendingInstall = null;
    updateInstall();
    feedback.textContent = 'App installiert. Du findest sie auf deinem Startbildschirm.';
  });
  function openHelp() {
    if (typeof help.showModal === 'function') help.showModal();
    else help.setAttribute('open', '');
  }
  saveDesktop.addEventListener('click', openHelp);
  install.addEventListener('click', async () => {
    if (!pendingInstall) {
      openHelp();
      return;
    }
    const prompt = pendingInstall;
    pendingInstall = null;
    install.disabled = true;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') feedback.textContent = 'Installation bestätigt. Dein Browser richtet die App ein.';
    } catch {
      feedback.textContent = 'Bitte die App über das Menü deines Browsers hinzufügen.';
    } finally { install.disabled = false; }
  });
  get('closeInstallHelp').addEventListener('click', () => {
    if (typeof help.close === 'function') help.close();
    else help.removeAttribute('open');
  });

  // Share only the public home page, never input values or URL parameters.
  const appUrl = new URL('./', window.location.href).href;
  share.addEventListener('click', async () => {
    feedback.textContent = '';
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({title:'Die Isolatoren Deluxe – Gemischrechner',url:appUrl});
      } catch (error) {
        if (error.name !== 'AbortError') feedback.textContent = `Teilen nicht möglich. Link: ${appUrl}`;
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(appUrl);
      feedback.textContent = 'Link kopiert – du kannst ihn jetzt einfügen und teilen.';
    } catch { feedback.textContent = `Link zum Kopieren: ${appUrl}`; }
  });

  function checkForUpdate() {
    if (!registration || navigator.onLine === false || updateCheck) return;
    updateCheck = registration.update().catch(() => {}).finally(() => { updateCheck = null; });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate();
  });
  window.addEventListener('online', checkForUpdate);
  if ('serviceWorker' in navigator) {
    // The script sits at the end of body: registration need not wait for large images.
    navigator.serviceWorker.register('sw.js', {updateViaCache:'none'})
      .then(value => {
        registration = value;
        return navigator.serviceWorker.ready;
      }).then(() => { offlineReady = true; updateStatus(); })
      .catch(() => {
        status.textContent = 'Offline-Speicherung nicht verfügbar. Mit Internet kannst du den Rechner weiter nutzen.';
      });
  }
})();
