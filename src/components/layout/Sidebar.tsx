'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CookingPot, CalendarHeart, Users, ShoppingCart, Warehouse, Settings, Tag, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { iniciais } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/receitas', label: 'Receitas', icon: CookingPot },
  { href: '/eventos', label: 'Eventos', icon: CalendarHeart },
  { href: '/equipe', label: 'Equipe', icon: Users },
  { href: '/produtos', label: 'Produtos', icon: ShoppingCart },
  { href: '/estoque', label: 'Estoque', icon: Warehouse },
  { href: '/vendas', label: 'Itens à Venda', icon: Tag },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-primary-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <CookingPot size={20} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-primary text-lg leading-tight">Seareiros</div>
            <div className="text-xs text-text-secondary">Gestão da Cozinha</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                active
                  ? 'bg-primary text-white shadow-card'
                  : 'text-text-secondary hover:bg-primary-50 hover:text-primary'
              }`}
            >
              <item.icon size={18} strokeWidth={active ? 2.5 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Usuário */}
      {user && (
        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold text-sm">
              {iniciais(user.nome)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-text-primary truncate">{user.nome}</div>
              <div className="text-xs text-text-secondary">{user.role === 'admin' ? 'Administrador' : 'Leitor'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:text-error hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
