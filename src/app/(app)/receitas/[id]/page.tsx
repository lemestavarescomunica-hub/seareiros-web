'use client';
import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Minus, Plus, Clock, Users, Share2, Trash2, Lightbulb, Pencil } from 'lucide-react';
import { useReceitaStore } from '@/stores/receitaStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { escalarReceita, calcularCustoReceita, formatarMoeda, formatarTempo, LABELS_CATEGORIA_RECEITA, abrirWhatsApp } from '@/lib/utils';
import toast from 'react-hot-toast';

const CORES_CAT: Record<string, string> = {
  sopa_semanal: '#5B8C5A', caldos: '#4682B4', prato_principal: '#D4764E',
  lanche: '#E8C547', sobremesa: '#BC8F8F', almoco_trabalhadores: '#708090', outros: '#7A6B6B',
};

export default function ReceitaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getReceita, deleteReceita } = useReceitaStore();
  const router = useRouter();
  const receita = getReceita(id);
  const [porcoes, setPorcoes] = useState(receita?.rendimento_base || 50);

  const ingredientes = useMemo(() => {
    if (!receita?.ingredientes) return [];
    return escalarReceita(receita.ingredientes, receita.rendimento_base, porcoes);
  }, [receita, porcoes]);

  const custo = useMemo(() => {
    if (!receita?.ingredientes) return { total: 0, porPorcao: 0 };
    return calcularCustoReceita(receita.ingredientes, receita.rendimento_base, porcoes);
  }, [receita, porcoes]);

  if (!receita) return <div className="p-8 text-center text-[#7A6B6B]">Receita não encontrada.</div>;

  const cor = CORES_CAT[receita.categoria] || '#7A6B6B';
  const passos = receita.modo_preparo?.split('\n').filter(p => p.trim()) || [];

  function handleDelete() {
    if (!confirm(`Excluir "${receita!.nome}"?`)) return;
    deleteReceita(id);
    toast.success('Receita excluída.');
    router.push('/receitas');
  }

  return (
    <div className="space-y-5 animate-in">
      <PageHeader
        title={receita.nome}
        subtitle={LABELS_CATEGORIA_RECEITA[receita.categoria]}
        backHref="/receitas"
        action={
          <div className="flex gap-2">
            <button onClick={() => router.push(`/receitas/${id}/editar`)}
              className="w-9 h-9 rounded-xl bg-white border border-[#E8DDD5] shadow-sm flex items-center justify-center text-[#7A6B6B] hover:bg-orange-50 hover:text-[#D4764E] transition-colors">
              <Pencil size={16} />
            </button>
            <button onClick={() => abrirWhatsApp(`🍲 *${receita.nome}*\n\n*Ingredientes para ${porcoes} ${receita.unidade_rendimento}:*\n` + ingredientes.map(i => `• ${i.produto?.nome}: ${i.quantidadeEscalada} ${i.unidade_medida}`).join('\n') + `\n\n_Gerado pelo app Seareiros_ 🙏`)}
              className="w-9 h-9 rounded-xl bg-white border border-[#E8DDD5] shadow-sm flex items-center justify-center text-[#5B8C5A] hover:bg-green-50 transition-colors">
              <Share2 size={16} />
            </button>
            <button onClick={handleDelete} className="w-9 h-9 rounded-xl bg-white border border-[#E8DDD5] shadow-sm flex items-center justify-center text-[#7A6B6B] hover:bg-red-50 hover:text-red-500 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        }
      />

      {/* Escalador de porções */}
      <div className="bg-orange-50 rounded-2xl border border-orange-100 p-5">
        <p className="font-bold text-[#3B2F2F] text-center mb-4">Ajustar Porções</p>
        <div className="flex items-center justify-center gap-3 mb-5">
          <button onClick={() => setPorcoes(Math.max(1, porcoes - 10))} className="w-10 h-10 rounded-xl bg-white border border-[#E8DDD5] shadow-sm flex items-center justify-center font-bold text-[#7A6B6B] hover:border-[#D4764E] hover:text-[#D4764E] transition-colors text-sm">-10</button>
          <button onClick={() => setPorcoes(Math.max(1, porcoes - 1))} className="w-10 h-10 rounded-xl bg-white border border-[#E8DDD5] shadow-sm flex items-center justify-center text-[#7A6B6B] hover:border-[#D4764E] hover:text-[#D4764E] transition-colors"><Minus size={16} /></button>
          <div className="text-center w-20">
            <div className="text-4xl font-bold text-[#D4764E]">{porcoes}</div>
            <div className="text-xs text-[#7A6B6B]">{receita.unidade_rendimento}</div>
          </div>
          <button onClick={() => setPorcoes(porcoes + 1)} className="w-10 h-10 rounded-xl bg-white border border-[#E8DDD5] shadow-sm flex items-center justify-center text-[#7A6B6B] hover:border-[#D4764E] hover:text-[#D4764E] transition-colors"><Plus size={16} /></button>
          <button onClick={() => setPorcoes(porcoes + 10)} className="w-10 h-10 rounded-xl bg-white border border-[#E8DDD5] shadow-sm flex items-center justify-center font-bold text-[#7A6B6B] hover:border-[#D4764E] hover:text-[#D4764E] transition-colors text-sm">+10</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 text-center border border-orange-100">
            <p className="text-xs text-[#7A6B6B] mb-1">Custo Total</p>
            <p className="text-lg font-bold text-[#D4764E]">{formatarMoeda(custo.total)}</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-orange-100">
            <p className="text-xs text-[#7A6B6B] mb-1">Por Porção</p>
            <p className="text-lg font-bold text-[#5B8C5A]">{formatarMoeda(custo.porPorcao)}</p>
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 items-center">
        <StatusBadge label={LABELS_CATEGORIA_RECEITA[receita.categoria]} color={cor} />
        {receita.tempo_preparo_minutos && <span className="flex items-center gap-1 text-xs text-[#7A6B6B]"><Clock size={12} />{formatarTempo(receita.tempo_preparo_minutos)}</span>}
        <span className="flex items-center gap-1 text-xs text-[#7A6B6B]"><Users size={12} />Base: {receita.rendimento_base} {receita.unidade_rendimento}</span>
      </div>

      {/* Ingredientes */}
      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-orange-50">
          <p className="font-bold text-[#3B2F2F]">Ingredientes para {porcoes} {receita.unidade_rendimento}</p>
        </div>
        {ingredientes.map((ing, idx) => (
          <div key={ing.id} className={`flex items-center px-5 py-3 gap-3 ${idx % 2 === 0 ? 'bg-white' : 'bg-orange-50/40'}`}>
            <span className="flex-1 text-sm text-[#3B2F2F] font-medium">{ing.produto?.nome || 'Produto'}</span>
            <span className="text-sm font-semibold text-[#7A6B6B]">{ing.quantidadeEscalada} {ing.unidade_medida}</span>
            {ing.custoEstimado > 0 && <span className="text-xs text-[#D4764E] font-semibold w-16 text-right">{formatarMoeda(ing.custoEstimado)}</span>}
          </div>
        ))}
      </div>

      {/* Modo de preparo */}
      {passos.length > 0 && (
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5">
          <p className="font-bold text-[#3B2F2F] mb-4">Modo de Preparo</p>
          <div className="space-y-4">
            {passos.map((passo, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#D4764E] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">{idx + 1}</span>
                </div>
                <p className="text-sm text-[#3B2F2F] leading-relaxed">{passo.replace(/^\d+\.\s*/, '')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observações */}
      {receita.observacoes && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 flex gap-3">
          <Lightbulb size={18} className="text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[#3B2F2F] text-sm mb-1">Dicas e Observações</p>
            <p className="text-sm text-[#3B2F2F] leading-relaxed">{receita.observacoes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
