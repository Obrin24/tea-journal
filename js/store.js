// ── TEA JOURNAL · STORE ───────────────────────────────────────────────────────
// Single source of truth. All pages import this.

const STORE_KEY = 'tea_journal_v3';

const Store = (() => {
  let teas = [];
  let listeners = [];

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      teas = raw ? JSON.parse(raw) : _defaults();
    } catch {
      teas = _defaults();
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
    const full = { brews: [], photo: '', tags: [], url: '', ...tea, id, added: new Date().toISOString().slice(0, 10) };
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

  function importData(arr) {
    if (!Array.isArray(arr)) return false;
    const existingIds = new Set(teas.map(t => t.id));
    arr.forEach(t => { if (!existingIds.has(t.id)) teas.push(t); });
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

  function _defaults() {
    return [
      { id:1, name:"Dragon Well (Longjing)", type:"Green",  origin:"Hangzhou, China",    qty:50,  unit:"g",    status:"tried",     rating:5, temp:175, steep:"2 min",  notes:"Toasty, nutty, sweet vegetal finish",   where:"Yunnan Sourcing",      url:"https://yunnansourcing.com", price:12, added:"2026-04-01", photo:"", tags:["morning","favourite"], brews:[{id:1001,date:"2026-04-03",temp:175,steep:"2 min",notes:"Perfect. Clean and nutty.",rating:5}] },
      { id:2, name:"Darjeeling First Flush", type:"Black",  origin:"West Bengal, India", qty:100, unit:"g",    status:"tried",     rating:4, temp:200, steep:"3 min",  notes:"Muscatel grape, floral, light body",    where:"Harney & Sons",        url:"", price:18, added:"2026-03-15", photo:"", tags:["morning"], brews:[{id:1002,date:"2026-03-20",temp:200,steep:"3 min",notes:"Lovely muscatel character.",rating:4}] },
      { id:3, name:"Silver Needle",           type:"White",  origin:"Fujian, China",       qty:30,  unit:"g",    status:"tried",     rating:5, temp:160, steep:"4 min",  notes:"Honeydew, delicate floral sweetness",  where:"Teavivre",             url:"https://teavivre.com", price:22, added:"2026-03-28", photo:"", tags:["afternoon","gift"], brews:[] },
      { id:4, name:"Milk Oolong",             type:"Oolong", origin:"Taiwan",              qty:75,  unit:"g",    status:"tried",     rating:4, temp:185, steep:"3 min",  notes:"Creamy, buttery, light floral",         where:"Tea Forté",            url:"", price:16, added:"2026-02-10", photo:"", tags:["afternoon"], brews:[] },
      { id:5, name:"Chamomile",               type:"Herbal", origin:"Egypt",               qty:40,  unit:"bags", status:"tried",     rating:4, temp:208, steep:"5 min",  notes:"Honey-sweet, calming, apple notes",     where:"Celestial Seasonings", url:"", price:5,  added:"2026-01-20", photo:"", tags:["evening","caffeine-free"], brews:[] },
      { id:6, name:"Sheng Puerh 2018",        type:"Pu-erh", origin:"Yunnan, China",       qty:200, unit:"g",    status:"tried",     rating:3, temp:195, steep:"30 sec", notes:"Earthy, camphor, slightly bitter",      where:"White2Tea",            url:"https://white2tea.com", price:35, added:"2025-12-01", photo:"", tags:[], brews:[] },
      { id:7, name:"Gyokuro",                 type:"Green",  origin:"Uji, Japan",          qty:20,  unit:"g",    status:"inventory", rating:0, temp:155, steep:"2 min",  notes:"",                                      where:"Ippodo Tea",           url:"", price:28, added:"2026-04-20", photo:"", tags:[], brews:[] },
      { id:8, name:"Lapsang Souchong",        type:"Black",  origin:"Wuyi, China",         qty:80,  unit:"g",    status:"inventory", rating:0, temp:205, steep:"4 min",  notes:"",                                      where:"Adagio Teas",          url:"", price:9,  added:"2026-04-18", photo:"", tags:[], brews:[] },
      { id:9, name:"Aged Tieguanyin",         type:"Oolong", origin:"Anxi, China",         qty:0,   unit:"g",    status:"wishlist",  rating:0, temp:0,   steep:"",       notes:"Heard great things about aged versions", where:"",                    url:"", price:0,  added:"2026-04-22", photo:"", tags:["want-to-try"], brews:[] },
      { id:10,name:"Hojicha",                 type:"Green",  origin:"Kyoto, Japan",        qty:0,   unit:"g",    status:"wishlist",  rating:0, temp:0,   steep:"",       notes:"Roasted green tea — low caffeine",      where:"",                    url:"", price:0,  added:"2026-04-25", photo:"", tags:["caffeine-free","want-to-try"], brews:[] },
    ];
  }

  load();
  return { getAll, getById, add, update, remove, addBrew, removeBrew, importData, stats, onChange, save, load };
})();

// Helpers used across pages
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
