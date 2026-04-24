import { useState } from "react";
import { useSpring, animated } from "@react-spring/web";

// ── Avatar palette (dark-mode ready) ──────────────────────
const AVATAR_PALETTE = [
  { bg: "#151b35", text: "#818cf8", border: "rgba(129,140,248,0.25)" },
  { bg: "#0b2820", text: "#34d399", border: "rgba(52,211,153,0.25)" },
  { bg: "#2b1a0a", text: "#fb923c", border: "rgba(251,146,60,0.25)" },
  { bg: "#20103e", text: "#c084fc", border: "rgba(192,132,252,0.25)" },
  { bg: "#081e38", text: "#60a5fa", border: "rgba(96,165,250,0.25)" },
  { bg: "#241900", text: "#fbbf24", border: "rgba(251,191,36,0.25)" },
  { bg: "#2a0e18", text: "#fb7185", border: "rgba(251,113,133,0.25)" },
  { bg: "#092318", text: "#4ade80", border: "rgba(74,222,128,0.25)" },
];

// ── Design tokens (Vaulta-inspired dark fintech) ───────────
const C = {
  bg:           "#0b0d13",
  surface:      "#10131c",
  border:       "rgba(255,255,255,0.07)",
  borderMid:    "rgba(255,255,255,0.11)",
  text:         "#dde4f2",
  textSub:      "#8896b2",
  textMuted:    "#4d5a72",
  accent:       "#00e0a0",
  accentDim:    "rgba(0,224,160,0.09)",
  accentBorder: "rgba(0,224,160,0.22)",
  red:          "#ff4d72",
  yellow:       "#f59e0b",
  yellowDim:    "rgba(245,158,11,0.09)",
  yellowBorder: "rgba(245,158,11,0.2)",
};

// ── Helpers ────────────────────────────────────────────────
let _seq = 0;
const uid = () => `id${++_seq}`;
const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const initials = (name) =>
  name.trim().split(/\s+/).map((w) => w[0] || "").join("").toUpperCase().slice(0, 2) || "?";
const today = () =>
  new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

// ── Bounce-in animation wrapper ────────────────────────────
function BounceIn({ children }) {
  const spring = useSpring({
    from: { opacity: 0, transform: "scale(0.86) translateY(12px)" },
    to:   { opacity: 1, transform: "scale(1) translateY(0px)" },
    config: { tension: 320, friction: 22 },
  });
  return <animated.div style={spring}>{children}</animated.div>;
}

const STEPS = ["Participants", "Expenses", "Assign", "Results"];

