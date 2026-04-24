import { useState } from 'react';
import Card from '../Card';
import BounceIn from '../BounceIn';
import { initials, avatarColors } from '../../lib/utils';

export default function Participants({ participants, theme, onAdd, onRemove }) {
  const [input, setInput] = useState('');

  function handleAdd() {
    const name = input.trim();
    if (!name) return;
    onAdd(name);
    setInput('');
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* Input card */}
      <Card className="p-5">
        <label className="block text-[10.5px] font-bold tracking-[0.09em] uppercase text-gray-400 dark:text-[#3f4e66] mb-2">
          Add participant
        </label>
        <div className="flex gap-2.5">
          <input
            placeholder="Enter a name…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <button onClick={handleAdd}>Add</button>
        </div>
      </Card>

      {/* Empty state */}
      {participants.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-[#3f4e66]">
          <div className="text-4xl mb-3 opacity-30">👥</div>
          <p className="text-sm">Add at least one participant to get started.</p>
        </div>
      )}

      {/* Participant rows */}
      {participants.map((p) => {
        const c = avatarColors(p.paletteIndex, theme);
        return (
          <BounceIn key={p.id}>
            <Card className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Avatar colors={c} name={p.name} />
                <span className="font-medium text-[14.5px] text-gray-900 dark:text-[#dde4f2]">
                  {p.name}
                </span>
              </div>
              <RemoveButton onClick={() => onRemove(p.id)} />
            </Card>
          </BounceIn>
        );
      })}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────

export function Avatar({ colors, name }) {
  return (
    <div
      className="w-[34px] h-[34px] rounded-full flex-shrink-0 flex items-center justify-center text-[11.5px] font-extrabold tracking-[0.02em]"
      style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
    >
      {initials(name)}
    </div>
  );
}

export function RemoveButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="!bg-transparent !border-transparent !h-auto !p-[0_3px] text-xl leading-none opacity-60 hover:opacity-100 transition-opacity"
      style={{ color: 'var(--red)' }}
    >
      ×
    </button>
  );
}