# 🍵 Tea Journal

A beautiful, fully client-side tea collection tracker. No backend, no database, no accounts — everything lives in your browser's localStorage and works offline.

## Features

- **Collection page** — Card and table views, filter by type/status, sort, search
- **Brew Log** — Log multiple sessions per tea with temp, steep time, notes, and ratings
- **Stats** — Visual breakdown of your collection by type, rating distribution, top teas, tag cloud, reorder alerts
- **Share page** — Customisable read-only view, print to PDF, export CSV/JSON, copy as text
- **AI suggestions** — Auto-fill brew temp, steep time, tasting notes, and tags using Claude AI
- **Photos** — Add photos of your tins/packaging
- **Tags** — Freeform labels (morning, caffeine-free, gift, etc.)
- **Wishlist** — Track teas you want to try before you own them
- **Auto search links** — If no URL, generates a Google search link for the store

## File Structure

```
tea-journal/
├── index.html        ← Main collection page
├── brew-log.html     ← Brew session log
├── stats.html        ← Stats & insights
├── share.html        ← Shareable / printable view
├── css/
│   └── styles.css    ← Design system (all shared styles)
└── js/
    ├── store.js      ← Data layer (localStorage)
    ├── ui.js         ← Shared UI components
    └── layout.js     ← Nav + shell injection
```

## Deploy to GitHub Pages

1. Create a new GitHub repository (e.g. `tea-journal`)
2. Upload all files maintaining the folder structure above
3. Go to **Settings → Pages**
4. Under **Source**, select `Deploy from a branch`
5. Choose `main` branch, `/ (root)` folder
6. Click **Save**

Your journal will be live at:
`https://YOUR-USERNAME.github.io/tea-journal/`

That URL is shareable — anyone with it can view your collection (read-only from their perspective, since localStorage is per-browser).

> **Tip:** To let others see your *current* data, use the Share page to export a PDF, or copy as text.

## Keeping Data Safe

- Data lives in **localStorage** in your browser — it won't sync across devices automatically
- Use **Export → JSON** regularly as a backup
- Use **Import** to restore from a backup or move to a new browser/device

## AI Suggestions

The ✦ AI Suggest button uses the Anthropic Claude API (claude-sonnet) to fill in brew temperature, steep time, tasting notes, and tags based on the tea's name and type. This requires an internet connection and uses the Anthropic API key baked into the Claude.ai environment.

If you're hosting this yourself outside of Claude.ai, you'll need to add your own API key to the fetch call in `js/ui.js`.

## Customisation Tips

- **Change the colour palette** — edit CSS variables in `css/styles.css` under `:root`
- **Add a new tea type** — add `<option>` to the type `<select>` in `index.html` and a matching `.badge-*` class in `css/styles.css`
- **Change reorder threshold** — search for `< 30` in `index.html` and `stats.html`
