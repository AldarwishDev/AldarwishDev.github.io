import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const write = (path, text) => writeFileSync(resolve(root, path), text + '\n');
const esc = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const inline = text => esc(text).replace(/contact@ahmadaldarwish\.com/g, '<a href="mailto:contact@ahmadaldarwish.com" dir="ltr">contact@ahmadaldarwish.com</a>');
const labels = {
  en: { brand: 'Wasl', features: 'Features', download: 'Download', overview: 'Overview', privacy: 'Privacy Policy', terms: 'Terms of Use', language: 'Language', theme: 'Toggle dark mode', skip: 'Skip to content', legal: 'WASL / LEGAL', contents: 'On this page', print: 'Print document', back: 'Back to Wasl', contact: 'Get in touch', top: 'Back to top', by: 'Made by Ahmad Aldarwish', home: 'Ahmad Aldarwish', updated: 'Last Updated: September 2026' },
  de: { brand: 'Wasl', features: 'Funktionen', download: 'Download', overview: 'Übersicht', privacy: 'Datenschutzerklärung', terms: 'Nutzungsbedingungen', language: 'Sprache', theme: 'Dunkelmodus umschalten', skip: 'Zum Inhalt springen', legal: 'WASL / RECHTLICHES', contents: 'Auf dieser Seite', print: 'Dokument drucken', back: 'Zurück zu Wasl', contact: 'Kontakt aufnehmen', top: 'Nach oben', by: 'Entwickelt von Ahmad Aldarwish', home: 'Ahmad Aldarwish', updated: 'Zuletzt aktualisiert: September 2026' },
  ar: { brand: 'وَصْل', features: 'الميزات', download: 'تحميل', overview: 'نظرة عامة', privacy: 'سياسة الخصوصية', terms: 'شروط الاستخدام', language: 'اللغة', theme: 'تبديل الوضع الداكن', skip: 'انتقل إلى المحتوى', legal: 'وَصْل / المعلومات القانونية', contents: 'في هذه الصفحة', print: 'طباعة المستند', back: 'العودة إلى وَصْل', contact: 'تواصل معنا', top: 'العودة إلى الأعلى', by: 'من تطوير أحمد الدرويش', home: 'أحمد الدرويش', updated: 'آخر تحديث: سبتمبر 2026' }
};

function parse(text, lang) {
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const boundary = lines.indexOf(labels[lang].terms);
  if (boundary < 0) throw new Error(`Missing terms heading for ${lang}`);
  return [lines.slice(0, boundary), lines.slice(boundary)].map(lines => {
    const [title, updated, intro, ...body] = lines;
    const sections = [];
    let bullet = false;
    for (const line of body) {
      if (/^\d+\. /.test(line)) {
        sections.push({ title: line, blocks: [] });
      } else if (line === '•') {
        bullet = true;
      } else {
        const blocks = sections.at(-1).blocks;
        if (bullet) {
          if (!blocks.at(-1)?.items) blocks.push({ items: [] });
          blocks.at(-1).items.push(line);
        } else blocks.push({ text: line });
        bullet = false;
      }
    }
    return { title, updated, intro, sections };
  });
}

