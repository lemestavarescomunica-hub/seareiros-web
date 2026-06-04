'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, CookingPot, Clock, Users } from 'lucide-react';
import { useReceitaStore } from '@/stores/receitaStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LABELS_CATEGORIA_RECEITA, calcularCustoReceita, formatarMoeda, formatarTempo } from '@/lib/utils';

const CORES_CAT: Record<string, string> = {
  sopa_semanal: '#5B8C5A', caldos: '#4682B4', prato_principal: '#D4764E',
  lanche: '#E8C547', sobremesa: '#BC8F8F', almoco_trabalhadores: '#708090', outros: '#7A6B6B',
};
const CATEGORIAS = ['todas', 'sopa_semanal', 'caldos', 'prato_principal', 'lanche', 'sobremesa', 'almoco_trabalhadores', 'outros'];

export default function ReceitasPage() {
  const { receitas } = useReceitaStore();
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('todas');

  const filtradas = useMemo(() => receitas.filter(r => {
    const ok = !busca || r.nome.toLowerCase().includes(busca.toLowerCase());
    const cat = categoria === 'todas' || r.categoria === categoria;
    return ok && cat;
  }), [receitas, busca, categoria]);

  return (
    <div className="space-y-5 animate-in">
      <PageHeader
        title="Receitas"
        subtitle={`${receitas.length} receitas cadastradas`}
        action={
          <Link href="/receitas/nova" className="flex items-center gap-2 bg-[#D4764E] hover:bg-[#B85A35] text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm">
            <Plus size={16} /> Nova Receita
          </Link>
        }
      />

      {/* Busca */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A6B6B]" />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar receita..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8DDD5] rounded-xl text-sm text-[#3B2F2F] placeholder:text-[#7A6B6B] focus:ring-2 focus:ring-[#D4764E] outline-none shadow-sm"
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        {CATEGORIAS.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              categoria === cat
                ? 'bg-[#D4764E] text-white border-[#D4764E]'
                : 'bg-white text-[#7A6B6B] border-[#E8DDD5] hover:border-[#D4764E] hover:text-[#D4764E]'
            }`}
          >
            {cat === 'todas' ? 'Todas' : LABELS_CATEGORIA_RECEITA[cat]}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <EmptyState icon={CookingPot} title="Nenhuma receita encontrada" subtitle={busca ? 'Tente outro termo de busca.' : 'Que tal começar pelo caldo de feijão? 🍲'} />
      ) : (
        <div className="space-y-3">
          {filtradas.map(r => {
            const custo = r.ingredientes ? calcularCustoReceita(r.ingredientes, r.rendimento_base, r.rendimento_base) : { porPorcao: 0 };
            const cor = CORES_CAT[r.categoria] || '#7A6B6B';
            return (
              <Link key={r.id} href={`/receitas/${r.id}`}>
                <div className="bg-white rounded-2xl border border-orange-100 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow active:scale-[0.99]">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: cor + '20' }}>
                    <CookingPot size={28} style={{ color: cor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#3B2F2F] truncate">{r.nome}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <StatusBadge label={LABELS_CATEGORIA_RECEITA[r.categoria]} color={cor} size="sm" />
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-[#7A6B6B] flex-wrap">
                      <span className="flex items-center gap-1"><Users size={12} />{r.rendimento_base} {r.unidade_rendimento}</span>
                      {r.tempo_preparo_minutos && <span className="flex items-center gap-1"><Clock size={12} />{formatarTempo(r.tempo_preparo_minutos)}</span>}
                      {custo.porPorcao > 0 && <span className="font-semibold text-[#D4764E]">{formatarMoeda(custo.porPorcao)}/porção</span>}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
