import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-4">
        <Icon size={40} className="text-orange-200" strokeWidth={1} />
      </div>
      <h3 className="text-base font-bold text-[#3B2F2F] mb-2">{title}</h3>
      {subtitle && <p className="text-sm text-[#7A6B6B] max-w-xs">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
