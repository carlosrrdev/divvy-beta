const STEPS = ['Participants', 'Expenses', 'Assign', 'Results'];

export default function StepIndicator({ step, onStepClick }) {
  return (
    <div className="flex gap-1.5 mb-9">
      {STEPS.map((name, i) => {
        const done   = i < step;
        const active = i === step;

        // Derive colors from CSS vars so they respond to theme switches
        const barColor = active
          ? 'var(--accent)'
          : done
          ? 'var(--accent-border)'
          : 'var(--step-inactive, rgba(0,0,0,0.08))';

        const labelColor = active
          ? 'var(--accent)'
          : done
          ? 'var(--accent-border)'
          : undefined; // falls back to Tailwind class below

        return (
          <div
            key={i}
            className={`flex-1 ${done ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={() => done && onStepClick(i)}
          >
            <div
              className="h-[3px] rounded-full mb-1.5 transition-all duration-300"
              style={{ background: barColor }}
            />
            <span
              className={[
                'text-[9.5px] font-bold tracking-[0.08em] uppercase transition-colors duration-200',
                !active && !done ? 'text-gray-400 dark:text-[#3f4e66]' : '',
              ].join(' ')}
              style={labelColor ? { color: labelColor } : undefined}
            >
              {i + 1}. {name}
            </span>
          </div>
        );
      })}
    </div>
  );
}