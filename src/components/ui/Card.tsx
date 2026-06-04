import { cn } from '@/lib/cn';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hover?: boolean;
}

export function Card({ children, onClick, className, hover = false }: CardProps) {
  const base = 'bg-surface rounded-card shadow-card overflow-hidden';
  const interactive = onClick || hover ? 'cursor-pointer transition hover:shadow-card-hover hover:-translate-y-px' : '';
  if (onClick) {
    return <button onClick={onClick} className={cn(base, interactive, 'text-left w-full', className)}>{children}</button>;
  }
  return <div className={cn(base, interactive, className)}>{children}</div>;
}
