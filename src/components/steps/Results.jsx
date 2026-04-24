import { useState } from 'react';
import Card from '../Card';
import BounceIn from '../BounceIn';
import { Avatar } from './Participants';
import { fmt, buildShareText, avatarColors } from '../../lib/utils';

export default function Results({ participants, expenses, assignments, totals, lineItems, totalBill, theme, onStartOver }) {
  const [copied, setCopied] = useState(false);
  const unassigned = expenses.filter((e) => !(assignments[e.id] ?? []).length);

  function handleCopy() {
    navigator.clipboard.writeText(buildShareText(participants, expenses, assignments)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="flex flex-col gap-3.5">
      {/* ── Summary metrics ── */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Total Bill',   value: fmt(totalBill), hi: true },
          { label: 'Participants', value: String(participants.length) },
          { label: 'Expenses',     value: String(expenses.length) },
        ].map(({ label, value, hi }) => (
          <Card key={label} variant={hi ? 'accent' : 'default'} className="p-4">
            <div
              className="text-[10px] font-bold tracking-[0.09em] uppercase mb-1"
              style={{ color: hi ? 'var(--accent)' : undefined }}
              {...(!hi ? { className: 'text-[10px] font-bold tracking-[0.09em] uppercase mb-1 text-gray-400 dark:text-[#3f4e66]' } : {})}
            >
              {label}
            </div>
            <div className="font-mono font-extrabold text-lg text-gray-900 dark:text-[#dde4f2]">
              {value}
            </div>
          </Card>
        ))}
      </div>

      {/* ── Per-person breakdown ── */}
      {[...participants]
        .sort((a, b) => (totals[b.id] ?? 0) - (totals[a.id] ?? 0))
        .map((p) => {
          const pItems = lineItems[p.id] ?? [];
          const colors = avatarColors(p.paletteIndex, theme);
          return (
            <BounceIn key={p.id}>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-0">
                  <div className="flex items-center gap-2.5">
                    <Avatar colors={colors} name={p.name} />
                    <span className="font-semibold text-[15px] text-gray-900 dark:text-[#dde4f2]">
                      {p.name}
                    </span>
                  </div>
                  <span
                    className="font-mono font-extrabold text-xl"
                    style={{ color: colors.text }}
                  >
                    {fmt(totals[p.id] ?? 0)}
                  </span>
                </div>

                {pItems.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.07] flex flex-col gap-1.5">
                    {pItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-[13px]">
                        <span className="text-gray-500 dark:text-[#7a8ba8]">{item.expName}</span>
                        <span className="font-mono text-[12px] text-gray-400 dark:text-[#3f4e66]">
                          {fmt(item.expTotal)}
                          {item.splitAmong > 1 && ` ÷ ${item.splitAmong}`}
                          {' = '}
                          <span className="text-gray-900 dark:text-[#dde4f2] font-bold">
                            {fmt(item.share)}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {pItems.length === 0 && (
                  <p className="mt-2 text-xs text-gray-400 dark:text-[#3f4e66]">
                    Not assigned to any expenses.
                  </p>
                )}
              </Card>
            </BounceIn>
          );
        })}

      {/* ── Unassigned warning ── */}
      {unassigned.length > 0 && (
        <div
          className="rounded-xl px-4 py-3.5 text-sm border"
          style={{ background: 'var(--yellow-dim)', borderColor: 'var(--yellow-border)', color: 'var(--yellow)' }}
        >
          ⚠ <strong>{unassigned.length} unassigned expense{unassigned.length > 1 ? 's' : ''}:</strong>{' '}
          {unassigned.map((e) => e.name).join(', ')} — go back to Assign to include them.
        </div>
      )}

      {/* ── Share card ── */}
      <Card variant="dashed" className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-[#dde4f2]">Share results</p>
            <p className="text-xs text-gray-500 dark:text-[#7a8ba8] mt-0.5">
              Copy a text summary to paste in any chat.
            </p>
          </div>
          <button
            onClick={handleCopy}
            style={copied ? { background: 'var(--accent-dim)', borderColor: 'var(--accent-border)', color: 'var(--accent)' } : {}}
          >
            {copied ? '✓ Copied!' : 'Copy text'}
          </button>
        </div>
        <pre
          className="rounded-lg p-3 text-[11.5px] leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-52 font-mono text-gray-500 dark:text-[#7a8ba8] border border-gray-100 dark:border-white/[0.07]"
          style={{ background: 'var(--pre-bg)' }}
        >
          {buildShareText(participants, expenses, assignments)}
        </pre>
      </Card>

      {/* ── Start over ── */}
      <button
        onClick={onStartOver}
        className="w-full !h-auto !py-3 !bg-transparent !border-gray-200 dark:!border-white/[0.09] !text-gray-400 dark:!text-[#3f4e66] !text-sm !font-medium !rounded-xl"
      >
        ↺ Start over
      </button>
    </div>
  );
}