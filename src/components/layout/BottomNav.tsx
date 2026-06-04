'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CookingPot, CalendarHeart, Users, MoreHorizontal } from 'lucide-react';

const tabs = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/receitas', label: 'Receitas', icon: CookingPot },
  { href: '/eventos', label: 'Eventos', icon: CalendarHeart },
  { href: '/equipe', label: 'Equipe', icon: Users },
  { href: '/mais', label: 'Mais', icon: MoreHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border shadow-card z-40">
      <div className="flex justify-around items-center h-16">
        {tabs.map(tab => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full text-xs transition-colors ${
                active ? 'text-primary font-bold' : 'text-text-secondary'
              }`}
            >
              <tab.icon size={22} strokeWidth={active ? 2.5 : 1.5} />
              <span style={{ fontFamily: 'Nunito, sans-serif' }}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
