import Card from '../Card';
import { fmt } from '../../lib/utils';

export default function Assign({ expenses, participants, assignments, onToggle, onAssignAll, onAssignNone }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-500 dark:text-[#7a8ba8] mb-1">
        Select who shares each expense. Costs divide equally among selected people.
      </p>

      {expenses.map((exp) => {
        const assigned = (assignments[exp.id] ?? []).filter((pid) =>
          participants.some((p) => p.id === pid)
        );
        const share = assigned.length > 0 ? exp.amount / assigned.length : null;

        return (
          <Card key={exp.id} className="p-5 overflow-hidden">
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-[14.5px] text-gray-900 dark:text-[#dde4f2]">
                {exp.name}
              </span>
              <div className="flex items-center gap-2">
                <SmallButton onClick={() => onAssignAll(exp.id)}>All</SmallButton>
                <SmallButton onClick={() => onAssignNone(exp.id)}>None</SmallButton>
                <span className="font-mono font-bold text-sm text-accent">{fmt(exp.amount)}</span>
              </div>
            </div>

            {/* Participant chips */}
            <div className="flex flex-wrap gap-1.5">
              {participants.map((p) => (
                <Chip key={p.id} active={assigned.includes(p.id)} onClick={() => onToggle(exp.id, p.id)}>
                  {p.name}
                </Chip>
              ))}
            </div>

            {/* Per-share footer */}
            {share !== null && (
              <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-white/[0.07] text-xs text-gray-500 dark:text-[#7a8ba8]">
                Each pays{' '}
                <span className="font-mono font-bold text-gray-900 dark:text-[#dde4f2]">{fmt(share)}</span>
                {assigned.length > 1 && (
                  <span className="text-gray-400 dark:text-[#3f4e66]"> · split {assigned.length} ways</span>
                )}
              </div>
            )}

            {/* Unassigned warning */}
            {assigned.length === 0 && (
              <div
                className="-mx-5 -mb-5 mt-3 px-5 py-2.5 text-xs border-t"
                style={{
                  background:   'var(--yellow-dim)',
                  borderColor:  'var(--yellow-border)',
                  color:        'var(--yellow)',
                }}
              >
                ⚠ Nobody assigned — this expense won't appear in results.
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ── SmallButton ───────────────────────────────────────────────
function SmallButton({ children, onClick }) {
  return (
    <button onClick={onClick} className="!h-auto !py-[3px] !px-2.5 !text-[11px] !font-medium !rounded-md">
      {children}
    </button>
  );
}

// ── Chip ──────────────────────────────────────────────────────
// Active state uses CSS vars (theme-reactive); inactive uses Tailwind.
function Chip({ active, children, onClick }) {
  return (
    <div
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full',
        'text-[13px] font-medium cursor-pointer select-none transition-all duration-150',
        active
          ? ''
          : 'bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-[#7a8ba8]',
      ].join(' ')}
      style={active ? {
        background: 'var(--accent-dim)',
        color:      'var(--accent)',
        border:     '1px solid var(--accent-border)',
      } : { border: '1px solid transparent' }}
    >
      <div
        className={['w-[7px] h-[7px] rounded-full flex-shrink-0', !active ? 'bg-gray-300 dark:bg-[#3f4e66]' : ''].join(' ')}
        style={active ? { background: 'var(--accent)' } : {}}
      />
      {children}
    </div>
  );
}