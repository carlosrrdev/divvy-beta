import { useState, useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";

// ─── Avatar palettes ──────────────────────────────────────────────────────────
const AVATARS_DARK = [
  { bg: "rgba(129,140,248,0.15)", text: "#a5b4fc", border: "rgba(129,140,248,0.28)" },
  { bg: "rgba(52,211,153,0.12)",  text: "#34d399", border: "rgba(52,211,153,0.28)" },
  { bg: "rgba(251,146,60,0.13)",  text: "#fb923c", border: "rgba(251,146,60,0.28)" },
  { bg: "rgba(192,132,252,0.13)", text: "#c084fc", border: "rgba(192,132,252,0.28)" },
  { bg: "rgba(96,165,250,0.13)",  text: "#60a5fa", border: "rgba(96,165,250,0.28)" },
  { bg: "rgba(251,191,36,0.12)",  text: "#fbbf24", border: "rgba(251,191,36,0.28)" },
  { bg: "rgba(251,113,133,0.13)", text: "#fb7185", border: "rgba(251,113,133,0.28)" },
  { bg: "rgba(74,222,128,0.12)",  text: "#4ade80", border: "rgba(74,222,128,0.28)" },
];
const AVATARS_LIGHT = [
  { bg: "#ede9fe", text: "#7c3aed", border: "#c4b5fd" },
  { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  { bg: "#ffedd5", text: "#c2410c", border: "#fdba74" },
  { bg: "#f3e8ff", text: "#7e22ce", border: "#d8b4fe" },
  { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
  { bg: "#fef9c3", text: "#a16207", border: "#fde047" },
  { bg: "#ffe4e6", text: "#be123c", border: "#fca5a5" },
  { bg: "#dcfce7", text: "#166534", border: "#86efac" },
];

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    // backgrounds
    pageBg:         "#0c0e17",
    // frosted glass card
    cardBg:         "rgba(255,255,255,0.04)",
    cardBorder:     "rgba(255,255,255,0.09)",
    cardBlur:       "blur(18px)",
    cardShadow:     "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)",
    // accent — mint green
    accent:         "#00e0a0",
    accentDim:      "rgba(0,224,160,0.10)",
    accentBorder:   "rgba(0,224,160,0.25)",
    accentText:     "#00e0a0",
    // text
    text:           "#dde4f2",
    textSub:        "#7a8ba8",
    textMuted:      "#3f4e66",
    // misc
    inputBg:        "rgba(255,255,255,0.05)",
    inputBorder:    "rgba(255,255,255,0.10)",
    inputFocusBorder: "rgba(0,224,160,0.5)",
    inputFocusShadow: "0 0 0 3px rgba(0,224,160,0.09)",
    inputColor:     "#dde4f2",
    inputPlaceholder: "#2e3e56",
    btnBg:          "rgba(255,255,255,0.07)",
    btnBorder:      "rgba(255,255,255,0.12)",
    btnText:        "#b0bfd8",
    btnHoverBg:     "rgba(255,255,255,0.12)",
    btnHoverBorder: "rgba(255,255,255,0.2)",
    stepDone:       "rgba(0,224,160,0.3)",
    stepInactive:   "rgba(255,255,255,0.09)",
    red:            "#ff5c7a",
    yellow:         "#f59e0b",
    yellowDim:      "rgba(245,158,11,0.10)",
    yellowBorder:   "rgba(245,158,11,0.22)",
    totalCardBg:    "rgba(0,224,160,0.09)",
    totalCardBorder:"rgba(0,224,160,0.22)",
    metricHighBg:   "rgba(0,224,160,0.09)",
    metricHighBorder:"rgba(0,224,160,0.22)",
    metricHighLabel: "#00e0a0",
    preCodeBg:      "rgba(0,0,0,0.35)",
    toggleBg:       "rgba(255,255,255,0.07)",
    toggleBorder:   "rgba(255,255,255,0.12)",
    toggleIcon:     "☀️",
    toggleLabel:    "Light mode",
    footerBorder:   "rgba(255,255,255,0.07)",
    footerText:     "#3f4e66",
    logoBoxBg:      "rgba(0,224,160,0.10)",
    logoBoxBorder:  "rgba(0,224,160,0.22)",
    avatars: AVATARS_DARK,
  },
  light: {
    pageBg:         "#f5f5f8",
    cardBg:         "#ffffff",
    cardBorder:     "rgba(0,0,0,0.07)",
    cardBlur:       "none",
    cardShadow:     "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(109,90,248,0.06)",
    accent:         "#6d5af8",
    accentDim:      "rgba(109,90,248,0.08)",
    accentBorder:   "rgba(109,90,248,0.22)",
    accentText:     "#6d5af8",
    text:           "#111827",
    textSub:        "#6b7280",
    textMuted:      "#9ca3af",
    inputBg:        "#f9fafb",
    inputBorder:    "#e5e7eb",
    inputFocusBorder: "rgba(109,90,248,0.5)",
    inputFocusShadow: "0 0 0 3px rgba(109,90,248,0.10)",
    inputColor:     "#111827",
    inputPlaceholder: "#c4c9d4",
    btnBg:          "#ffffff",
    btnBorder:      "#e0e3eb",
    btnText:        "#4b5563",
    btnHoverBg:     "#f9fafb",
    btnHoverBorder: "#c8cfe0",
    stepDone:       "rgba(109,90,248,0.28)",
    stepInactive:   "#e5e7eb",
    red:            "#ef4444",
    yellow:         "#d97706",
    yellowDim:      "rgba(217,119,6,0.07)",
    yellowBorder:   "rgba(217,119,6,0.2)",
    totalCardBg:    "rgba(109,90,248,0.07)",
    totalCardBorder:"rgba(109,90,248,0.18)",
    metricHighBg:   "rgba(109,90,248,0.07)",
    metricHighBorder:"rgba(109,90,248,0.18)",
    metricHighLabel: "#6d5af8",
    preCodeBg:      "#f3f4f8",
    toggleBg:       "#f0f1f5",
    toggleBorder:   "#e0e3eb",
    toggleIcon:     "🌙",
    toggleLabel:    "Dark mode",
    footerBorder:   "#e5e7eb",
    footerText:     "#c0c6d4",
    logoBoxBg:      "rgba(109,90,248,0.08)",
    logoBoxBorder:  "rgba(109,90,248,0.2)",
    avatars: AVATARS_LIGHT,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
let _seq = 0;
const uid = () => `id${++_seq}`;
const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const initials = (name) =>
  name.trim().split(/\s+/).map((w) => w[0] || "").join("").toUpperCase().slice(0, 2) || "?";
const today = () =>
  new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

// ─── Bounce-in animation wrapper ──────────────────────────────────────────────
function BounceIn({ children }) {
  const spring = useSpring({
    from: { opacity: 0, transform: "scale(0.88) translateY(10px)" },
    to:   { opacity: 1, transform: "scale(1) translateY(0px)" },
    config: { tension: 330, friction: 22 },
  });
  return <animated.div style={spring}>{children}</animated.div>;
}

// ─── Theme toggle button ──────────────────────────────────────────────────────
function ThemeToggle({ theme, T, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={T.toggleLabel}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "0 12px", height: 34, borderRadius: 20,
        background: T.toggleBg, border: `1px solid ${T.toggleBorder}`,
        color: T.textSub, fontSize: 12.5, fontWeight: 600,
        cursor: "pointer", letterSpacing: "0.01em",
        transition: "all 0.2s ease",
      }}
    >
      <span style={{ fontSize: 14 }}>{T.toggleIcon}</span>
      <span>{T.toggleLabel}</span>
    </button>
  );
}

const STEPS = ["Participants", "Expenses", "Assign", "Results"];

export default function App() {
  // ── Theme ─────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("expSplitterTheme") || "dark"; }
    catch { return "dark"; }
  });
  const T = THEMES[theme];
  const avatarPalette = T.avatars;

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem("expSplitterTheme", next); } catch {}
  }

  // Update body background when theme changes
  useEffect(() => {
    document.body.style.background = T.pageBg;
  }, [theme, T.pageBg]);

  // ── State ─────────────────────────────────────────────────
  const [step, setStep]                 = useState(0);
  const [participants, setParticipants] = useState([]);
  const [expenses, setExpenses]         = useState([]);
  const [assignments, setAssignments]   = useState({});
  const [pInput, setPInput]             = useState("");
  const [eNameInput, setENameInput]     = useState("");
  const [eAmtInput, setEAmtInput]       = useState("");
  const [copied, setCopied]             = useState(false);

  // ── Participants ──────────────────────────────────────────
  function addParticipant() {
    const name = pInput.trim();
    if (!name) return;
    const id = uid();
    const palette = avatarPalette[participants.length % avatarPalette.length];
    setParticipants((prev) => [...prev, { id, name, palette }]);
    setPInput("");
  }
  function removeParticipant(id) {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setAssignments((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((eid) => { next[eid] = next[eid].filter((pid) => pid !== id); });
      return next;
    });
  }

  // ── Expenses ──────────────────────────────────────────────
  function addExpense() {
    const name = eNameInput.trim();
    const amt  = parseFloat(eAmtInput);
    if (!name || isNaN(amt) || amt <= 0) return;
    const id = uid();
    setExpenses((prev) => [...prev, { id, name, amount: amt }]);
    setAssignments((prev) => ({ ...prev, [id]: participants.map((p) => p.id) }));
    setENameInput(""); setEAmtInput("");
  }
  function removeExpense(id) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setAssignments((prev) => { const n = { ...prev }; delete n[id]; return n; });
  }

  // ── Assignments ───────────────────────────────────────────
  function toggleParticipant(expenseId, participantId) {
    setAssignments((prev) => {
      const current = prev[expenseId] || [];
      const next = current.includes(participantId)
        ? current.filter((id) => id !== participantId)
        : [...current, participantId];
      return { ...prev, [expenseId]: next };
    });
  }
  const assignAll  = (eid) => setAssignments((p) => ({ ...p, [eid]: participants.map((x) => x.id) }));
  const assignNone = (eid) => setAssignments((p) => ({ ...p, [eid]: [] }));

  // ── Results calc ──────────────────────────────────────────
  function calcResults() {
    const totals = {}, lineItems = {};
    participants.forEach((p) => { totals[p.id] = 0; lineItems[p.id] = []; });
    expenses.forEach((exp) => {
      const pids = (assignments[exp.id] || []).filter((pid) => participants.some((p) => p.id === pid));
      if (!pids.length) return;
      const share = exp.amount / pids.length;
      pids.forEach((pid) => {
        totals[pid] = (totals[pid] || 0) + share;
        lineItems[pid].push({ expName: exp.name, expTotal: exp.amount, share, splitAmong: pids.length });
      });
    });
    return { totals, lineItems };
  }

  const totalBill = expenses.reduce((s, e) => s + e.amount, 0);
  const { totals, lineItems } = calcResults();
  const unassigned = expenses.filter((e) => !(assignments[e.id] || []).length);

  // ── Share text ────────────────────────────────────────────
  function buildShareText() {
    const sep = "─".repeat(38);
    const lines = [`💸 EXPENSE SPLIT  ·  ${today()}`, sep, `Total: ${fmt(totalBill)}  ·  ${participants.length} people  ·  ${expenses.length} expenses`, sep];
    [...participants].sort((a, b) => (totals[b.id] || 0) - (totals[a.id] || 0)).forEach((p) => {
      lines.push(`\n${p.name}  →  ${fmt(totals[p.id] || 0)}`);
      (lineItems[p.id] || []).forEach((item) => {
        lines.push(`   • ${item.expName}: ${fmt(item.expTotal)}${item.splitAmong > 1 ? ` ÷ ${item.splitAmong}` : ""} = ${fmt(item.share)}`);
      });
    });
    lines.push(`\n${sep}`);
    return lines.join("\n");
  }
  function copyShare() {
    navigator.clipboard.writeText(buildShareText()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  }
  function startOver() {
    setStep(0); setParticipants([]); setExpenses([]); setAssignments({});
    setPInput(""); setENameInput(""); setEAmtInput("");
  }

  const canContinue = [participants.length > 0, expenses.length > 0, true];

  // ── Style helpers (theme-aware) ────────────────────────────
  const card = {
    background: T.cardBg,
    border: `1px solid ${T.cardBorder}`,
    backdropFilter: T.cardBlur,
    WebkitBackdropFilter: T.cardBlur,
    boxShadow: T.cardShadow,
    borderRadius: 16,
    padding: "1.2rem 1.4rem",
  };
  const row   = { display: "flex", alignItems: "center", gap: 10 };
  const mono  = { fontFamily: "'SF Mono','Fira Code','Cascadia Code',ui-monospace,monospace" };
  const lbl   = { display: "block", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: T.textMuted, marginBottom: 8 };

  const iconBtn = {
    background: "none", border: "none", cursor: "pointer",
    color: T.red, fontSize: 20, lineHeight: 1, padding: "0 3px",
    display: "flex", alignItems: "center", opacity: 0.65,
  };
  const smallBtn = {
    fontSize: 11, padding: "3px 9px", cursor: "pointer", height: "auto",
    background: T.btnBg, border: `1px solid ${T.btnBorder}`,
    borderRadius: 6, color: T.textSub, fontWeight: 500,
  };

  const avatarStyle = (p) => ({
    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
    background: p.palette.bg, border: `1px solid ${p.palette.border}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11.5, fontWeight: 800, color: p.palette.text, letterSpacing: "0.02em",
  });

  const chipStyle = (active) => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "5px 13px 5px 10px", borderRadius: 20, fontSize: 13,
    fontWeight: 500, cursor: "pointer", userSelect: "none",
    background: active ? T.accentDim : theme === "dark" ? "rgba(255,255,255,0.04)" : "#f3f4f6",
    color:      active ? T.accentText : T.textSub,
    border:     `1px solid ${active ? T.accentBorder : "transparent"}`,
    transition: "all 0.13s ease",
  });

  const primaryBtnStyle = canContinue[step] ? {
    background: T.accent,
    color: theme === "dark" ? "#001a0f" : "#ffffff",
    borderColor: T.accent,
    fontWeight: 700,
  } : { opacity: 0.28, cursor: "not-allowed" };

  // ── CSS var injection via style tag ───────────────────────
  const cssVars = `
    :root {
      --input-bg: ${T.inputBg};
      --input-border: ${T.inputBorder};
      --input-focus-border: ${T.inputFocusBorder};
      --input-focus-shadow: ${T.inputFocusShadow};
      --input-color: ${T.inputColor};
      --input-placeholder: ${T.inputPlaceholder};
      --btn-bg: ${T.btnBg};
      --btn-border: ${T.btnBorder};
      --btn-text: ${T.btnText};
      --btn-hover-bg: ${T.btnHoverBg};
      --btn-hover-border: ${T.btnHoverBorder};
    }
  `;

  const emptyState = { textAlign: "center", padding: "3rem 0", color: T.textMuted };

  return (
    <>
      <style>{cssVars}</style>
      <div style={{
        minHeight: "100vh", background: T.pageBg, color: T.text,
        fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        display: "flex", flexDirection: "column",
        transition: "background 0.3s ease, color 0.3s ease",
      }}>
        {/* Frosted glass noise overlay for dark mode */}
        {theme === "dark" && (
          <div style={{
            position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
            background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,224,160,0.07) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 85% 90%, rgba(99,102,241,0.07) 0%, transparent 70%)",
          }} />
        )}

        <div style={{ flex: 1, maxWidth: 620, width: "100%", margin: "0 auto", padding: "2.5rem 1rem 4rem", position: "relative", zIndex: 1 }}>

          {/* ── Header ──────────────────────────────────────── */}
          <header style={{ ...row, justifyContent: "space-between", marginBottom: "2.5rem" }}>
            <div style={row}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: T.logoBoxBg, border: `1px solid ${T.logoBoxBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>💸</div>
              <div>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                  Expense Splitter
                </h1>
                <p style={{ margin: 0, fontSize: 12.5, color: T.textSub, lineHeight: 1.4 }}>
                  Fair splits, even when it's complicated.
                </p>
              </div>
            </div>
            <ThemeToggle theme={theme} T={T} onToggle={toggleTheme} />
          </header>

          {/* ── Step indicators ─────────────────────────────── */}
          <div style={{ display: "flex", gap: 6, marginBottom: "2.25rem" }}>
            {STEPS.map((name, i) => {
              const done = i < step, active = i === step;
              return (
                <div key={i} style={{ flex: 1, cursor: done ? "pointer" : "default" }} onClick={() => done && setStep(i)}>
                  <div style={{
                    height: 3, borderRadius: 2, marginBottom: 6,
                    background: active ? T.accent : done ? T.stepDone : T.stepInactive,
                    transition: "background 0.25s",
                  }} />
                  <span style={{
                    fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    color: active ? T.accentText : done ? T.stepDone : T.textMuted,
                    transition: "color 0.25s",
                  }}>
                    {i + 1}. {name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ══════════════════════════════════════════════════
              STEP 0 — PARTICIPANTS
          ══════════════════════════════════════════════════ */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={card}>
                <label style={lbl}>Add participant</label>
                <div style={row}>
                  <input placeholder="Enter a name…" style={{ flex: 1 }} value={pInput} onChange={(e) => setPInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addParticipant()} autoFocus />
                  <button onClick={addParticipant}>Add</button>
                </div>
              </div>
              {participants.length === 0 ? (
                <div style={emptyState}>
                  <div style={{ fontSize: 34, marginBottom: 10, opacity: 0.3 }}>👥</div>
                  <p style={{ margin: 0, fontSize: 13.5 }}>Add at least one participant to get started.</p>
                </div>
              ) : participants.map((p) => (
                <BounceIn key={p.id}>
                  <div style={{ ...card, ...row, justifyContent: "space-between", padding: "0.75rem 1.1rem" }}>
                    <div style={row}>
                      <div style={avatarStyle(p)}>{initials(p.name)}</div>
                      <span style={{ fontWeight: 500, fontSize: 14.5 }}>{p.name}</span>
                    </div>
                    <button style={iconBtn} onClick={() => removeParticipant(p.id)}>×</button>
                  </div>
                </BounceIn>
              ))}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              STEP 1 — EXPENSES
          ══════════════════════════════════════════════════ */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={card}>
                <label style={lbl}>Add expense</label>
                <div style={row}>
                  <input style={{ flex: 2 }} placeholder="Description…" value={eNameInput} onChange={(e) => setENameInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && document.getElementById("amt")?.focus()} autoFocus />
                  <input id="amt" style={{ flex: 1 }} type="number" min="0.01" step="0.01" placeholder="$ Amount" value={eAmtInput} onChange={(e) => setEAmtInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addExpense()} />
                  <button onClick={addExpense}>Add</button>
                </div>
              </div>
              {expenses.length === 0 ? (
                <div style={emptyState}>
                  <div style={{ fontSize: 34, marginBottom: 10, opacity: 0.3 }}>🧾</div>
                  <p style={{ margin: 0, fontSize: 13.5 }}>No expenses yet. Add at least one to continue.</p>
                </div>
              ) : (
                <>
                  {expenses.map((exp) => (
                    <BounceIn key={exp.id}>
                      <div style={{ ...card, ...row, justifyContent: "space-between", padding: "0.75rem 1.1rem" }}>
                        <span style={{ fontWeight: 500, fontSize: 14.5 }}>{exp.name}</span>
                        <div style={row}>
                          <span style={{ ...mono, fontWeight: 700, fontSize: 14, color: T.accentText }}>{fmt(exp.amount)}</span>
                          <button style={iconBtn} onClick={() => removeExpense(exp.id)}>×</button>
                        </div>
                      </div>
                    </BounceIn>
                  ))}
                  <div style={{ ...card, ...row, justifyContent: "space-between", padding: "0.75rem 1.1rem", background: T.totalCardBg, border: `1px solid ${T.totalCardBorder}`, boxShadow: "none" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: T.accentText, textTransform: "uppercase", letterSpacing: "0.09em" }}>Total</span>
                    <span style={{ ...mono, fontWeight: 800, fontSize: 18 }}>{fmt(totalBill)}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              STEP 2 — ASSIGN
          ══════════════════════════════════════════════════ */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ margin: "0 0 0.25rem", color: T.textSub, fontSize: 13.5 }}>
                Select who shares each expense. Costs divide equally among selected people.
              </p>
              {expenses.map((exp) => {
                const assigned = (assignments[exp.id] || []).filter((pid) => participants.some((p) => p.id === pid));
                const share = assigned.length > 0 ? exp.amount / assigned.length : null;
                return (
                  <div key={exp.id} style={{ ...card, overflow: "hidden" }}>
                    <div style={{ ...row, justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontWeight: 600, fontSize: 14.5 }}>{exp.name}</span>
                      <div style={row}>
                        <button style={smallBtn} onClick={() => assignAll(exp.id)}>All</button>
                        <button style={smallBtn} onClick={() => assignNone(exp.id)}>None</button>
                        <span style={{ ...mono, fontWeight: 700, fontSize: 14, color: T.accentText }}>{fmt(exp.amount)}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {participants.map((p) => {
                        const active = assigned.includes(p.id);
                        return (
                          <div key={p.id} style={chipStyle(active)} onClick={() => toggleParticipant(exp.id, p.id)}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: active ? T.accentText : T.textMuted, flexShrink: 0 }} />
                            {p.name}
                          </div>
                        );
                      })}
                    </div>
                    {share !== null && (
                      <div style={{ fontSize: 12, color: T.textSub, marginTop: 10, borderTop: `1px solid ${T.cardBorder}`, paddingTop: 8 }}>
                        Each pays <span style={{ ...mono, fontWeight: 700, color: T.text }}>{fmt(share)}</span>
                        {assigned.length > 1 && <span style={{ color: T.textMuted }}> · split {assigned.length} ways</span>}
                      </div>
                    )}
                    {assigned.length === 0 && (
                      <div style={{ padding: "8px 1.4rem 0.9rem", margin: "10px -1.4rem -1.2rem", background: T.yellowDim, borderTop: `1px solid ${T.yellowBorder}`, fontSize: 12, color: T.yellow }}>
                        ⚠ Nobody assigned — this expense won't appear in results.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              STEP 3 — RESULTS
          ══════════════════════════════════════════════════ */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Summary metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[
                  { label: "Total Bill",   value: fmt(totalBill), hi: true },
                  { label: "Participants", value: String(participants.length) },
                  { label: "Expenses",     value: String(expenses.length) },
                ].map((m) => (
                  <div key={m.label} style={{
                    ...card,
                    ...(m.hi ? { background: T.metricHighBg, border: `1px solid ${T.metricHighBorder}`, boxShadow: "none" } : {}),
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: m.hi ? T.metricHighLabel : T.textMuted, marginBottom: 5 }}>
                      {m.label}
                    </div>
                    <div style={{ ...mono, fontSize: 18, fontWeight: 800 }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Per-person cards */}
              {[...participants]
                .sort((a, b) => (totals[b.id] || 0) - (totals[a.id] || 0))
                .map((p) => {
                  const pItems = lineItems[p.id] || [];
                  const total  = totals[p.id] || 0;
                  return (
                    <BounceIn key={p.id}>
                      <div style={card}>
                        <div style={{ ...row, justifyContent: "space-between", marginBottom: pItems.length ? 12 : 0 }}>
                          <div style={row}>
                            <div style={avatarStyle(p)}>{initials(p.name)}</div>
                            <span style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</span>
                          </div>
                          <span style={{ ...mono, fontWeight: 800, fontSize: 21, color: p.palette.text }}>{fmt(total)}</span>
                        </div>
                        {pItems.length > 0 && (
                          <div style={{ borderTop: `1px solid ${T.cardBorder}`, paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                            {pItems.map((item, i) => (
                              <div key={i} style={{ ...row, justifyContent: "space-between", fontSize: 13 }}>
                                <span style={{ color: T.textSub }}>{item.expName}</span>
                                <span style={{ ...mono, fontSize: 12, color: T.textMuted }}>
                                  {fmt(item.expTotal)}{item.splitAmong > 1 && ` ÷ ${item.splitAmong}`}
                                  {" = "}<span style={{ color: T.text, fontWeight: 700 }}>{fmt(item.share)}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {pItems.length === 0 && <p style={{ margin: "8px 0 0", fontSize: 12, color: T.textMuted }}>Not assigned to any expenses.</p>}
                      </div>
                    </BounceIn>
                  );
                })}

              {unassigned.length > 0 && (
                <div style={{ background: T.yellowDim, border: `1px solid ${T.yellowBorder}`, borderRadius: 12, padding: "0.9rem 1.1rem", fontSize: 13, color: T.yellow }}>
                  ⚠ <strong>{unassigned.length} unassigned expense{unassigned.length > 1 ? "s" : ""}:</strong>{" "}
                  {unassigned.map((e) => e.name).join(", ")} — go back to Assign to include them.
                </div>
              )}

              {/* Share card */}
              <div style={{ ...card, border: `1.5px dashed ${T.accentBorder}`, background: T.accentDim, boxShadow: "none" }}>
                <div style={{ ...row, justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>Share results</span>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: T.textSub }}>Copy a text summary to paste in any chat.</p>
                  </div>
                  <button onClick={copyShare} style={copied ? { background: T.accentDim, borderColor: T.accentBorder, color: T.accentText } : {}}>
                    {copied ? "✓ Copied!" : "Copy text"}
                  </button>
                </div>
                <pre style={{
                  margin: 0, padding: "0.75rem 1rem",
                  background: T.preCodeBg, border: `1px solid ${T.cardBorder}`,
                  borderRadius: 8, fontFamily: "'SF Mono','Fira Code',ui-monospace,monospace",
                  fontSize: 11.5, color: T.textSub, whiteSpace: "pre-wrap",
                  lineHeight: 1.65, maxHeight: 220, overflowY: "auto",
                }}>
                  {buildShareText()}
                </pre>
              </div>

              <button onClick={startOver} style={{ width: "100%", padding: "0.65rem", background: "transparent", border: `1px solid ${T.cardBorder}`, borderRadius: 8, cursor: "pointer", color: T.textMuted, fontSize: 13, fontWeight: 500 }}>
                ↺ Start over
              </button>
            </div>
          )}

          {/* ── Navigation ──────────────────────────────────── */}
          <div style={{ ...row, justifyContent: "space-between", marginTop: "1.75rem" }}>
            <div>{step > 0 && step < 3 && <button onClick={() => setStep((s) => s - 1)}>← Back</button>}</div>
            <div>
              {step < 3 && (
                <button onClick={() => canContinue[step] && setStep((s) => s + 1)} disabled={!canContinue[step]} style={primaryBtnStyle}>
                  {step === 2 ? "View Results →" : "Continue →"}
                </button>
              )}
            </div>
          </div>

        </div>

        {/* ── Footer ────────────────────────────────────────── */}
        <footer style={{ borderTop: `1px solid ${T.footerBorder}`, padding: "1.25rem 1rem", textAlign: "center", position: "relative", zIndex: 1 }}>
          <p style={{ margin: 0, fontSize: 12, color: T.footerText, letterSpacing: "0.01em" }}>
            100% vibe-coded by the master:{" "}
            <span style={{ color: T.accentText, fontWeight: 600 }}>Claude</span>
            <span style={{ margin: "0 8px", opacity: 0.3 }}>·</span>
            Not a single human keystroke was harmed in the making of this app.
          </p>
        </footer>
      </div>
    </>
  );
}