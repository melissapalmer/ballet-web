/* The Enchanted World of Oz — site script
   Tab navigation, countdown to the 12:00 show, live shirt orders list,
   footer quote. Plain HTML/CSS/JS, no build step, no dependencies. */

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const SHOW_DATETIME = new Date('2026-05-16T12:00:00+02:00');
  const TABS = ['home', 'schedule', 'volunteers', 'orders', 'contact', 'studio'];
  const SHIRT_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRtuO_Pqn9sGLxePT51BqIr72aWzzTqjFlskuDs62Pjlj4zSDUJtI012A4LuWn3C1UsyD1X6z6vl75e/pub?output=csv';
  // Base URL for the studio's published Backstage Mums sheet. Each shift can
  // add `&gid=…` for its specific tab via a `data-gid` attribute on the
  // `.dynamic-roster` container; missing tabs fall back to "Roster being
  // finalised".
  const VOLUNTEER_CSV_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTsTQ7jHG6shlT7d1Lnka3w2x8BfSde7vAvSM6zkWaSmN3VI11rcGdpwQiFjCyIBeNvkyIG08veZm7E/pub?output=csv';

  // Pick the right emoji from the dance Character column — first regex match
  // wins. Order from most-specific (named WoO characters) to most-general
  // (theme/role keywords). Add new rules here when the studio names new
  // characters in the sheet.
  const CHARACTER_EMOJI_RULES = [
    // Wizard of Oz characters first
    [/\bdorothy\b/i, '👧'],
    [/\bscarecrow\b/i, '🌾'],
    [/\btin.?man\b/i, '🤖'],
    [/\blion\b/i, '🦁'],
    [/\bwizard\b/i, '🧙'],
    [/\bwitch\b/i, '🧙‍♀️'],
    [/\btoto\b/i, '🐶'],
    [/\bmunchkin/i, '🎈'],
    [/\bemerald\b/i, '💚'],
    [/\bcrow/i, '🐦‍⬛'],
    [/\bmonkey/i, '🐒'],
    [/\byellow.?brick/i, '🟡'],
    // Themed dance numbers
    [/butterf/i, '🦋'],
    [/snowflake/i, '❄️'],
    [/popp?ies?/i, '🌹'],
    [/forest/i, '🌳'],
    [/tornado/i, '🌪️'],
    [/(farm.+rainbow|rainbow.+farm)/i, '🌈'],
    [/rainbow/i, '🌈'],
    [/farm/i, '🐮'],
    [/survivor/i, '🏝️'],
    // Dance styles
    [/hip.?hop/i, '🎤'],
    [/jazz/i, '🎷'],
    [/contemp/i, '💃'],
    [/ballet/i, '🩰'],
    // Backstage roles
    [/timing/i, '⏱️'],
    [/runner/i, '🏃'],
  ];

  // Group-name fallback when the Character column has nothing matchable.
  const VOLUNTEER_GROUP_EMOJI = {
    'Pre-Primary + Primary': '🌟',
    'Test 1': '🦋',
    'Grade 1': '❄️',
    'Grade 2': '🤖',
    'Grade 3': '🌷',
    'Grade 4': '🌳',
    'Junior Contemp (Gr 1-2)': '🩰',
    'Contemp Gr 3-4': '💃',
    'Contemp Gr 5-6': '🎶',
    'Special - Toto': '🐶',
    'Special - Crows': '🐦‍⬛',
    'Special - Timing': '⏱️',
  };

  function emojiFor(character, groupName) {
    if (character) {
      for (const [pattern, emoji] of CHARACTER_EMOJI_RULES) {
        if (pattern.test(character)) return emoji;
      }
    }
    return VOLUNTEER_GROUP_EMOJI[groupName] || '🎭';
  }

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

  // -------- Shirt orders (live list from published Google Sheet) --------
  async function renderShirtOrders() {
    const target = $('#shirt-orders-list');
    if (!target) return;

    const rows = await loadCSV(SHIRT_CSV_URL);
    if (!rows) {
      target.innerHTML = `<p class="muted">Couldn't load the order list right now &mdash; try refreshing in a moment.</p>`;
      return;
    }

    const orders = rows.map(r => ({
      name: (r["Child's Name (s)"] || '').trim(),
      size: (r["Shirt Size(s)"] || '').trim(),
      paid: /^y/i.test((r["Paid"] || '').trim()),
    })).filter(o => o.name);

    if (!orders.length) {
      target.innerHTML = `<p class="muted">No orders yet.</p>`;
      return;
    }

    orders.sort((a, b) => a.name.localeCompare(b.name));
    const paidCount = orders.filter(o => o.paid).length;
    const dueCount = orders.length - paidCount;

    target.innerHTML = `
      <p class="orders-summary">
        <strong>${orders.length}</strong> orders &middot;
        <span class="orders-summary-paid"><strong>${paidCount}</strong> paid</span> &middot;
        <span class="orders-summary-due"><strong>${dueCount}</strong> still due</span>
      </p>
      <div class="orders-table-wrap">
        <table class="orders-table">
          <thead>
            <tr><th scope="col">Dancer</th><th scope="col">Size</th><th scope="col">Paid</th></tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr class="${o.paid ? 'is-paid' : 'is-due'}">
                <td>${escapeHtml(o.name)}</td>
                <td>${escapeHtml(o.size)}</td>
                <td aria-label="${o.paid ? 'Paid' : 'Not paid'}">${o.paid ? '&check;' : '&times;'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // -------- Volunteers (live roster from published Google Sheet) --------
  async function renderRosterInto(target, gid) {
    const url = `${VOLUNTEER_CSV_BASE}&gid=${encodeURIComponent(gid)}&single=true`;
    const rows = await loadCSV(url);
    if (!rows) {
      target.innerHTML = `<p class="muted">Couldn&rsquo;t load the roster right now &mdash; try refreshing in a moment.</p>`;
      return;
    }
    if (!rows.length) {
      target.innerHTML = `<p class="muted roster-pending">Roster being finalised &mdash; check back closer to the date.</p>`;
      return;
    }

    // Group rows by Group column, preserving source order. Each row becomes
    // a (mum, daughter) pair so we can render them as paired chips.
    const groups = new Map();
    rows.forEach(r => {
      const groupName = (r['Group'] || '').trim();
      if (!groupName) return;
      if (!groups.has(groupName)) {
        groups.set(groupName, {
          name: groupName,
          character: (r['Character'] || '').trim(),
          pairs: [],
        });
      }
      const mom = (r['Mum'] || '').trim();
      const daughter = (r['Daughter(s)'] || '').trim();
      if (mom) groups.get(groupName).pairs.push({ mom, daughter });
    });

    if (!groups.size) {
      target.innerHTML = `<p class="muted roster-pending">Roster being finalised &mdash; check back closer to the date.</p>`;
      return;
    }

    const classGroups = [];
    const generalGroups = [];
    for (const g of groups.values()) {
      (g.name.startsWith('Special -') ? generalGroups : classGroups).push(g);
    }

    const renderPair = p => `
      <span class="roster-pair">
        <span class="roster-pair-mom">${escapeHtml(p.mom)}</span>
        ${p.daughter ? `<span class="roster-pair-daughter">${escapeHtml(p.daughter)}</span>` : ''}
      </span>
    `;

    const renderRow = g => {
      const emoji = emojiFor(g.character, g.name);
      const cleanName = g.name.replace(/^Special - /, '');
      return `
        <div class="roster-row">
          <dt class="roster-group">
            <span class="roster-group-name"><span class="emoji">${emoji}</span> ${escapeHtml(cleanName)}</span>
            ${g.character ? `<span class="roster-character">${escapeHtml(g.character)}</span>` : ''}
          </dt>
          <dd class="roster-names">${g.pairs.map(renderPair).join('')}</dd>
        </div>
      `;
    };

    target.innerHTML = `
      ${classGroups.length ? `
        <h4 class="roster-heading">Class roster</h4>
        <dl class="roster-list">${classGroups.map(renderRow).join('')}</dl>
      ` : ''}
      ${generalGroups.length ? `
        <h4 class="roster-heading">General</h4>
        <dl class="roster-list">${generalGroups.map(renderRow).join('')}</dl>
      ` : ''}
    `;
  }

  function renderVolunteers() {
    $$('.dynamic-roster').forEach(target => {
      const gid = target.dataset.gid;
      if (!gid) return;
      renderRosterInto(target, gid);
    });
  }

  // -------- Tabs --------
  function switchTab(name) {
    if (!TABS.includes(name)) name = 'home';
    $$('.tab-btn').forEach(b => {
      const on = b.dataset.tab === name;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $$('.tab-content').forEach(p => p.classList.toggle('active', p.id === name));
    $('#nav-toggle').checked = false;
    if (location.hash.slice(1) !== name) history.replaceState(null, '', '#' + name);
    window.scrollTo({ top: 0 });
    showRandomQuote();
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

  function wireSubTabs() {
    $$('.subtabs').forEach(group => {
      const panel = group.closest('.tab-content') || document;
      $$('.subtab-btn', group).forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.subtabTarget;
          $$('.subtab-btn', group).forEach(b => {
            const on = b === btn;
            b.classList.toggle('active', on);
            b.setAttribute('aria-selected', on ? 'true' : 'false');
          });
          $$('.subtab-content', panel).forEach(c => {
            c.classList.toggle('active', c.dataset.subtab === target);
          });
        });
      });
    });
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
    wireNav();
    wireSubTabs();
    showRandomQuote();
    startCountdown();
    renderShirtOrders();
    renderVolunteers();
  });
})();
