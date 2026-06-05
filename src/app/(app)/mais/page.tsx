'use client';
import Link from 'next/link';
import { ShoppingCart, Warehouse, Tag, Settings, LogOut, ChevronRight, TrendingUp, Scale } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const MENU = [
  { href: '/produtos', icon: ShoppingCart, label: 'Produtos e Preços', sub: 'Gerenciar ingredientes e preços', color: '#D4764E' },
  { href: '/precos/evolucao', icon: TrendingUp, label: 'Evolução de Preços', sub: 'Histórico de preços por produto', color: '#E8C547' },
  { href: '/cotacoes', icon: Scale, label: 'Cotação de Preços', sub: 'Compare preços entre fornecedores', color: '#4682B4' },
  { href: '/estoque', icon: Warehouse, label: 'Controle de Estoque', sub: 'Sopa semanal e limpeza', color: '#5B8C5A' },
  { href: '/vendas', icon: Tag, label: 'Itens à Venda', sub: 'Visão geral de arrecadação', color: '#E8C547' },
  { href: '/configuracoes', icon: Settings, label: 'Configurações', sub: 'Sobre o app', color: '#7A6B6B' },
];

export default function MaisPage() {
  const { data: session } = useSession();
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: false });
    toast.success('Até logo! 🙏');
    router.push('/login');
  }

  return (
    <div className="space-y-5 animate-in">
      <h1 className="text-2xl font-bold text-text-primary">Mais</h1>
      {session?.user && (
        <Card className="p-4 flex items-center gap-4">
          <Avatar nome={session.user.name || 'U'} size={52} fotoUrl={session.user.image} />
          <div className="flex-1">
            <p className="font-bold text-text-primary">{session.user.name}</p>
            <p className="text-xs text-text-secondary">{(session.user as any).role === 'ADMIN' ? 'Administrador' : 'Leitor'}</p>
          </div>
        </Card>
      )}
      <Card className="overflow-hidden divide-y divide-border">
        {MENU.map(item => (
          <Link key={item.href} href={item.href} className="flex items-center gap-4 px-4 py-3.5 hover:bg-primary-50 transition-colors">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: item.color + '20' }}>
              <item.icon size={20} style={{ color: item.color }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-text-primary text-sm">{item.label}</p>
              <p className="text-xs text-text-secondary">{item.sub}</p>
            </div>
            <ChevronRight size={16} className="text-border" />
          </Link>
        ))}
      </Card>
      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 border border-error/40 text-error rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
        <LogOut size={16} /> Sair
      </button>
      <p className="text-center text-xs text-text-secondary pb-4">Seareiros v1.0.0 · Grupo Espírita Seareiros do Bem<br />Aparecida de Goiânia/GO 🙏</p>
    </div>
  );
}
