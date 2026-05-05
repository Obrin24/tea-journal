// ── TEA JOURNAL · SHARED UI COMPONENTS ───────────────────────────────────────

const UI = (() => {

  // ── TOAST ──────────────────────────────────────────────────────────────────
  function toast(msg, type = 'default', duration = 2800) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      el.style.transition = 'opacity 0.3s, transform 0.3s';
      setTimeout(() => el.remove(), 350);
    }, duration);
  }

  // ── MODAL ──────────────────────────────────────────────────────────────────
  function openModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
  }
  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
  }
  function closeAllModals() {
    document.querySelectorAll('.overlay.open').forEach(el => {
      el.classList.remove('open');
    });
    document.body.style.overflow = '';
  }

  // Close on overlay click
  document.addEventListener('click', e => {
    if (e.target.classList.contains('overlay')) closeAllModals();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
  });

  // ── CONFIRM ────────────────────────────────────────────────────────────────
  function confirm(msg) {
    return window.confirm(msg);
  }

  // ── STARS INPUT ────────────────────────────────────────────────────────────
  function starsInput(containerId, initialValue = 0, onChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let value = initialValue;

    function render(highlight) {
      container.innerHTML = Array.from({ length: 5 }, (_, i) => `
        <span class="star ${i < highlight ? 'filled' : ''}" data-v="${i + 1}">★</span>
      `).join('');
      container.querySelectorAll('.star').forEach(s => {
        s.addEventListener('mouseenter', () => render(+s.dataset.v));
        s.addEventListener('mouseleave', () => render(value));
        s.addEventListener('click', () => {
          value = +s.dataset.v;
          render(value);
          if (onChange) onChange(value);
        });
      });
    }

    container.classList.add('stars-input');
    render(value);

    return {
      getValue: () => value,
      setValue: (v) => { value = v; render(v); }
    };
  }

  // ── TAG INPUT ──────────────────────────────────────────────────────────────
  function tagInput(containerId, initialTags = []) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let tags = [...initialTags];

    function render() {
      container.innerHTML = tags.map(t => `
        <span class="tag removable" data-tag="${Utils.esc(t)}">${Utils.esc(t)} ×</span>
      `).join('') + `<input class="tag-input" placeholder="Add tag, press Enter" maxlength="24">`;

      container.querySelectorAll('.tag.removable').forEach(el => {
        el.addEventListener('click', () => {
          tags = tags.filter(t => t !== el.dataset.tag);
          render();
        });
      });

      const inp = container.querySelector('.tag-input');
      inp.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ',') && inp.value.trim()) {
          e.preventDefault();
          const val = inp.value.trim().toLowerCase().replace(/,/g, '').replace(/\s+/g, '-');
          if (val && !tags.includes(val) && tags.length < 10) tags.push(val);
          render();
          container.querySelector('.tag-input')?.focus();
        }
        if (e.key === 'Backspace' && !inp.value && tags.length) {
          tags.pop(); render();
        }
      });
    }

    container.classList.add('tag-input-wrap');
    render();

    return {
      getTags: () => [...tags],
      setTags: (t) => { tags = [...t]; render(); }
    };
  }

  // ── PHOTO UPLOAD ───────────────────────────────────────────────────────────
  function photoUpload(containerId, onLoad) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let data = '';

    container.classList.add('photo-upload');
    container.innerHTML = `
      <input type="file" accept="image/*">
      <img alt="Tea photo">
      <p>📷 Click to add photo</p>
    `;

    const input = container.querySelector('input');
    const img = container.querySelector('img');
    const label = container.querySelector('p');

    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        data = e.target.result;
        img.src = data;
        img.classList.add('visible');
        label.style.display = 'none';
        if (onLoad) onLoad(data);
      };
      reader.readAsDataURL(file);
    });

    return {
      getData: () => data,
      setData: (d) => {
        data = d || '';
        if (d) { img.src = d; img.classList.add('visible'); label.style.display = 'none'; }
        else { img.src = ''; img.classList.remove('visible'); label.style.display = ''; }
      }
    };
  }

  // ── NAV ACTIVE STATE ───────────────────────────────────────────────────────
  function setActiveNav() {
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === path || (path === '' && href === 'index.html'));
    });
  }

  // ── UPDATE NAV STATS ───────────────────────────────────────────────────────
  function updateNavStats() {
    const s = Store.stats();
    const el = id => document.getElementById(id);
    if (el('nav-total')) el('nav-total').textContent = s.total;
    if (el('nav-avg'))   el('nav-avg').textContent = s.avg || '—';
    if (el('nav-wish'))  el('nav-wish').textContent = s.wishlist;
  }

  // ── AI SUGGEST ─────────────────────────────────────────────────────────────
  async function aiSuggest({ name, type, onResult, btnId }) {
    if (!name) return;
    const btn = btnId ? document.getElementById(btnId) : null;
    if (btn) { btn.classList.add('loading'); btn.disabled = true; }
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: 'You are a tea sommelier. Respond ONLY with a raw JSON object — no markdown, no explanation, no code fences. Keys: temp_f (integer, brewing temperature), steep_time (string e.g. "3 min"), notes (string, 1 sentence of typical tasting notes for this specific tea), origin (string, typical growing region if not already known), tags (array of 1-3 strings from: morning, afternoon, evening, caffeine-free, high-caffeine, light, strong, floral, earthy, sweet, smoky, gift, seasonal). Return null for unknown fields.',
          messages: [{ role: 'user', content: `Tea: "${name}", Type: ${type}` }]
        })
      });
      const data = await res.json();
      const text = (data.content || []).map(c => c.text || '').join('');
      const json = JSON.parse(text.replace(/```json|```/g, '').trim());
      if (onResult) onResult(json);
      toast('AI suggestions applied ✦', 'success');
    } catch (e) {
      toast('AI suggestion unavailable — fill in manually', 'error');
    } finally {
      if (btn) { btn.classList.remove('loading'); btn.disabled = false; }
    }
  }

  // ── EXPORT ─────────────────────────────────────────────────────────────────
  function exportCSV() {
    const teas = Store.getAll();
    const cols = ['Name','Type','Origin','Status','Qty','Unit','Rating','Temp(F)','Steep','Notes','Tags','WhereBought','URL','Price','DateAdded','BrewSessions'];
    const rows = teas.map(t => [
      t.name, t.type, t.origin, t.status,
      t.qty, t.unit, t.rating || '',
      t.temp, t.steep, t.notes,
      (t.tags || []).join(';'),
      t.where, t.url, t.price, t.added,
      (t.brews || []).length
    ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','));
    download('tea-journal.csv', [cols.join(','), ...rows].join('\n'), 'text/csv');
    toast('CSV downloaded');
  }

  function exportJSON() {
    download('tea-journal.json', JSON.stringify(Store.getAll(), null, 2), 'application/json');
    toast('JSON backup downloaded');
  }

  function download(filename, content, mime) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = filename;
    a.click();
  }

  return { toast, openModal, closeModal, closeAllModals, starsInput, tagInput, photoUpload, setActiveNav, updateNavStats, aiSuggest, exportCSV, exportJSON };
})();
