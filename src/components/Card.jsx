/**
 * Shared card surface.
 *
 * variant:
 *   "default" — white/frosted glass
 *   "accent"  — tinted with accent color (totals, share panel)
 *   "warn"    — amber warning tint
 *   "dashed"  — dashed accent border (share card)
 */
export default function Card({ variant = 'default', className = '', children, ...rest }) {
  const base = 'rounded-2xl border transition-colors duration-200';

  const variants = {
    default:
      'bg-white border-black/[0.07] shadow-card ' +
      'dark:bg-white/[0.04] dark:border-white/[0.09] dark:shadow-card-dark dark:backdrop-blur-xl',
    accent:
      'bg-accent-dim border-accent-border ' +
      'dark:backdrop-blur-xl',
    warn:
      'bg-[var(--yellow-dim)] border-[var(--yellow-border)]',
    dashed:
      'border-dashed border-accent-border bg-accent-dim ' +
      'dark:backdrop-blur-xl',
  };

  return (
    <div className={`${base} ${variants[variant] ?? variants.default} ${className}`} {...rest}>
      {children}
    </div>
  );
}