export default function App() {
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
    const palette = AVATAR_PALETTE[participants.length % AVATAR_PALETTE.length];
    setParticipants((prev) => [...prev, { id, name, ...palette }]);
    setPInput("");
  }

  function removeParticipant(id) {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setAssignments((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((eid) => {
        next[eid] = next[eid].filter((pid) => pid !== id);
      });
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
    setENameInput("");
    setEAmtInput("");
  }

  function removeExpense(id) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setAssignments((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
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

  // ── Results ───────────────────────────────────────────────
  function calcResults() {
    const totals = {};
    const lineItems = {};
    participants.forEach((p) => { totals[p.id] = 0; lineItems[p.id] = []; });
    expenses.forEach((exp) => {
      const pids = (assignments[exp.id] || []).filter((pid) =>
        participants.some((p) => p.id === pid)
      );
      if (!pids.length) return;
      const share = exp.amount / pids.length;
      pids.forEach((pid) => {
        totals[pid] = (totals[pid] || 0) + share;
        lineItems[pid].push({
          expName: exp.name,
          expTotal: exp.amount,
          share,
          splitAmong: pids.length,
        });
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
    const lines = [
      `💸 EXPENSE SPLIT  ·  ${today()}`,
      sep,
      `Total: ${fmt(totalBill)}  ·  ${participants.length} people  ·  ${expenses.length} expenses`,
      sep,
    ];
    [...participants]
      .sort((a, b) => (totals[b.id] || 0) - (totals[a.id] || 0))
      .forEach((p) => {
        lines.push(`\n${p.name}  →  ${fmt(totals[p.id] || 0)}`);
        (lineItems[p.id] || []).forEach((item) => {
          const div = item.splitAmong > 1 ? ` ÷ ${item.splitAmong}` : "";
          lines.push(`   • ${item.expName}: ${fmt(item.expTotal)}${div} = ${fmt(item.share)}`);
        });
      });
    lines.push(`\n${sep}`);
    return lines.join("\n");
  }

  function copyShare() {
    navigator.clipboard.writeText(buildShareText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function startOver() {
    setStep(0); setParticipants([]); setExpenses([]); setAssignments({});
    setPInput(""); setENameInput(""); setEAmtInput("");
  }

  const canContinue = [participants.length > 0, expenses.length > 0, true];

  // ── Style helpers ─────────────────────────────────────────
  const card     = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "1.2rem 1.4rem" };
  const row      = { display: "flex", alignItems: "center", gap: 10 };
  const mono     = { fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace" };
  const lbl      = { display: "block", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: C.textMuted, marginBottom: 8 };
  const iconBtn  = { background: "none", border: "none", cursor: "pointer", color: C.red, fontSize: 20, lineHeight: 1, padding: "0 3px", display: "flex", alignItems: "center", opacity: 0.65 };
  const smallBtn = { fontSize: 11, padding: "3px 9px", cursor: "pointer", height: "auto", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textSub, fontWeight: 500 };

  const avatar = (p) => ({
    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
    background: p.bg, border: `1px solid ${p.border}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11.5, fontWeight: 800, color: p.text, letterSpacing: "0.02em",
  });

  const chip = (active) => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "5px 13px 5px 10px", borderRadius: 20, fontSize: 13,
    fontWeight: 500, cursor: "pointer", userSelect: "none",
    background: active ? C.accentDim : "rgba(255,255,255,0.04)",
    color:      active ? C.accent    : C.textSub,
    border: `1px solid ${active ? C.accentBorder : "transparent"}`,
    transition: "all 0.13s ease",
  });

  const primaryBtnStyle = canContinue[step]
    ? { background: C.accent, color: "#000d0a", borderColor: C.accent, fontWeight: 700 }
    : { opacity: 0.3, cursor: "not-allowed" };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ flex: 1, maxWidth: 620, width: "100%", margin: "0 auto", padding: "2.5rem 1rem 4rem" }}>

        {/* Header */}
        <header style={{ marginBottom: "2.5rem" }}>
          <div style={{ ...row, marginBottom: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: C.accentDim, border: `1px solid ${C.accentBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
            }}>💸</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                Expense Splitter
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: C.textSub, lineHeight: 1.4 }}>
                Fair splits, even when it's complicated.
              </p>
            </div>
          </div>
        </header>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 6, marginBottom: "2.25rem" }}>
          {STEPS.map((name, i) => {
            const done = i < step, active = i === step;
            return (
              <div key={i} style={{ flex: 1, cursor: done ? "pointer" : "default" }} onClick={() => done && setStep(i)}>
                <div style={{ height: 2.5, borderRadius: 2, marginBottom: 6, background: active ? C.accent : done ? C.accentBorder : C.border, transition: "background 0.25s" }} />
                <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: active ? C.accent : done ? "rgba(0,224,160,0.45)" : C.textMuted }}>
                  {i + 1}. {name}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── STEP 0: Participants ── */}
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
              <div style={{ textAlign: "center", padding: "3rem 0", color: C.textMuted }}>
                <div style={{ fontSize: 34, marginBottom: 10, opacity: 0.35 }}>👥</div>
                <p style={{ margin: 0, fontSize: 13.5 }}>Add at least one participant to get started.</p>
              </div>
            ) : participants.map((p) => (
              <BounceIn key={p.id}>
                <div style={{ ...card, ...row, justifyContent: "space-between", padding: "0.75rem 1.1rem" }}>
                  <div style={row}>
                    <div style={avatar(p)}>{initials(p.name)}</div>
                    <span style={{ fontWeight: 500, fontSize: 14.5 }}>{p.name}</span>
                  </div>
                  <button style={iconBtn} onClick={() => removeParticipant(p.id)}>×</button>
                </div>
              </BounceIn>
            ))}
          </div>
        )}

        {/* ── STEP 1: Expenses ── */}
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
              <div style={{ textAlign: "center", padding: "3rem 0", color: C.textMuted }}>
                <div style={{ fontSize: 34, marginBottom: 10, opacity: 0.35 }}>🧾</div>
                <p style={{ margin: 0, fontSize: 13.5 }}>No expenses yet. Add at least one to continue.</p>
              </div>
            ) : (
              <>
                {expenses.map((exp) => (
                  <BounceIn key={exp.id}>
                    <div style={{ ...card, ...row, justifyContent: "space-between", padding: "0.75rem 1.1rem" }}>
                      <span style={{ fontWeight: 500, fontSize: 14.5 }}>{exp.name}</span>
                      <div style={row}>
                        <span style={{ ...mono, fontWeight: 700, fontSize: 14, color: C.accent }}>{fmt(exp.amount)}</span>
                        <button style={iconBtn} onClick={() => removeExpense(exp.id)}>×</button>
                      </div>
                    </div>
                  </BounceIn>
                ))}
                <div style={{ ...card, ...row, justifyContent: "space-between", padding: "0.75rem 1.1rem", background: C.accentDim, border: `1px solid ${C.accentBorder}` }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.09em" }}>Total</span>
                  <span style={{ ...mono, fontWeight: 800, fontSize: 18 }}>{fmt(totalBill)}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── STEP 2: Assign ── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: "0 0 0.25rem", color: C.textSub, fontSize: 13.5 }}>
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
                      <span style={{ ...mono, fontWeight: 700, fontSize: 14, color: C.accent }}>{fmt(exp.amount)}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {participants.map((p) => {
                      const active = assigned.includes(p.id);
                      return (
                        <div key={p.id} style={chip(active)} onClick={() => toggleParticipant(exp.id, p.id)}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: active ? C.accent : C.textMuted }} />
                          {p.name}
                        </div>
                      );
                    })}
                  </div>
                  {share !== null && (
                    <div style={{ fontSize: 12, color: C.textSub, marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
                      Each pays <span style={{ ...mono, fontWeight: 700, color: C.text }}>{fmt(share)}</span>
                      {assigned.length > 1 && <span style={{ color: C.textMuted }}> · split {assigned.length} ways</span>}
                    </div>
                  )}
                  {assigned.length === 0 && (
                    <div style={{ padding: "8px 1.4rem 0.9rem", margin: "10px -1.4rem -1.2rem", background: C.yellowDim, borderTop: `1px solid ${C.yellowBorder}`, fontSize: 12, color: C.yellow }}>
                      ⚠ Nobody assigned — this expense won't appear in results.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── STEP 3: Results ── */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { label: "Total Bill",    value: fmt(totalBill),           highlight: true },
                { label: "Participants",  value: String(participants.length) },
                { label: "Expenses",      value: String(expenses.length) },
              ].map((m) => (
                <div key={m.label} style={{ ...card, ...(m.highlight ? { background: C.accentDim, border: `1px solid ${C.accentBorder}` } : {}) }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: m.highlight ? C.accent : C.textMuted, marginBottom: 5 }}>
                    {m.label}
                  </div>
                  <div style={{ ...mono, fontSize: 18, fontWeight: 800 }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Per-person breakdown */}
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
                          <div style={avatar(p)}>{initials(p.name)}</div>
                          <span style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</span>
                        </div>
                        <span style={{ ...mono, fontWeight: 800, fontSize: 21, color: p.text }}>{fmt(total)}</span>
                      </div>
                      {pItems.length > 0 && (
                        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                          {pItems.map((item, i) => (
                            <div key={i} style={{ ...row, justifyContent: "space-between", fontSize: 13 }}>
                              <span style={{ color: C.textSub }}>{item.expName}</span>
                              <span style={{ ...mono, fontSize: 12, color: C.textMuted }}>
                                {fmt(item.expTotal)}{item.splitAmong > 1 && ` ÷ ${item.splitAmong}`}
                                {" = "}<span style={{ color: C.text, fontWeight: 700 }}>{fmt(item.share)}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {pItems.length === 0 && <p style={{ margin: "8px 0 0", fontSize: 12, color: C.textMuted }}>Not assigned to any expenses.</p>}
                    </div>
                  </BounceIn>
                );
              })}

            {unassigned.length > 0 && (
              <div style={{ background: C.yellowDim, border: `1px solid ${C.yellowBorder}`, borderRadius: 12, padding: "0.9rem 1.1rem", fontSize: 13, color: C.yellow }}>
                ⚠ <strong>{unassigned.length} unassigned expense{unassigned.length > 1 ? "s" : ""}:</strong>{" "}
                {unassigned.map((e) => e.name).join(", ")} — go back to Assign to include them.
              </div>
            )}

            {/* Share card */}
            <div style={{ ...card, border: `1.5px dashed ${C.accentBorder}`, background: C.accentDim }}>
              <div style={{ ...row, justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Share results</span>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: C.textSub }}>Copy a text summary to paste in any chat.</p>
                </div>
                <button onClick={copyShare} style={copied ? { background: C.accentDim, borderColor: C.accentBorder, color: C.accent } : {}}>
                  {copied ? "✓ Copied!" : "Copy text"}
                </button>
              </div>
              <pre style={{ margin: 0, padding: "0.75rem 1rem", background: "rgba(0,0,0,0.3)", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "'SF Mono','Fira Code',ui-monospace,monospace", fontSize: 11.5, color: C.textSub, whiteSpace: "pre-wrap", lineHeight: 1.65, maxHeight: 220, overflowY: "auto" }}>
                {buildShareText()}
              </pre>
            </div>

            <button onClick={startOver} style={{ width: "100%", padding: "0.65rem", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", color: C.textMuted, fontSize: 13, fontWeight: 500 }}>
              ↺ Start over
            </button>
          </div>
        )}

        {/* Navigation */}
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

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "1.25rem 1rem", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 12, color: C.textMuted, letterSpacing: "0.01em" }}>
          100% vibe-coded by the master:{" "}
          <span style={{ color: C.accent, fontWeight: 600 }}>Claude</span>
          <span style={{ margin: "0 8px", opacity: 0.3 }}>·</span>
          Not a single human keystroke was harmed in the making of this app.
        </p>
      </footer>
    </div>
  );
}