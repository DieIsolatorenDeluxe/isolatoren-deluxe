'use strict';
(() => {
  const get = id => document.getElementById(id);
  const install = get('installApp');
  const share = get('shareApp');
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
  const ua = navigator.userAgent;
  const browserChoice = get('desktopBrowser');
  browserChoice.value = /Edg\//.test(ua) ? 'edge' : /Firefox\//.test(ua) ? 'firefox' :
    /OPR\/|Opera/.test(ua) ? 'other' : /Chrome|Chromium/.test(ua) ? 'chrome' :
    /Safari/.test(ua) && /Mac/.test(navigator.platform) ? 'safari' : 'other';
  const guides = {
    chrome: {
      steps: ['Oben rechts in Chrome auf die drei Punkte (⋮) klicken.', '„Streamen, speichern und teilen“ öffnen.', '„Seite als App installieren…“ auswählen.', 'Im neuen Fenster auf „Installieren“ klicken.'],
      location: 'Unter Windows: Startmenü öffnen und nach „Gemischrechner“ suchen. Ein Desktop-Symbol wird nicht immer automatisch angelegt.',
      shortcut: ['In einem neuen Chrome-Tab chrome://apps in die Adresszeile eingeben und Enter drücken.', 'Mit der rechten Maustaste auf den Gemischrechner klicken und „Verknüpfung erstellen“ wählen.', '„Desktop“ auswählen und mit „Erstellen“ bestätigen.'],
      url: 'https://support.google.com/chrome/answer/9658361?hl=de'
    },
    edge: {
      steps: ['Oben rechts in Edge auf die drei Punkte (…) klicken.', '„Weitere Tools“ öffnen, dann „Apps“ auswählen. Je nach Version steht „Apps“ direkt im Hauptmenü.', '„Diese Website als App installieren“ auswählen.', 'Mit „Installieren“ bestätigen. Falls angeboten, „Desktopverknüpfung erstellen“ aktivieren.'],
      location: 'Die App findest du in Edge unter edge://apps. Unter Windows kannst du sie auch im Startmenü suchen.',
      shortcut: ['In einem neuen Edge-Tab edge://apps in die Adresszeile eingeben und Enter drücken.', 'Beim Gemischrechner auf „Details“ klicken.', '„Desktopverknüpfung erstellen“ auswählen. Dort lässt sich die App auch an die Taskleiste anheften.'],
      url: 'https://support.microsoft.com/de-de/edge/install-manage-or-uninstall-apps-in-microsoft-edge'
    },
    safari: {
      steps: ['In Safari auf dem Mac oben in der Menüleiste „Ablage“ öffnen.', '„Zum Dock hinzufügen“ wählen.', 'Mit „Hinzufügen“ bestätigen.'],
      location: 'Du findest die App mit unserem Logo unten im Dock und im Ordner „Programme“ deines Benutzerordners. Safari erstellt dabei kein Symbol auf dem Schreibtisch. Die Funktion benötigt macOS Sonoma oder neuer.',
      shortcut: ['Die App direkt über das Logo im Dock öffnen.', 'Fehlt sie dort, im Finder den Ordner „Programme“ deines Benutzerordners öffnen und den Gemischrechner ins Dock ziehen.'],
      url: 'https://support.apple.com/de-de/104996'
    },
    firefox: {
      steps: ['Unter Windows rechts in der Firefox-Adressleiste auf das Web-App-Symbol klicken.', 'Firefox öffnet die Seite als App und legt einen Eintrag im Startmenü an.', 'Bei der Frage zum Anheften an die Taskleiste auf „Ja“ klicken.'],
      location: 'Unter Windows findest du die App im Startmenü, meist im Ordner „Firefox Web Apps“. Voraussetzung: Firefox ab Version 143, bei der Microsoft-Store-Version ab 150. Auf Mac und Linux bietet Firefox diese Installation derzeit nicht an; dort kannst du ein Lesezeichen verwenden.',
      shortcut: ['Unter Windows das Startmenü öffnen und nach „Gemischrechner“ suchen.', 'Die App öffnen. Mit der rechten Maustaste auf ihr Symbol unten in der Taskleiste klicken und „An Taskleiste anheften“ wählen. Ein Desktop-Symbol legt Firefox nicht automatisch an.'],
      url: 'https://support.mozilla.org/en-US/kb/web-apps-firefox-windows'
    },
    other: {
      steps: ['Das Browsermenü öffnen und nach „App installieren“ oder „Zum Startbildschirm hinzufügen“ suchen.', 'Falls vorhanden, auswählen und die Installation bestätigen.', 'Fehlt diese Funktion, die Seite als Lesezeichen speichern: unter Windows/Linux Strg + D, auf dem Mac ⌘ + D.'],
      location: 'Ob eine eigene App möglich ist und wo ihr Symbol erscheint, bestimmt dein Browser. Als Website bleibt der Rechner nutzbar.',
      shortcut: ['Die Hilfe deines Browsers für „Web-App installieren“ öffnen. Nicht jeder Browser bietet eine App- oder Desktop-Verknüpfung an.'],
      url: 'https://dieisolatorendeluxe.github.io/isolatoren-deluxe/'
    }
  };
  function renderDesktopGuide() {
    const guide = guides[browserChoice.value] || guides.other;
    for (let i = 1; i <= 4; i++) {
      get(`desktopStep${i}`).textContent = guide.steps[i - 1] || '';
      get(`desktopStep${i}`).hidden = !guide.steps[i - 1];
    }
    for (let i = 1; i <= 3; i++) {
      get(`shortcutStep${i}`).textContent = guide.shortcut[i - 1] || '';
      get(`shortcutStep${i}`).hidden = !guide.shortcut[i - 1];
    }
    get('desktopLocation').textContent = guide.location;
    get('browserHelpLink').href = guide.url;
    get('browserHelpLink').hidden = browserChoice.value === 'other';
    get('desktopShortcutHelp').open = false;
  }
  browserChoice.addEventListener('change', renderDesktopGuide);
  renderDesktopGuide();
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
    feedback.textContent = isIOS || isAndroid
      ? 'App installiert. Du findest sie auf deinem Startbildschirm.'
      : 'App installiert. Du findest sie im App-Menü deines Computers. Ein Desktop-Symbol wird je nach Browser separat angelegt.';
  });
  function openHelp() {
    get('installFeedback').textContent = '';
    get('moreInstallHelp').open = false;
    if (typeof help.showModal === 'function') help.showModal();
    else help.setAttribute('open', '');
  }
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
      openHelp();
    } finally { install.disabled = false; }
  });
  get('closeInstallHelp').addEventListener('click', () => {
    if (typeof help.close === 'function') help.close();
    else help.removeAttribute('open');
  });
  get('showQRCode').addEventListener('click', () => {
    const dialog = get('qrHelp');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  });
  get('closeQRCode').addEventListener('click', () => {
    const dialog = get('qrHelp');
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  });
  get('showAllInstructions').addEventListener('click', () => {
    for (const id of ['iosInstructions','androidInstructions','desktopInstructions']) get(id).hidden = false;
    get('showAllInstructions').hidden = true;
  });

  // Share only the public home page, never input values or URL parameters.
  const appUrl = new URL('./', window.location.href).href;
  async function copyLink(target, url = appUrl) {
    try {
      await navigator.clipboard.writeText(url);
      target.textContent = 'Link kopiert – du kannst ihn jetzt in einem anderen Browser öffnen oder teilen.';
    } catch { target.textContent = `Link zum Kopieren: ${url}`; }
  }
  get('copyAppLink').addEventListener('click', () => copyLink(get('installFeedback')));
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
    await copyLink(feedback);
  });

  for (const button of document.querySelectorAll?.('[data-copy-partner-link]') ?? []) {
    const panel = button.closest('details');
    const link = panel.querySelector('[data-partner-link]');
    const status = panel.querySelector('[role="status"]');
    button.hidden = false;
    button.addEventListener('click', () => copyLink(status, link.href));
  }

  for (const link of document.querySelectorAll?.('[data-share-entry]') ?? []) {
    link.addEventListener('click', async event => {
      event.preventDefault();
      const status = link.parentElement;
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({url:link.href});
          return;
        } catch (error) {
          if (error.name === 'AbortError') return;
        }
      }
      let feedback = status.querySelector('[data-share-feedback]');
      if (!feedback) {
        feedback = document.createElement('span');
        feedback.setAttribute('data-share-feedback', '');
        feedback.setAttribute('role', 'status');
        status.append(feedback);
      }
      await copyLink(feedback, link.href);
    });
  }

  function openLinkedPartner() {
    const id = window.location.hash?.slice(1);
    const card = id && document.getElementById(id);
    const details = card?.querySelector('.partner-card-details');
    if (details) {
      details.open = true;
      details.scrollIntoView();
    }
  }
  window.addEventListener('hashchange', openLinkedPartner);
  openLinkedPartner();

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
  } else {
    status.textContent = 'Dieser Browser unterstützt keine Offline-Speicherung. Der Rechner funktioniert als Website mit Internet.';
  }
})();
