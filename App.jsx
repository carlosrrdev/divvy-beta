import { useState } from "react";

const AVATAR_PALETTE = [
  { bg: "#eef2ff", text: "#4338ca", border: "#c7d2fe" },
  { bg: "#ecfdf5", text: "#047857", border: "#6ee7b7" },
  { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  { bg: "#fdf4ff", text: "#7e22ce", border: "#e9d5ff" },
  { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  { bg: "#fef9c3", text: "#a16207", border: "#fde047" },
  { bg: "#fff1f2", text: "#be123c", border: "#fecdd3" },
  { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
];

let _seq = 0;
const uid = () => `id${++_seq}`;
const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const initials = (name) =>
  name.trim().split(/\s+/).map((w) => w[0] || "").join("").toUpperCase().slice(0, 2) || "?";
const today = () =>
  new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const STEPS = ["Participants", "Expenses", "Assign", "Results"];

export default function App() {
  const [step, setStep] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [pInput, setPInput] = useState("");
  const [eNameInput, setENameInput] = useState("");
  const [eAmtInput, setEAmtInput] = useState("");
  const [copied, setCopied] = useState(false);

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

  // ── Expenses ─────────────────────────────────────────────
  function addExpense() {
    const name = eNameInput.trim();
    const amt = parseFloat(eAmtInput);
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

  function assignAll(expenseId) {
    setAssignments((prev) => ({ ...prev, [expenseId]: participants.map((p) => p.id) }));
  }

  function assignNone(expenseId) {
    setAssignments((prev) => ({ ...prev, [expenseId]: [] }));
  }

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
        lineItems[pid].push({ expName: exp.name, expTotal: exp.amount, share, splitAmong: pids.length });
      });
    });

    return { totals, lineItems };
  }

  const totalBill = expenses.reduce((s, e) => s + e.amount, 0);
  const { totals, lineItems } = calcResults();
  const unassigned = expenses.filter((e) => !(assignments[e.id] || []).length);

  function buildShareText() {
    const sep = "─".repeat(38);
    const lines = [
      `💸 EXPENSE SPLIT  ·  ${today()}`,
      sep,
      `Total Bill: ${fmt(totalBill)}  ·  ${participants.length} people  ·  ${expenses.length} expenses`,
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
    setStep(0); setParticipants([]); setExpenses([]); setAssignments([]);
    setPInput(""); setENameInput(""); setEAmtInput("");
  }

  const canContinue = [
    participants.length > 0,
    expenses.length > 0,
    true,
  ];

  // ── Styles ────────────────────────────────────────────────
  const S = {
    card: {
      background: "#fff",
      border: "1px solid #e8ecf3",
      borderRadius: 14,
      padding: "1.2rem 1.35rem",
    },
    row: { display: "flex", alignItems: "center", gap: 10 },
    label: {
      display: "block", fontSize: 10.5, fontWeight: 700,
      letterSpacing: "0.08em", textTransform: "uppercase",
      color: "#8d9ab0", marginBottom: 7,
    },
    muted: { color: "#7e8fa3", fontSize: 13 },
    mono: { fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace" },
    avatar: (p) => ({
      width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
      background: p.bg, border: `1.5px solid ${p.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11.5, fontWeight: 800, color: p.text,
      letterSpacing: "0.03em",
    }),
    chip: (active, p) => ({
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 12px 5px 9px", borderRadius: 20, fontSize: 13,
      fontWeight: 500, cursor: "pointer", userSelect: "none",
      background: active ? p.bg : "#f1f5f9",
      color: active ? p.text : "#64748b",
      border: `1.5px solid ${active ? p.border : "transparent"}`,
      transition: "all 0.12s ease",
    }),
    iconBtn: {
      background: "none", border: "none", cursor: "pointer",
      color: "#e53e3e", fontSize: 20, lineHeight: 1,
      padding: "0 3px", display: "flex", alignItems: "center",
    },
    smallBtn: {
      fontSize: 11, padding: "3px 8px", cursor: "pointer",
      background: "#f1f5f9", border: "1px solid #e2e8f0",
      borderRadius: 6, color: "#64748b", fontWeight: 500,
    },
    emptyState: {
      textAlign: "center", padding: "2.5rem 1rem",
      color: "#94a3b8", fontSize: 14,
    },
    metricCard: {
      background: "#fff", border: "1px solid #e8ecf3",
      borderRadius: 12, padding: "0.85rem 1rem",
    },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f2f4f9", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: "#0f172a" }}>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "2.5rem 1rem 4rem" }}>

        {/* ── Header ── */}
        <header style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: "#0f172a" }}>
              Expense Splitter
            </h1>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6366f1", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 6, padding: "2px 7px" }}>
              Beta
            </span>
          </div>
          <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
            Fair splits, no matter how complicated the arrangement.
          </p>
        </header>

        {/* ── Step indicator ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: "2rem" }}>
          {STEPS.map((name, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div
                key={i}
                style={{ flex: 1, cursor: done ? "pointer" : "default" }}
                onClick={() => done && setStep(i)}
                title={done ? `Back to ${name}` : undefined}
              >
                <div style={{
                  height: 3, borderRadius: 2, marginBottom: 6,
                  background: active ? "#6366f1" : done ? "#a5b4fc" : "#e2e8f0",
                  transition: "background 0.25s",
                }} />
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: active ? "#6366f1" : done ? "#818cf8" : "#94a3b8",
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
            <div style={S.card}>
              <label style={S.label}>Add participant</label>
              <div style={S.row}>
                <input
                  style={{ flex: 1 }}
                  placeholder="Enter a name…"
                  value={pInput}
                  onChange={(e) => setPInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addParticipant()}
                  autoFocus
                />
                <button onClick={addParticipant}>Add</button>
              </div>
            </div>

            {participants.length === 0 ? (
              <div style={S.emptyState}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
                <p style={{ margin: 0 }}>Add at least one participant to get started.</p>
              </div>
            ) : (
              participants.map((p) => (
                <div key={p.id} style={{ ...S.card, ...S.row, justifyContent: "space-between", padding: "0.75rem 1.1rem" }}>
                  <div style={S.row}>
                    <div style={S.avatar(p)}>{initials(p.name)}</div>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</span>
                  </div>
                  <button style={S.iconBtn} onClick={() => removeParticipant(p.id)}>×</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            STEP 1 — EXPENSES
        ══════════════════════════════════════════════════ */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={S.card}>
              <label style={S.label}>Add expense</label>
              <div style={S.row}>
                <input
                  style={{ flex: 2 }}
                  placeholder="Description…"
                  value={eNameInput}
                  onChange={(e) => setENameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && document.getElementById("amt")?.focus()}
                  autoFocus
                />
                <input
                  id="amt"
                  style={{ flex: 1 }}
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="$ Amount"
                  value={eAmtInput}
                  onChange={(e) => setEAmtInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addExpense()}
                />
                <button onClick={addExpense}>Add</button>
              </div>
            </div>

            {expenses.length === 0 ? (
              <div style={S.emptyState}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🧾</div>
                <p style={{ margin: 0 }}>No expenses yet. Add at least one to continue.</p>
              </div>
            ) : (
              <>
                {expenses.map((exp) => (
                  <div key={exp.id} style={{ ...S.card, ...S.row, justifyContent: "space-between", padding: "0.75rem 1.1rem" }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{exp.name}</span>
                    <div style={S.row}>
                      <span style={{ ...S.mono, fontWeight: 700, fontSize: 14, color: "#6366f1" }}>
                        {fmt(exp.amount)}
                      </span>
                      <button style={S.iconBtn} onClick={() => removeExpense(exp.id)}>×</button>
                    </div>
                  </div>
                ))}
                <div style={{ ...S.card, ...S.row, justifyContent: "space-between", background: "#f8f9ff", padding: "0.75rem 1.1rem" }}>
                  <span style={{ ...S.muted, fontWeight: 600, fontSize: 13 }}>Total</span>
                  <span style={{ ...S.mono, fontWeight: 800, fontSize: 17 }}>{fmt(totalBill)}</span>
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
            <p style={{ ...S.muted, margin: "0 0 0.25rem" }}>
              Select who shares each expense. Costs divide equally among selected people.
            </p>
            {expenses.map((exp) => {
              const assigned = (assignments[exp.id] || []).filter((pid) =>
                participants.some((p) => p.id === pid)
              );
              const share = assigned.length > 0 ? exp.amount / assigned.length : null;

              return (
                <div key={exp.id} style={{ ...S.card, overflow: "hidden" }}>
                  {/* Expense header */}
                  <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{exp.name}</span>
                    <div style={S.row}>
                      <button style={S.smallBtn} onClick={() => assignAll(exp.id)}>All</button>
                      <button style={S.smallBtn} onClick={() => assignNone(exp.id)}>None</button>
                      <span style={{ ...S.mono, fontWeight: 700, fontSize: 14, color: "#6366f1" }}>
                        {fmt(exp.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Participant chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {participants.map((p) => {
                      const active = assigned.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          style={S.chip(active, p)}
                          onClick={() => toggleParticipant(exp.id, p.id)}
                        >
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                            background: active ? p.text : "#cbd5e1",
                          }} />
                          {p.name}
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer hint */}
                  {share !== null && (
                    <div style={{ fontSize: 12, color: "#7e8fa3", marginTop: 10, borderTop: "1px solid #f1f5f9", paddingTop: 8 }}>
                      Each pays{" "}
                      <strong style={{ color: "#0f172a", ...S.mono }}>{fmt(share)}</strong>
                      {assigned.length > 1 && ` · split ${assigned.length} ways`}
                    </div>
                  )}
                  {assigned.length === 0 && (
                    <div style={{ marginTop: 0, padding: "8px 1.35rem 0.9rem", margin: "10px -1.35rem -1.2rem", background: "#fffbeb", borderTop: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>
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
                { label: "Total Bill", value: fmt(totalBill) },
                { label: "Participants", value: String(participants.length) },
                { label: "Expenses", value: String(expenses.length) },
              ].map((m) => (
                <div key={m.label} style={S.metricCard}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8d9ab0", marginBottom: 5 }}>
                    {m.label}
                  </div>
                  <div style={{ ...S.mono, fontSize: 19, fontWeight: 800 }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Per-person breakdown */}
            {[...participants]
              .sort((a, b) => (totals[b.id] || 0) - (totals[a.id] || 0))
              .map((p) => {
                const pItems = lineItems[p.id] || [];
                const total = totals[p.id] || 0;
                return (
                  <div key={p.id} style={S.card}>
                    <div style={{ ...S.row, justifyContent: "space-between", marginBottom: pItems.length ? 12 : 0 }}>
                      <div style={S.row}>
                        <div style={S.avatar(p)}>{initials(p.name)}</div>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                      </div>
                      <span style={{ ...S.mono, fontWeight: 800, fontSize: 20, color: p.text }}>
                        {fmt(total)}
                      </span>
                    </div>

                    {pItems.length > 0 && (
                      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                        {pItems.map((item, i) => (
                          <div key={i} style={{ ...S.row, justifyContent: "space-between", fontSize: 13 }}>
                            <span style={{ color: "#64748b" }}>{item.expName}</span>
                            <span style={{ ...S.mono, fontSize: 12, color: "#94a3b8" }}>
                              {fmt(item.expTotal)}
                              {item.splitAmong > 1 && ` ÷ ${item.splitAmong}`}
                              {" = "}
                              <span style={{ color: "#0f172a", fontWeight: 700 }}>{fmt(item.share)}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {pItems.length === 0 && (
                      <p style={{ ...S.muted, margin: "8px 0 0", fontSize: 12 }}>
                        Not assigned to any expenses.
                      </p>
                    )}
                  </div>
                );
              })}

            {/* Unassigned warning */}
            {unassigned.length > 0 && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "0.85rem 1.1rem", fontSize: 13, color: "#92400e" }}>
                <strong>⚠ {unassigned.length} unassigned expense{unassigned.length > 1 ? "s" : ""}:</strong>{" "}
                {unassigned.map((e) => e.name).join(", ")}
                <span style={{ color: "#b45309" }}> — go back to Assign to include them.</span>
              </div>
            )}

            {/* Share card */}
            <div style={{ ...S.card, border: "1.5px dashed #c7d2fe", background: "#fafbff" }}>
              <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Share results</span>
                  <p style={{ ...S.muted, margin: "2px 0 0", fontSize: 12 }}>
                    Copy a text summary to paste in any chat or message.
                  </p>
                </div>
                <button
                  onClick={copyShare}
                  style={copied ? { background: "#ecfdf5", borderColor: "#6ee7b7", color: "#065f46" } : {}}
                >
                  {copied ? "✓ Copied!" : "Copy text"}
                </button>
              </div>
              <pre style={{
                margin: 0, padding: "0.75rem 1rem",
                background: "#f8fafc", border: "1px solid #e8ecf3",
                borderRadius: 8, fontFamily: "'SF Mono', 'Fira Code', ui-monospace, monospace",
                fontSize: 11.5, color: "#475569",
                whiteSpace: "pre-wrap", lineHeight: 1.65,
                maxHeight: 220, overflowY: "auto",
              }}>
                {buildShareText()}
              </pre>
            </div>

            {/* Start over */}
            <button
              onClick={startOver}
              style={{
                width: "100%", padding: "0.6rem",
                background: "transparent", border: "1px solid #e2e8f0",
                borderRadius: 8, cursor: "pointer",
                color: "#64748b", fontSize: 13, fontWeight: 500,
              }}
            >
              ↺ Start over
            </button>
          </div>
        )}

        {/* ── Navigation buttons ── */}
        <div style={{ ...S.row, justifyContent: "space-between", marginTop: "1.75rem" }}>
          <div>
            {step > 0 && step < 3 && (
              <button onClick={() => setStep((s) => s - 1)}>← Back</button>
            )}
          </div>
          <div>
            {step < 3 && (
              <button
                onClick={() => canContinue[step] && setStep((s) => s + 1)}
                disabled={!canContinue[step]}
                style={{ opacity: canContinue[step] ? 1 : 0.38, cursor: canContinue[step] ? "pointer" : "not-allowed" }}
              >
                {step === 2 ? "View Results →" : "Continue →"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
