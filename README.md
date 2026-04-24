# 💸 Expense Splitter

Split costs fairly, no matter how complicated the arrangement.

## Features

- **Add participants** — anyone joining the split
- **Add expenses** — name and dollar amount for each item
- **Assign expenses** — choose exactly which participants share each expense (defaults to all)
- **Results breakdown** — each person's total with a line-by-line explanation
- **Share card** — one-click copy of a formatted text summary to send to your group

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deploying to Vercel

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts. Vercel auto-detects Vite.

### Option B — GitHub + Vercel Dashboard

1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **Add New Project**.
3. Import the repository.
4. Vercel will auto-detect the framework as **Vite**. No configuration needed.
5. Click **Deploy**.

### Build settings (auto-detected, no changes needed)

| Setting | Value |
|---|---|
| Framework | Vite |
| Build command | `vite build` |
| Output directory | `dist` |

## Project Structure

```
expense-splitter/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx        ← All app logic and UI
│   ├── index.css      ← Base styles and form resets
│   └── main.jsx       ← React entry point
├── index.html
├── package.json
└── vite.config.js
```

## Customization

- **Currency**: Change `"USD"` in the `fmt()` function inside `App.jsx` to any ISO 4217 currency code (e.g. `"EUR"`, `"GBP"`, `"JPY"`).
- **Avatar colors**: Edit the `AVATAR_PALETTE` array at the top of `App.jsx`.
- **App title**: Edit the `<title>` tag in `index.html` and the `<h1>` in `App.jsx`.
