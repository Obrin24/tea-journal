// ── TEA JOURNAL · LAYOUT SHELL ────────────────────────────────────────────────
// Call Layout.init() at the top of each page's script.

const Layout = (() => {

  const NAV_HTML = `
    <nav class="nav">
      <a class="nav-brand" href="index.html">🍵 <em>Tea</em> Journal</a>
      <div class="nav-links">
        <a class="nav-link" href="index.html">Collection</a>
        <a class="nav-link" href="brew-log.html">Brew Log</a>
        <a class="nav-link" href="stats.html">Stats</a>
        <a class="nav-link" href="share.html">Share</a>
      </div>
      <div class="nav-stats">
        <div class="nav-stat">
          <span class="nav-stat-n" id="nav-total">—</span>
          <span class="nav-stat-l">Teas</span>
        </div>
        <div class="nav-stat">
          <span class="nav-stat-n" id="nav-wish">—</span>
          <span class="nav-stat-l">Wishlist</span>
        </div>
        <div class="nav-stat">
          <span class="nav-stat-n" id="nav-avg">—</span>
          <span class="nav-stat-l">Avg Rating</span>
        </div>
      </div>
    </nav>
  `;

  function init() {
    // Inject nav before body content
    const navEl = document.createElement('div');
    navEl.innerHTML = NAV_HTML;
    document.body.insertBefore(navEl.firstElementChild, document.body.firstChild);

    // Inject toast container
    const toastEl = document.createElement('div');
    toastEl.id = 'toast-container';
    toastEl.className = 'toast-container';
    document.body.appendChild(toastEl);

    UI.setActiveNav();
    UI.updateNavStats();

    // Keep nav stats live
    Store.onChange(() => UI.updateNavStats());
  }

  return { init };
})();
