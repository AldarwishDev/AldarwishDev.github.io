(() => {
  'use strict';
  const data = JSON.parse(document.getElementById('page-data').textContent);
  const root = document.documentElement;
  const get = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Preferences remain usable for this visit. */ } };
  const themeButton = document.getElementById('theme-toggle');
  function setTheme(theme) {
    root.dataset.theme = theme;
    themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#141820' : '#f3efe4';
  }
  const savedTheme = get('preferredTheme');
  setTheme(['light', 'dark'].includes(savedTheme) ? savedTheme : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  themeButton.addEventListener('click', () => {
    setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    save('preferredTheme', root.dataset.theme);
  });
  let observer;
  function watchSections() {
    observer?.disconnect();
    if (!('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      const active = entries.find(entry => entry.isIntersecting);
      if (!active) return;
      document.querySelectorAll('#toc a').forEach(link => {
        if (link.hash === '#' + active.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('.legal-section').forEach(section => observer.observe(section));
  }
  function setLanguage(language) {
    const lang = Object.hasOwn(data.labels, language) ? language : 'en';
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('language').value = lang;
    const labels = data.labels[lang];
    document.querySelector('.brand').setAttribute('aria-label', labels.brand);
    document.querySelector('.primary-nav').setAttribute('aria-label', labels.brand);
    if (data.documents) {
      const doc = data.documents[lang];
      document.title = `${doc.title} | ${labels.brand}`;
      document.getElementById('document-title').textContent = doc.title;
      document.getElementById('updated').textContent = doc.updated;
      document.getElementById('document-body').innerHTML = doc.body + `<a class="top-link" href="#top">${labels.top} ↑</a>`;
      document.getElementById('toc').innerHTML = doc.toc;
      document.getElementById('contents-nav').setAttribute('aria-label', labels.contents);
      watchSections();
    } else {
      document.getElementById('main').innerHTML = data.home[lang];
      document.title = `${labels.overview} | ${labels.brand}`;
    }
    document.querySelectorAll('[data-label]').forEach(el => { el.textContent = labels[el.dataset.label]; });
    themeButton.setAttribute('aria-label', labels.theme);
  }
  setLanguage(get('preferredLang'));
  const language = document.getElementById('language');
  language.disabled = false;
  language.addEventListener('change', () => { setLanguage(language.value); save('preferredLang', language.value); });
  document.getElementById('print')?.addEventListener('click', () => window.print());
  const details = document.getElementById('toc-details');
  if (details) {
    const mobile = matchMedia('(max-width: 800px)');
    const resize = () => { details.open = !mobile.matches; };
    resize();
    mobile.addEventListener('change', resize);
    document.getElementById('toc').addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link) return;
      // Close first so the browser resolves the anchor after layout settles.
      if (mobile.matches) details.open = false;
      document.querySelector(link.hash)?.focus({ preventScroll: true });
    });
  }
  root.classList.add('js');
})();
