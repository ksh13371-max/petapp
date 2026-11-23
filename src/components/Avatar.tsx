export function Avatar({
  color = "#f4d9c6",
  size = 48,
  label,
  className = "",
}: {
  color?: string;
  size?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`shrink-0 rounded-full flex items-center justify-center font-bold text-white/90 ${className}`}
      style={{ width: size, height: size, background: color, fontSize: size * 0.4 }}
    >
      {label ? label.slice(0, 1) : null}
    </div>
  );
}

export function PawAvatar({ color = "#f4d9c6", size = 48 }: { color?: string; size?: number }) {
  return (
    <div
      className="shrink-0 rounded-full flex items-center justify-center"
      style={{ width: size, height: size, background: color }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="rgba(255,255,255,0.85)">
        <circle cx="5.5" cy="9" r="2.3" />
        <circle cx="10.5" cy="5.5" r="2.3" />
        <circle cx="15.5" cy="5.5" r="2.3" />
        <circle cx="19" cy="10.5" r="2.1" />
        <path d="M12 11.2c-3 0-6.2 2.3-6.2 5.3 0 1.9 1.6 3.3 3.6 3.3 1.1 0 1.8-.4 2.6-.4s1.5.4 2.6.4c2 0 3.6-1.4 3.6-3.3 0-3-3.2-5.3-6.2-5.3z" />
      </svg>
    </div>
  );
}
