interface StatusBadgeProps {
  label: string;
  color: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ label, color, size = 'md' }: StatusBadgeProps) {
  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${pad}`}
      style={{ color, backgroundColor: color + '20', border: `1px solid ${color}30` }}
    >
      {label}
    </span>
  );
}
