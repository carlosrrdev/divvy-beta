// ── ID generator ─────────────────────────────────────────────
let _seq = 0;
export const uid = () => `id${++_seq}`;

// ── Formatters ────────────────────────────────────────────────
export const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export const initials = (name) =>
  name.trim().split(/\s+/).map((w) => w[0] || '').join('').toUpperCase().slice(0, 2) || '?';

export const today = () =>
  new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// ── Avatar palettes (per theme) ────────────────────────────────
const PALETTES = {
  dark: [
    { bg: 'rgba(129,140,248,0.15)', text: '#a5b4fc', border: 'rgba(129,140,248,0.28)' },
    { bg: 'rgba(52,211,153,0.12)',  text: '#34d399', border: 'rgba(52,211,153,0.28)'  },
    { bg: 'rgba(251,146,60,0.13)',  text: '#fb923c', border: 'rgba(251,146,60,0.28)'  },
    { bg: 'rgba(192,132,252,0.13)', text: '#c084fc', border: 'rgba(192,132,252,0.28)' },
    { bg: 'rgba(96,165,250,0.13)',  text: '#60a5fa', border: 'rgba(96,165,250,0.28)'  },
    { bg: 'rgba(251,191,36,0.12)',  text: '#fbbf24', border: 'rgba(251,191,36,0.28)'  },
    { bg: 'rgba(251,113,133,0.13)', text: '#fb7185', border: 'rgba(251,113,133,0.28)' },
    { bg: 'rgba(74,222,128,0.12)',  text: '#4ade80', border: 'rgba(74,222,128,0.28)'  },
  ],
  light: [
    { bg: '#ede9fe', text: '#7c3aed', border: '#c4b5fd' },
    { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
    { bg: '#ffedd5', text: '#c2410c', border: '#fdba74' },
    { bg: '#f3e8ff', text: '#7e22ce', border: '#d8b4fe' },
    { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
    { bg: '#fef9c3', text: '#a16207', border: '#fde047' },
    { bg: '#ffe4e6', text: '#be123c', border: '#fca5a5' },
    { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  ],
};

/** Returns avatar bg/text/border for a given palette index and theme. */
export const avatarColors = (index, theme) => {
  const palette = PALETTES[theme] ?? PALETTES.dark;
  return palette[index % palette.length];
};

// ── Results calculator ────────────────────────────────────────
export function calcResults(participants, expenses, assignments) {
  const totals = {};
  const lineItems = {};
  participants.forEach((p) => { totals[p.id] = 0; lineItems[p.id] = []; });
  expenses.forEach((exp) => {
    const pids = (assignments[exp.id] ?? []).filter((pid) =>
      participants.some((p) => p.id === pid)
    );
    if (!pids.length) return;
    const share = exp.amount / pids.length;
    pids.forEach((pid) => {
      totals[pid] = (totals[pid] ?? 0) + share;
      lineItems[pid].push({ expName: exp.name, expTotal: exp.amount, share, splitAmong: pids.length });
    });
  });
  return { totals, lineItems };
}

// ── Share-text builder ────────────────────────────────────────
export function buildShareText(participants, expenses, assignments) {
  const { totals, lineItems } = calcResults(participants, expenses, assignments);
  const totalBill = expenses.reduce((s, e) => s + e.amount, 0);
  const sep = '─'.repeat(38);
  const lines = [
    `💸 EXPENSE SPLIT  ·  ${today()}`,
    sep,
    `Total: ${fmt(totalBill)}  ·  ${participants.length} people  ·  ${expenses.length} expenses`,
    sep,
  ];
  [...participants]
    .sort((a, b) => (totals[b.id] ?? 0) - (totals[a.id] ?? 0))
    .forEach((p) => {
      lines.push(`\n${p.name}  →  ${fmt(totals[p.id] ?? 0)}`);
      (lineItems[p.id] ?? []).forEach(({ expName, expTotal, share, splitAmong }) => {
        const div = splitAmong > 1 ? ` ÷ ${splitAmong}` : '';
        lines.push(`   • ${expName}: ${fmt(expTotal)}${div} = ${fmt(share)}`);
      });
    });
  lines.push(`\n${sep}`);
  return lines.join('\n');
}