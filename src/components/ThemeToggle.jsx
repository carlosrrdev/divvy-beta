export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 !h-8 !px-3 rounded-full !text-xs !font-semibold
        !bg-gray-100 !border-gray-200 !text-gray-500 hover:!bg-gray-200
        dark:!bg-white/[0.07] dark:!border-white/[0.12] dark:!text-[#7a8ba8] dark:hover:!bg-white/[0.12]
        transition-colors"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="text-sm leading-none">{isDark ? '☀️' : '🌙'}</span>
      <span>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}