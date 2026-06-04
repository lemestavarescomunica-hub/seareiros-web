'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, backHref, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link href={backHref} className="w-9 h-9 rounded-xl bg-white border border-orange-100 shadow-sm flex items-center justify-center text-[#7A6B6B] hover:text-[#D4764E] hover:border-orange-200 transition-colors">
            <ArrowLeft size={18} />
          </Link>
        )}
        <div>
          <h1 className="text-xl font-bold text-[#3B2F2F]">{title}</h1>
          {subtitle && <p className="text-sm text-[#7A6B6B] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
