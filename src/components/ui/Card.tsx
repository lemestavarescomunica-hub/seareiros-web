interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hover?: boolean;
}

export function Card({ children, onClick, className = '', hover = false }: CardProps) {
  const base = `bg-white rounded-2xl border border-orange-100 ${className}`;
  const shadow = 'shadow-sm hover:shadow-md transition-shadow';
  if (onClick) {
    return (
      <button onClick={onClick} className={`${base} ${shadow} text-left w-full cursor-pointer active:scale-[0.99] transition-transform`}>
        {children}
      </button>
    );
  }
  return <div className={`${base} ${hover ? shadow + ' cursor-pointer active:scale-[0.99]' : 'shadow-sm'}`}>{children}</div>;
}
