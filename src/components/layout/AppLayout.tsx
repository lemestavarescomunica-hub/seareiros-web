'use client';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useReceitaStore } from '@/stores/receitaStore';
import { useProdutoStore } from '@/stores/produtoStore';
import { useEventoStore } from '@/stores/eventoStore';
import { useVoluntarioStore } from '@/stores/voluntarioStore';
import { useEstoqueStore } from '@/stores/estoqueStore';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const fetchReceitas   = useReceitaStore(s => s.fetchReceitas);
  const fetchProdutos   = useProdutoStore(s => s.fetchProdutos);
  const fetchEventos    = useEventoStore(s => s.fetchEventos);
  const fetchVoluntarios = useVoluntarioStore(s => s.fetchVoluntarios);
  const fetchEstoque    = useEstoqueStore(s => s.fetchEstoque);

  useEffect(() => {
    fetchReceitas();
    fetchProdutos();
    fetchEventos();
    fetchVoluntarios();
    fetchEstoque();
  }, [fetchReceitas, fetchProdutos, fetchEventos, fetchVoluntarios, fetchEstoque]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9F2' }}>
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 flex-col bg-white border-r border-orange-100 z-40" style={{ boxShadow: '0 0 12px rgba(0,0,0,0.04)' }}>
        <Sidebar />
      </aside>

      {/* Conteúdo principal */}
      <main className="lg:ml-60 pb-24 lg:pb-8 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Bottom nav — mobile */}
      <BottomNav />
    </div>
  );
}
