import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { uid, calcResults } from './lib/utils';

import ThemeToggle    from './components/ThemeToggle';
import StepIndicator  from './components/StepIndicator';
import Footer         from './components/Footer';
import Participants   from './components/steps/Participants';
import Expenses       from './components/steps/Expenses';
import Assign         from './components/steps/Assign';
import Results        from './components/steps/Results';

const STEPS = ['Participants', 'Expenses', 'Assign', 'Results'];

export default function App() {
  const { theme, toggleTheme } = useTheme();

  // ── Core data ────────────────────────────────────────────────
  const [step,         setStep]         = useState(0);
  const [participants, setParticipants] = useState([]);
  const [expenses,     setExpenses]     = useState([]);
  const [assignments,  setAssignments]  = useState({});

  // ── Participant handlers ──────────────────────────────────────
  function handleAddParticipant(name) {
    const id = uid();
    setParticipants((prev) => [...prev, { id, name, paletteIndex: prev.length }]);
  }

  function handleRemoveParticipant(id) {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setAssignments((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((eid) => {
        next[eid] = next[eid].filter((pid) => pid !== id);
      });
      return next;
    });
  }

  // ── Expense handlers ──────────────────────────────────────────
  function handleAddExpense(name, amount) {
    const id = uid();
    setExpenses((prev) => [...prev, { id, name, amount }]);
    // Default: assign to all current participants
    setAssignments((prev) => ({ ...prev, [id]: participants.map((p) => p.id) }));
  }

  function handleRemoveExpense(id) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setAssignments((prev) => { const n = { ...prev }; delete n[id]; return n; });
  }

  // ── Assignment handlers ───────────────────────────────────────
  function handleToggle(expenseId, participantId) {
    setAssignments((prev) => {
      const current = prev[expenseId] ?? [];
      const next = current.includes(participantId)
        ? current.filter((id) => id !== participantId)
        : [...current, participantId];
      return { ...prev, [expenseId]: next };
    });
  }

  const handleAssignAll  = (eid) => setAssignments((p) => ({ ...p, [eid]: participants.map((x) => x.id) }));
  const handleAssignNone = (eid) => setAssignments((p) => ({ ...p, [eid]: [] }));

  // ── Start over ────────────────────────────────────────────────
  function handleStartOver() {
    setStep(0);
    setParticipants([]);
    setExpenses([]);
    setAssignments({});
  }

  // ── Computed results (passed to Results step) ─────────────────
  const totalBill = expenses.reduce((s, e) => s + e.amount, 0);
  const { totals, lineItems } = calcResults(participants, expenses, assignments);

  // ── "Continue" gate per step ──────────────────────────────────
  const canContinue = [
    participants.length > 0, // step 0: need at least one participant
    expenses.length > 0,     // step 1: need at least one expense
    true,                    // step 2: always allowed to proceed to results
  ];

  // ── Rendered step ─────────────────────────────────────────────
  const stepViews = [
    <Participants
      participants={participants}
      theme={theme}
      onAdd={handleAddParticipant}
      onRemove={handleRemoveParticipant}
    />,
    <Expenses
      expenses={expenses}
      onAdd={handleAddExpense}
      onRemove={handleRemoveExpense}
    />,
    <Assign
      expenses={expenses}
      participants={participants}
      assignments={assignments}
      onToggle={handleToggle}
      onAssignAll={handleAssignAll}
      onAssignNone={handleAssignNone}
    />,
    <Results
      participants={participants}
      expenses={expenses}
      assignments={assignments}
      totals={totals}
      lineItems={lineItems}
      totalBill={totalBill}
      theme={theme}
      onStartOver={handleStartOver}
    />,
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f8] dark:bg-[#0c0e17] text-gray-900 dark:text-[#dde4f2] transition-colors duration-200">
      {/* Ambient dark-mode glow — purely decorative */}
      <div
        className="fixed inset-0 pointer-events-none z-0 hidden dark:block"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,224,160,0.07) 0%, transparent 70%),' +
            'radial-gradient(ellipse 60% 40% at 85% 90%, rgba(99,102,241,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Main content */}
      <main className="relative z-10 flex-1 w-full max-w-[620px] mx-auto px-4 pt-10 pb-16">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}
            >
              💸
            </div>
            <div>
              <h1 className="text-[20px] font-bold tracking-[-0.02em] leading-tight text-gray-900 dark:text-[#dde4f2]">
                Expense Splitter
              </h1>
              <p className="text-[12.5px] text-gray-500 dark:text-[#7a8ba8] leading-snug">
                Fair splits, even when it's complicated.
              </p>
            </div>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </header>

        {/* Step progress bar */}
        <StepIndicator step={step} onStepClick={setStep} />

        {/* Active step view */}
        {stepViews[step]}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-7">
          <div>
            {step > 0 && step < STEPS.length - 1 && (
              <button onClick={() => setStep((s) => s - 1)}>← Back</button>
            )}
          </div>
          <div>
            {step < STEPS.length - 1 && (
              <button
                disabled={!canContinue[step]}
                onClick={() => canContinue[step] && setStep((s) => s + 1)}
                style={canContinue[step] ? {
                  background:   'var(--accent)',
                  borderColor:  'var(--accent)',
                  color:        theme === 'dark' ? '#001a0f' : '#ffffff',
                  fontWeight:   700,
                } : {}}
              >
                {step === 2 ? 'View Results →' : 'Continue →'}
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}