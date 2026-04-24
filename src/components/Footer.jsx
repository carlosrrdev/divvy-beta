export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-white/[0.07] py-5 text-center relative z-10">
      <p className="text-xs text-gray-500 dark:text-[#3f4e66] tracking-wide">
        100% vibe-coded by{' '}
        <span className="text-accent font-semibold">Claude</span>
        <span className="mx-2 opacity-30">·</span>
        Not a single human keystroke was harmed in the making of this app.
      </p>
    </footer>
  );
}