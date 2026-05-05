// ── TEA JOURNAL · STORE ───────────────────────────────────────────────────────
// Single source of truth.

const STORE_KEY = 'tea_journal_v3';

const Store = (() => {
  let teas = [];
  let listeners = [];

  /**
   * Initializes the store. 
   * Attempts to load from LocalStorage first; if empty, it returns an empty array.
   */
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      teas = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Failed to parse tea data", e);
      teas = [];
    }
  }

  function save() {
    localStorage.setItem(STORE_KEY, JSON.stringify(teas));
    listeners.forEach(fn => fn(teas));
  }

  function onChange(fn) { listeners.push(fn); }

  function getAll() { return [...teas]; }

  function getById(id) { return teas.find(t => t.id === id) || null; }

  function add(tea) {
    const id = teas.length ? Math.max(...teas.map(t => t.id)) + 1 : 1;
    const full = { 
      brews: [], 
      photo: '', 
      tags: [], 
      url: '', 
      ...tea, 
      id, 
      added: new Date().toISOString().slice(0, 10) 
    };
    teas.unshift(full);
    save();
    return full;
  }

  function update(id, patch) {
    const idx = teas.findIndex(t => t.id === id);
    if (idx < 0) return null;
    teas[idx] = { ...teas[idx], ...patch };
    save();
    return teas[idx];
  }

  function remove(id) {
    teas = teas.filter(t => t.id !== id);
    save();
  }

  function addBrew(teaId, brew) {
    const t = teas.find(x => x.id === teaId);
    if (!t) return;
    if (!t.brews) t.brews = [];
    t.brews.push({ ...brew, id: Date.now() });
    if (t.status === 'inventory' || t.status === 'wishlist') t.status = 'tried';
    save();
  }

  function removeBrew(teaId, brewId) {
    const t = teas.find(x => x.id === teaId);
    if (!t || !t.brews) return;
    t.brews = t.brews.filter(b => b.id !== brewId);
    save();
  }

  /**
   * Merges imported data with current data.
   * Checks for ID collisions to prevent duplicates.
   */
  function importData(arr) {
    if (!Array.isArray(arr)) return false;
    const existingIds = new Set(teas.map(t => t.id));
    arr.forEach(t => { 
      if (!existingIds.has(t.id)) teas.push(t); 
    });
    save();
    return true;
  }

  function stats() {
    const all = teas;
    const tried = all.filter(t => t.status === 'tried');
    const rated = tried.filter(t => t.rating > 0);
    const avg = rated.length ? (rated.reduce((a, t) => a + t.rating, 0) / rated.length).toFixed(1) : null;
    const typeCounts = {};
    all.forEach(t => { typeCounts[t.type] = (typeCounts[t.type] || 0) + 1; });
    const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    return {
      total: all.length,
      tried: tried.length,
      inventory: all.filter(t => t.status === 'inventory').length,
      wishlist: all.filter(t => t.status === 'wishlist').length,
      avg,
      topType,
      totalSpent: all.reduce((s, t) => s + (Number(t.price) || 0), 0),
      totalBrews: all.reduce((s, t) => s + (t.brews?.length || 0), 0),
    };
  }

  // Load immediately on script execution
  load();

  return { getAll, getById, add, update, remove, addBrew, removeBrew, importData, stats, onChange, save, load };
})();

// ── HELPERS ──────────────────────────────────────────────────────────────────
const Utils = {
  esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },
  badgeClass(type) {
    return { Green:'badge-green', Black:'badge-black', White:'badge-white', Oolong:'badge-oolong',
             Herbal:'badge-herbal', 'Pu-erh':'badge-puerh', Yellow:'badge-yellow', Other:'badge-other' }[type] || 'badge-other';
  },
  statusLabel(s) {
    return { tried:'Tried', inventory:'In Inventory', wishlist:'Wishlist' }[s] || s;
  },
  statusClass(s) {
    return { tried:'status-tried', inventory:'status-inventory', wishlist:'status-wishlist' }[s] || '';
  },
  starsHtml(n, cls='star') {
    return Array.from({length:5}, (_,i) => `<span class="${cls} ${i<n?'filled':''}"">★</span>`).join('');
  },
  searchLink(t) {
    return 'https://www.google.com/search?q=' + encodeURIComponent(`${t.name} ${t.where || t.type + ' tea'}`);
  },
  formatDate(d) {
    if (!d) return '';
    try { return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }); }
    catch { return d; }
  },
  debounce(fn, ms=200) {
    let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }
};