function bodyHtml(doc) {
  return `<p class="intro">${inline(doc.intro)}</p>` + doc.sections.map((s, i) => `<section class="legal-section" id="section-${i + 1}" tabindex="-1"><h2>${esc(s.title)}</h2>${s.blocks.map(b => b.items ? `<ul>${b.items.map(t => `<li>${inline(t)}</li>`).join('')}</ul>` : `<p>${inline(b.text)}</p>`).join('')}</section>`).join('\n');
}
function tocHtml(doc) {
  return doc.sections.map((s, i) => `<li><a href="#section-${i + 1}"><span class="toc-number" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span>${esc(s.title.replace(/^\d+\. /, ''))}</span></a></li>`).join('');
}
const l = (key, cls = '') => `<span${cls ? ` class="${cls}"` : ''} data-label="${key}">${labels.en[key]}</span>`;
function header(page) {
  return `<a class="skip-link" href="#main">${l('skip')}</a><header class="site-header"><div class="nav-wrap"><a class="brand" href="/wasl/" aria-label="Wasl"><img src="/logo.png" width="38" height="38" alt="">${l('brand')}</a><div class="controls"><label class="sr-only" for="language">${l('language')}</label><div class="language-control"><select id="language" disabled><option value="en" lang="en">English</option><option value="ar" lang="ar">العربية</option><option value="de" lang="de">Deutsch</option></select><svg class="language-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg></div><button id="theme-toggle" class="icon-button js-only" aria-label="Toggle dark mode" aria-pressed="false"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.3 15.6A8.5 8.5 0 0 1 8.4 3.7a8.5 8.5 0 1 0 11.9 11.9Z"/></svg></button></div></div></header>`;
}
function footer() {
  return `<footer class="site-footer"><div><a href="/" class="footer-name">${l('home')}</a><p>© 2026</p></div><nav aria-label="Footer"><a href="/wasl/privacy/">${l('privacy')}</a><a href="/wasl/terms/">${l('terms')}</a><a href="mailto:contact@ahmadaldarwish.com">${l('contact')} <span aria-hidden="true">↗</span></a></nav></footer>`;
}
function shell(page, title, description, content, data) {
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="#f3efe4">
  <title>${esc(title)} | Wasl</title>
  <link rel="icon" href="/logo.png">
  <link rel="canonical" href="https://ahmadaldarwish.com/wasl/${page === 'overview' ? '' : page + '/'}">
  <link rel="preload" href="/wasl/assets/fonts/Almarai-Regular.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="stylesheet" href="/wasl/assets/wasl.css">
  <script src="/wasl/assets/wasl.js" defer></script>
</head>
<body id="top" data-page="${page}">
${header(page)}
${content}
${footer()}
<script type="application/json" id="page-data">${JSON.stringify({ labels, ...data }).replaceAll('<', '\\u003c')}</script>
</body>
</html>`;
}
const documents = Object.fromEntries(Object.keys(labels).map(lang => [lang, parse(read(`wasl/content/${lang}.txt`), lang)]));
for (const [idx, page] of ['privacy', 'terms'].entries()) {
  const doc = documents.en[idx];
  const data = Object.fromEntries(Object.keys(labels).map(lang => [lang, { title: documents[lang][idx].title, updated: documents[lang][idx].updated, body: bodyHtml(documents[lang][idx]), toc: tocHtml(documents[lang][idx]) }]));
  write(`wasl/${page}/index.html`, shell(page, doc.title, doc.intro, `<main id="main" class="legal-main"><div class="document-heading"><p class="eyebrow">${l('legal')}</p><h1 id="document-title">${doc.title}</h1><div class="document-meta"><p id="updated">${doc.updated}</p><button id="print" class="text-button js-only">${l('print')} <span aria-hidden="true">↗</span></button></div></div><div class="document-grid"><aside class="document-sidebar"><details open id="toc-details"><summary>${l('contents')}<span aria-hidden="true">⌄</span></summary><nav aria-label="On this page" id="contents-nav"><ol id="toc">${tocHtml(doc)}</ol></nav></details><a class="back-link" href="/wasl/">${l('back')} <span aria-hidden="true">↗</span></a></aside><article id="document-body" class="document-body">${bodyHtml(doc)}<a class="top-link" href="#top">${l('top')} ↑</a></article></div></main>`, { documents: data }));
}

const home = {
  en: { eyebrow: 'YOUR DAILY ISLAMIC COMPANION', title: 'A little closer.<br><em>Every day.</em>', intro: 'Make space for what matters. Prayer times, Quran, adhkar, and thoughtful reminders — together in Wasl.', download: 'Get it on Google Play', explore: 'Explore the features', platform: 'Android · Wear OS', art: 'A moment to reconnect.', featuresLabel: 'THOUGHTFULLY CONNECTED', featuresTitle: 'Faith, woven into your day.', featuresIntro: 'From the first Adhan to a quiet moment of reflection.', features: [['Smart Cast', 'Bring the Adhan into your home. Stream audio and video to compatible smart TVs and speakers.'], ['Prayer times & Qibla', 'Find prayer times for your location, choose a calculation method, and find your Qibla direction.'], ['Quran & adhkar', 'Keep your reading and daily remembrance close, with progress tracking and custom adhkar.'], ['A little more focus', 'Choose to pause distracting apps during prayer times with optional Focus Mode.'], ['Across your devices', 'Stay connected with Wear OS, widgets, and optional cloud backup and realtime sync.'], ['Your everyday tools', 'Find nearby mosques and Islamic places, keep worship logs, and estimate Zakat.']], privacyLabel: 'BUILT AROUND YOUR CHOICES', privacyTitle: 'Your data.<br><em>Your choice.</em>', privacyText: 'Use Wasl without an account, or sign in for optional cloud backup and sync. Manage your permissions and preferences in the app.', privacyLink: 'Read our Privacy Policy', termsLink: 'Terms of Use' },
  de: { eyebrow: 'DEIN TÄGLICHER ISLAMISCHER BEGLEITER', title: 'Ein Stück näher.<br><em>Jeden Tag.</em>', intro: 'Schaffe Raum für das Wesentliche. Gebetszeiten, Koran, Adhkar und hilfreiche Erinnerungen — vereint in Wasl.', download: 'Bei Google Play herunterladen', explore: 'Funktionen entdecken', platform: 'Android · Wear OS', art: 'Ein Moment der Verbundenheit.', featuresLabel: 'BEWUSST VERBUNDEN', featuresTitle: 'Glaube, der deinen Alltag begleitet.', featuresIntro: 'Vom ersten Adhan bis zu einem stillen Moment der Besinnung.', features: [['Smart Cast', 'Bringe den Adhan in dein Zuhause. Streame Audio und Video auf kompatible Smart-TVs und Lautsprecher.'], ['Gebetszeiten & Qibla', 'Finde Gebetszeiten für deinen Standort, wähle eine Berechnungsmethode und bestimme deine Qibla-Richtung.'], ['Koran & Adhkar', 'Begleite deine Lektüre und dein tägliches Gedenken mit Fortschrittsübersicht und eigenen Adhkar.'], ['Mehr Konzentration', 'Pausiere ablenkende Apps während der Gebetszeiten mit dem optionalen Fokusmodus.'], ['Auf deinen Geräten', 'Bleibe verbunden mit Wear OS, Widgets sowie optionaler Cloud-Sicherung und Echtzeit-Synchronisierung.'], ['Helfer für den Alltag', 'Finde Moscheen und islamische Orte in der Nähe, führe Andachtsprotokolle und schätze deine Zakat.']], privacyLabel: 'DEINE ENTSCHEIDUNGEN ZÄHLEN', privacyTitle: 'Deine Daten.<br><em>Deine Wahl.</em>', privacyText: 'Nutze Wasl ohne Konto oder melde dich für optionale Cloud-Sicherung und Synchronisierung an. Verwalte Berechtigungen und Einstellungen in der App.', privacyLink: 'Datenschutzerklärung lesen', termsLink: 'Nutzungsbedingungen' },
  ar: { eyebrow: 'رفيقك في الصلاة والذكر', title: 'صلاتك ووردك،<br><em>معك كل يوم.</em>', intro: 'مواقيت الصلاة، وتلاوة القرآن، والأذكار، وأدوات تعينك على المواظبة على عباداتك؛ كل ذلك في تطبيق وَصْل.', download: 'حمّل التطبيق من Google Play', explore: 'اكتشف الميزات', platform: 'Android · Wear OS', art: 'معك في يومك وعبادتك.', featuresLabel: 'كل ما تحتاجه في مكان واحد', featuresTitle: 'أدوات تعينك على عبادتك.', featuresIntro: 'للصلاة والقرآن والذكر، في البيت وأينما كنت.', features: [['البث الذكي', 'اجعل الأذان حاضراً في منزلك. ابث الصوت والفيديو إلى أجهزة التلفاز الذكية ومكبرات الصوت المتوافقة.'], ['أوقات الصلاة والقبلة', 'اعرف أوقات الصلاة لموقعك، واختر طريقة الحساب، وحدد اتجاه القبلة.'], ['القرآن والأذكار', 'حافظ على وردك وذكرك اليومي مع متابعة التقدم وإضافة أذكارك المخصصة.'], ['مساحة للتركيز', 'اختر إيقاف التطبيقات المشتتة أثناء أوقات الصلاة عبر وضع التركيز الاختياري.'], ['عبر أجهزتك', 'ابقَ متصلاً عبر Wear OS والويدجت والنسخ الاحتياطي السحابي والمزامنة الفورية الاختياريين.'], ['أدوات ليومك', 'اعثر على المساجد والأماكن الإسلامية القريبة، وسجّل عباداتك، وقدّر زكاتك.']], privacyLabel: 'خياراتك أولاً', privacyTitle: 'بياناتك.<br><em>قرارك.</em>', privacyText: 'يمكنك استخدام وَصْل دون إنشاء حساب. وإذا رغبت في حفظ نسخة احتياطية سحابية أو مزامنة بياناتك بين أجهزتك، فسجّل الدخول وفعّل ما تحتاجه من الإعدادات. الأذونات والتفضيلات تحت تحكمك.', privacyLink: 'اقرأ سياسة الخصوصية', termsLink: 'شروط الاستخدام' }
};
const featureSets = {
  "en": [
    [
      "Prayer times & reminders",
      "Prayer times, Adhan playback, pre- and post-prayer reminders, Iqamah alerts, and reminders for your latest prayer."
    ],
    [
      "The Holy Quran",
      "Read with adjustable fonts, listen to reciters or Quran radio, download audio for offline listening, and keep bookmarks and reading goals."
    ],
    [
      "Adhkar & worship",
      "Morning, evening, and daily adhkar, custom dhikr, a tasbeeh counter, and worship progress with streaks and calendar history."
    ],
    [
      "Zakat calculators",
      "Estimate Zakat for cash, savings, crypto, livestock, and agricultural yields, along with Zakat al-Fitr."
    ],
    [
      "Islamic knowledge",
      "Explore Islamic books, an integrated PDF reader, Hadith collections, the Hijri calendar, and Islamic events."
    ],
    [
      "Smart Cast",
      "Cast the Adhan to compatible TVs and speakers, with automatic prayer casting and controls for devices and schedules."
    ],
    [
      "Agenda & focus",
      "Plan daily tasks and events, pause distracting apps, and use optional prayer Focus Mode and automatic Do Not Disturb."
    ],
    [
      "Wear OS companion",
      "A native watch app with phone-watch synchronization, prayer alerts, watch face complications, and interactive tiles."
    ],
    [
      "Home & lock screen widgets",
      "Quick access to prayer times and countdowns, Quran playback and progress, daily Ayahs, worship trackers, and Hijri dates."
    ],
    [
      "Make Wasl your own",
      "Choose themes, app icons, and languages. Use optional cloud backup, notification history, the Qibla compass, and nearby mosque maps."
    ]
  ],
  "de": [
    [
      "Gebetszeiten & Erinnerungen",
      "Gebetszeiten, Adhan-Wiedergabe, Erinnerungen vor und nach dem Gebet, Iqamah-Hinweise und Erinnerungen an das letzte Gebet."
    ],
    [
      "Der Heilige Koran",
      "Lies mit anpassbaren Schriften, höre Rezitatoren oder Koranradio, lade Audio zum Offline-Hören herunter und verwalte Lesezeichen und Leseziele."
    ],
    [
      "Adhkar & Andacht",
      "Morgen-, Abend- und Alltags-Adhkar, eigene Dhikr, ein Tasbeeh-Zähler und Andachtsfortschritte mit Serien und Kalenderverlauf."
    ],
    [
      "Zakat-Rechner",
      "Schätze Zakat für Bargeld, Ersparnisse, Kryptowährungen, Vieh und Ernteerträge sowie Zakat al-Fitr."
    ],
    [
      "Islamisches Wissen",
      "Entdecke islamische Bücher, einen integrierten PDF-Reader, Hadith-Sammlungen, den Hijri-Kalender und islamische Ereignisse."
    ],
    [
      "Smart Cast",
      "Übertrage den Adhan an kompatible Fernseher und Lautsprecher, mit automatischem Gebets-Casting und Einstellungen für Geräte und Zeitpläne."
    ],
    [
      "Agenda & Fokus",
      "Plane tägliche Aufgaben und Termine, pausiere ablenkende Apps und nutze den optionalen Gebets-Fokusmodus und automatische Nicht-stören-Einstellungen."
    ],
    [
      "Wear OS-Begleiter",
      "Eine native Watch-App mit Telefon-Uhr-Synchronisierung, Gebetshinweisen, Zifferblatt-Komplikationen und interaktiven Kacheln."
    ],
    [
      "Start- & Sperrbildschirm-Widgets",
      "Schneller Zugriff auf Gebetszeiten und Countdowns, Koranwiedergabe und Fortschritt, tägliche Ayahs, Andachtstracker und Hijri-Daten."
    ],
    [
      "Wasl nach deinen Wünschen",
      "Wähle Designs, App-Symbole und Sprachen. Nutze optionale Cloud-Sicherung, den Benachrichtigungsverlauf, den Qibla-Kompass und Karten mit Moscheen in der Nähe."
    ]
  ],
  "ar": [
    [
      "أوقات الصلاة والتنبيهات",
      "تابع مواقيت الصلاة، واستمع إلى الأذان، واضبط تذكيرات قبل الصلاة وبعدها وتنبيهات للإقامة وتذكيراً بالصلاة إذا لم تكن قد أدّيتها."
    ],
    [
      "القرآن الكريم",
      "اقرأ القرآن بالخط والحجم المناسبين لك، واستمع إلى التلاوات أو إذاعة القرآن. نزّل التلاوات للاستماع دون إنترنت، واحفظ موضع قراءتك وحدد أهدافاً لوردك."
    ],
    [
      "الأذكار والعبادات",
      "اقرأ أذكار الصباح والمساء وسائر الأذكار اليومية، وأضف أذكارك الخاصة. استخدم عداد التسبيح وسجّل عباداتك لمتابعة مواظبتك عليها يوماً بعد يوم."
    ],
    [
      "حاسبات الزكاة",
      "احسب مقدار الزكاة التقديري للنقود والمدخرات والعملات الرقمية والأنعام والمحاصيل، وتعرّف على مقدار زكاة الفطر."
    ],
    [
      "المعرفة الإسلامية",
      "تصفّح الكتب الإسلامية والأحاديث، واقرأ ملفات PDF داخل التطبيق، وتابع التقويم الهجري والمناسبات الإسلامية."
    ],
    [
      "البث الذكي",
      "شغّل الأذان على أجهزة التلفاز ومكبرات الصوت المتوافقة، واختر أجهزة البث ومواعيده، أو فعّل البث التلقائي عند دخول وقت الصلاة."
    ],
    [
      "تنظيم يومك والتركيز",
      "نظّم مهامك ومواعيدك، واختر حظر التطبيقات المشتتة مؤقتاً أو تفعيل «عدم الإزعاج» تلقائياً أثناء الصلاة."
    ],
    [
      "وَصْل على ساعتك",
      "تابع مواقيت الصلاة وتنبيهاتها من ساعة Wear OS، مع مزامنة الهاتف وإضافات لواجهة الساعة وبطاقات تفاعلية للوصول السريع."
    ],
    [
      "أدوات الشاشة الرئيسية والقفل",
      "اطّلع على موعد الصلاة القادمة والتاريخ الهجري، وتحكّم في التلاوة، وتابع وردك وعباداتك مباشرة من الشاشة الرئيسية أو شاشة القفل."
    ],
    [
      "وَصْل كما تحب",
      "اختر المظهر وأيقونة التطبيق واللغة التي تناسبك. واستفد من النسخ الاحتياطي السحابي الاختياري وسجل الإشعارات وبوصلة القبلة وخريطة المساجد القريبة."
    ]
  ]
};
for (const lang of Object.keys(home)) home[lang].features = featureSets[lang];
const paths = ["M12 8v4l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0","M12 6v15 M12 6C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 2Z","M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z","M5 3h14v18H5z M8 7h8 M8 12h2 M14 12h2 M8 16h2 M14 16h2","M4 5h12v15H4z M8 2h12v15 M7 9h6 M7 13h6","M4 6h16v12H4z M8 21h8 M12 18v3","M4 5h16v16H4z M8 3v4 M16 3v4 M4 10h16 M8 14h3 M8 17h6","M8 2h8l1 5 M8 22h8l1-5 M7 7h10v10H7z M12 9v3l2 1","M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z","M4 6h16 M4 12h16 M4 18h16 M8 4v4 M16 10v4 M10 16v4"];
function homeHtml(t, brand = 'Wasl') {
  return `<section class="hero"><div class="hero-copy"><p class="eyebrow">${t.eyebrow}</p><h1>${t.title}</h1><p class="hero-intro">${t.intro}</p><div class="hero-actions"><a id="download" class="button" href="https://play.google.com/store/apps/details?id=com.ahmadaldarwish.wasl">${t.download} <span aria-hidden="true">↗</span></a><a class="explore-link" href="#features">${t.explore} <span aria-hidden="true">↓</span></a></div><p class="platforms" dir="ltr">${t.platform}</p></div><div class="hero-brand"><img src="/logo.png" width="112" height="112" alt="${brand}" fetchpriority="high"></div></section><section id="features" class="features"><div class="section-heading"><p class="eyebrow">${t.featuresLabel}</p><h2>${t.featuresTitle}</h2><p>${t.featuresIntro}</p></div><div class="features-grid">${t.features.map(([title, text], i) => `<article class="feature"><div class="feature-top"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[i % paths.length]}"/></svg><span aria-hidden="true">${String(i + 1).padStart(2, '0')}</span></div><h3>${title}</h3><p>${text}</p></article>`).join('')}</div></section><section class="privacy-banner"><div><p class="eyebrow">${t.privacyLabel}</p><h2>${t.privacyTitle}</h2></div><div><p>${t.privacyText}</p></div></section>`;
}
write('wasl/index.html', shell('overview', 'Your daily Islamic companion', home.en.intro, `<main id="main" class="home-main">${homeHtml(home.en)}</main>`, { home: Object.fromEntries(Object.entries(home).map(([lang, t]) => [lang, homeHtml(t, labels[lang].brand)])) }));
console.log('Built Wasl overview, privacy and terms in English, Arabic and German.');
