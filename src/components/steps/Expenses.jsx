import { useState } from 'react';
import Card from '../Card';
import BounceIn from '../BounceIn';
import { fmt } from '../../lib/utils';
import { RemoveButton } from './Participants';

export default function Expenses({ expenses, onAdd, onRemove }) {
  const [name, setName]   = useState('');
  const [amount, setAmount] = useState('');

  function handleAdd() {
    const n = name.trim();
    const a = parseFloat(amount);
    if (!n || isNaN(a) || a <= 0) return;
    onAdd(n, a);
    setName('');
    setAmount('');
  }

  const totalBill = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Input card */}
      <Card className="p-5">
        <label className="block text-[10.5px] font-bold tracking-[0.09em] uppercase text-gray-400 dark:text-[#3f4e66] mb-2">
          Add expense
        </label>
        <div className="flex gap-2.5">
          <input
            className="flex-[2]"
            placeholder="Description…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && document.getElementById('amt-input')?.focus()}
            autoFocus
          />
          <input
            id="amt-input"
            className="flex-1"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="$ Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd}>Add</button>
        </div>
      </Card>

      {/* Empty state */}
      {expenses.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-[#3f4e66]">
          <div className="text-4xl mb-3 opacity-30">🧾</div>
          <p className="text-sm">No expenses yet. Add at least one to continue.</p>
        </div>
      )}

      {/* Expense rows */}
      {expenses.map((exp) => (
        <BounceIn key={exp.id}>
          <Card className="flex items-center justify-between px-4 py-3">
            <span className="font-medium text-[14.5px] text-gray-900 dark:text-[#dde4f2]">
              {exp.name}
            </span>
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-bold text-sm text-accent">{fmt(exp.amount)}</span>
              <RemoveButton onClick={() => onRemove(exp.id)} />
            </div>
          </Card>
        </BounceIn>
      ))}

      {/* Total row */}
      {expenses.length > 0 && (
        <Card variant="accent" className="flex items-center justify-between px-4 py-3">
          <span className="text-[11.5px] font-bold uppercase tracking-[0.09em] text-accent">
            Total
          </span>
          <span className="font-mono font-extrabold text-lg text-gray-900 dark:text-[#dde4f2]">
            {fmt(totalBill)}
          </span>
        </Card>
      )}
    </div>
  );
}