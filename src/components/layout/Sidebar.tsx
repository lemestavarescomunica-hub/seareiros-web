'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, CookingPot, CalendarHeart, Users, ShoppingCart, Warehouse, Settings, Tag, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
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
      <div className="p-6 border-b border-orange-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D4764E] flex items-center justify-center">
            <CookingPot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-[#3B2F2F] text-sm">Seareiros</h1>
            <p className="text-[10px] text-[#7A6B6B]">Gestão da Cozinha</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-orange-100 text-[#D4764E] font-bold'
                  : 'text-[#7A6B6B] hover:bg-orange-50 hover:text-[#3B2F2F]'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Usuário */}
      {user && (
        <div className="p-4 border-t border-orange-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-[#D4764E]">
              {iniciais(user.nome)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#3B2F2F] truncate">{user.nome}</p>
              <p className="text-[10px] text-[#7A6B6B]">{user.role === 'admin' ? 'Administrador' : 'Leitor'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#7A6B6B] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
      )}
    </div>
  );
}
