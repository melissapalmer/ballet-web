/* The Enchanted World of Oz — site script
   Tab navigation, countdown to the 12:00 show, photo lightbox, footer quote.
   Plain HTML/CSS/JS, no build step, no dependencies. */

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const SHOW_DATETIME = new Date('2026-05-16T12:00:00+02:00');
  const TABS = ['home', 'schedule', 'volunteers', 'orders', 'contact', 'studio', 'gallery'];

  // -------- CSV parser --------
  function parseCSV(text) {
    const rows = [];
    let row = [], field = '', inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
        } else { field += c; }
      } else if (c === '"') { inQuotes = true; }
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); rows.push(row); row = []; field = '';
      } else { field += c; }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }

    const cleaned = rows.filter(r => r.length && r.some(v => v.trim() !== ''));
    if (!cleaned.length) return [];
    const headers = cleaned[0].map(h => h.trim());
    return cleaned.slice(1).map(r => {
      const o = {};
      headers.forEach((h, i) => { o[h] = (r[i] ?? '').trim(); });
      return o;
    });
  }

  async function loadCSV(path) {
    try {
      const res = await fetch(path, { cache: 'no-store' });
      if (!res.ok) throw new Error(`${path} → ${res.status}`);
      return parseCSV(await res.text());
    } catch (e) {
      console.warn('CSV load skipped:', e.message);
      return null;
    }
  }

  // -------- Date helpers --------
  function parsePhotoDate(dateStr) {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y) return null;
    return new Date(y, (m || 1) - 1, d || 1);
  }

  // -------- Countdown --------
  function startCountdown() {
    const value = $('#countdown');
    if (!value) return;
    const tick = () => {
      const now = new Date();
      let diff = SHOW_DATETIME - now;
      if (diff <= 0) {
        value.textContent = 'Curtain up!';
        clearInterval(handle);
        return;
      }
      const d = Math.floor(diff / 86400000); diff -= d * 86400000;
      const h = Math.floor(diff / 3600000);  diff -= h * 3600000;
      const m = Math.floor(diff / 60000);
      const parts = [];
      if (d) parts.push(`${d} day${d === 1 ? '' : 's'}`);
      if (h || d) parts.push(`${h} hr${h === 1 ? '' : 's'}`);
      parts.push(`${m} min`);
      value.textContent = parts.join(', ');
    };
    tick();
    const handle = setInterval(tick, 60_000);
  }

  // -------- Photos & lightbox --------
  let currentPhotos = [];
  let currentIndex = 0;

  async function renderPhotos() {
    const grid = $('#photo-grid');
    const galleryTab = $('.tab-gallery');
    if (!grid || !galleryTab) return;

    const rows = await loadCSV('data/photos.csv');
    // No CSV file or empty list → keep gallery hidden, no error to the user
    if (!rows || !rows.length) {
      galleryTab.hidden = true;
      return;
    }
    galleryTab.hidden = false;

    const photos = rows.map(p => ({
      ...p,
      _dt: parsePhotoDate(p.date) || new Date(0),
      _year: p.date ? p.date.slice(0, 4) : 'Undated',
    })).sort((a, b) => b._dt - a._dt);

    currentPhotos = photos;

    const byYear = new Map();
    photos.forEach((p, i) => {
      if (!byYear.has(p._year)) byYear.set(p._year, new Map());
      const eventKey = p.event && p.event.trim() ? p.event.trim() : 'Other';
      const events = byYear.get(p._year);
      if (!events.has(eventKey)) events.set(eventKey, []);
      events.get(eventKey).push({ ...p, _index: i });
    });

    const renderTile = p => `
      <button type="button" data-index="${p._index}" aria-label="${escapeHtml(p.caption || p.event || p.filename)}">
        <img src="images/photos/${encodeURIComponent(p.filename)}" alt="${escapeHtml(p.caption || p.event || '')}" loading="lazy">
        ${p.caption ? `<span class="caption">${escapeHtml(p.caption)}</span>` : ''}
      </button>
    `;

    const eventDate = items => {
      const d = items[0]._dt;
      if (!d || d.getTime() === 0) return '';
      return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
    };

    grid.innerHTML = [...byYear.entries()].map(([year, events]) => `
      <section class="photo-year">
        <h3 class="photo-year-heading">${escapeHtml(year)}</h3>
        ${[...events.entries()].map(([eventName, items]) => `
          <div class="photo-event">
            <h4 class="photo-event-heading">
              <span class="photo-event-name">${escapeHtml(eventName)}</span>
              ${eventDate(items) ? `<span class="photo-event-date">${escapeHtml(eventDate(items))}</span>` : ''}
            </h4>
            <div class="photo-event-grid">${items.map(renderTile).join('')}</div>
          </div>
        `).join('')}
      </section>
    `).join('');

    $$('#photo-grid button').forEach(btn => {
      btn.addEventListener('click', () => openLightbox(Number(btn.dataset.index)));
    });
  }

  function openLightbox(index) {
    if (!currentPhotos.length) return;
    currentIndex = (index + currentPhotos.length) % currentPhotos.length;
    const p = currentPhotos[currentIndex];
    $('#lightbox-img').src = `images/photos/${encodeURIComponent(p.filename)}`;
    $('#lightbox-img').alt = p.caption || '';
    $('#lightbox-caption').textContent = p.caption || '';
    $('#lightbox').hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    $('#lightbox').hidden = true;
    document.body.style.overflow = '';
  }
  function step(delta) { openLightbox(currentIndex + delta); }

  function wireLightbox() {
    $('#lightbox-close').addEventListener('click', closeLightbox);
    $('#lightbox-prev').addEventListener('click', () => step(-1));
    $('#lightbox-next').addEventListener('click', () => step(1));
    $('#lightbox').addEventListener('click', e => { if (e.target.id === 'lightbox') closeLightbox(); });
    document.addEventListener('keydown', e => {
      if ($('#lightbox').hidden) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
  }

  // -------- Tabs --------
  function switchTab(name) {
    if (!TABS.includes(name)) name = 'home';
    if (name === 'gallery' && $('.tab-gallery')?.hidden) name = 'home';
    $$('.tab-btn').forEach(b => {
      const on = b.dataset.tab === name;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $$('.tab-content').forEach(p => p.classList.toggle('active', p.id === name));
    $('#nav-toggle').checked = false;
    if (location.hash.slice(1) !== name) history.replaceState(null, '', '#' + name);
    window.scrollTo({ top: 0 });
  }

  function wireNav() {
    $$('.tab-btn').forEach(b => {
      b.addEventListener('click', () => switchTab(b.dataset.tab));
    });
    $$('.home-tile').forEach(t => {
      t.addEventListener('click', () => switchTab(t.dataset.go));
    });
    $('.logo')?.addEventListener('click', e => { e.preventDefault(); switchTab('home'); });
    window.addEventListener('hashchange', () => switchTab(location.hash.slice(1)));
    const initial = location.hash.slice(1);
    if (TABS.includes(initial)) switchTab(initial);
  }

  // -------- Util --------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // -------- Footer quote --------
  const QUOTES = [
    { text: "There's no place like home.", who: "Dorothy" },
    { text: "Follow the Yellow Brick Road.", who: "The Munchkins" },
    { text: "Hearts will never be practical until they can be made unbreakable.", who: "The Wizard of Oz" },
    { text: "A heart is not judged by how much you love, but by how much you are loved by others.", who: "The Wizard of Oz" },
    { text: "Toto, I've a feeling we're not in Kansas anymore.", who: "Dorothy" },
    { text: "I'd turn back if I were you.", who: "The Wicked Witch's Sign" },
    { text: "If I only had a brain.", who: "The Scarecrow" },
    { text: "Courage! What makes a king out of a slave? Courage!", who: "The Cowardly Lion" },
    { text: "Some people without brains do an awful lot of talking.", who: "The Scarecrow" },
    { text: "Now I know I've got a heart, because it's breaking.", who: "The Tin Man" },
    { text: "You had the power all along, my dear.", who: "Glinda the Good Witch" },
    { text: "I'm melting! Melting!", who: "The Wicked Witch of the West" },
    { text: "Pay no attention to that man behind the curtain.", who: "The Wizard of Oz" },
    { text: "Click your heels three times and say, 'There's no place like home.'", who: "Glinda the Good Witch" },
  ];
  function showRandomQuote() {
    const el = $('#footer-quote');
    if (!el) return;
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    el.innerHTML = `<span class="quote-text">${escapeHtml(q.text)}</span>${q.who ? `<span class="attr">${escapeHtml(q.who)}</span>` : ''}`;
  }

  // -------- Boot --------
  document.addEventListener('DOMContentLoaded', () => {
    wireLightbox();
    wireNav();
    showRandomQuote();
    startCountdown();
    renderPhotos();
  });
})();
