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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 z-50" style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' }}>
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(tab => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1 transition-colors ${
                active ? 'text-[#D4764E]' : 'text-[#7A6B6B] hover:text-[#D4764E]'
              }`}
            >
              <tab.icon size={22} strokeWidth={active ? 2.5 : 1.5} />
              <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
