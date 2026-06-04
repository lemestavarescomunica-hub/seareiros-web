'use client';
import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Minus, Plus, DollarSign, Clock, Users, Share2, Trash2, Lightbulb } from 'lucide-react';
import { useReceitaStore } from '@/stores/receitaStore';
import { Card } from '@/components/ui/Card';
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

  if (!receita) return <div className="p-8 text-center text-text-secondary">Receita não encontrada.</div>;

  const cor = CORES_CAT[receita.categoria] || '#7A6B6B';
  const passos = receita.modo_preparo?.split('\n').filter(p => p.trim()) || [];

  function handleDelete() {
    if (!confirm(`Excluir "${receita!.nome}"? Esta ação não pode ser desfeita.`)) return;
    deleteReceita(id);
    toast.success('Receita excluída.');
    router.push('/receitas');
  }

  function handleShare() {
    const texto = `🍲 *${receita!.nome}*\n\n*Ingredientes para ${porcoes} ${receita!.unidade_rendimento}:*\n` +
      ingredientes.map(i => `• ${i.produto?.nome}: ${i.quantidadeEscalada} ${i.unidade_medida}`).join('\n') +
      (receita!.modo_preparo ? `\n\n*Preparo:*\n${receita!.modo_preparo}` : '') +
      `\n\n_Gerado pelo app Seareiros_ 🙏`;
    abrirWhatsApp(texto);
  }

  return (
    <div className="space-y-5 animate-in">
      <PageHeader
        title={receita.nome}
        subtitle={LABELS_CATEGORIA_RECEITA[receita.categoria]}
        backHref="/receitas"
        action={
          <div className="flex gap-2">
            <button onClick={handleShare} className="p-2 rounded-xl border border-border hover:bg-secondary-50 text-secondary transition-colors" title="Compartilhar WhatsApp">
              <Share2 size={18} />
            </button>
            <button onClick={handleDelete} className="p-2 rounded-xl border border-border hover:bg-red-50 text-error transition-colors" title="Excluir">
              <Trash2 size={18} />
            </button>
          </div>
        }
      />

      {/* Escalador de porções */}
      <Card className="p-5">
        <h3 className="font-bold text-text-primary text-center mb-4">Ajustar Porções</h3>
        <div className="flex items-center justify-center gap-3 mb-4">
          <button onClick={() => setPorcoes(Math.max(1, porcoes - 10))} className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-primary-50 hover:border-primary transition-colors font-bold text-text-secondary">-10</button>
          <button onClick={() => setPorcoes(Math.max(1, porcoes - 1))} className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-primary-50 hover:border-primary transition-colors">
            <Minus size={16} />
          </button>
          <div className="text-center min-w-[80px]">
            <div className="text-4xl font-bold text-primary">{porcoes}</div>
            <div className="text-xs text-text-secondary">{receita.unidade_rendimento}</div>
          </div>
          <button onClick={() => setPorcoes(porcoes + 1)} className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-primary-50 hover:border-primary transition-colors">
            <Plus size={16} />
          </button>
          <button onClick={() => setPorcoes(porcoes + 10)} className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-primary-50 hover:border-primary transition-colors font-bold text-text-secondary">+10</button>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="flex flex-col items-center gap-1">
            <DollarSign size={18} className="text-primary" />
            <span className="text-xs text-text-secondary">Total</span>
            <span className="text-lg font-bold text-primary">{formatarMoeda(custo.total)}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users size={18} className="text-secondary" />
            <span className="text-xs text-text-secondary">Por porção</span>
            <span className="text-lg font-bold text-secondary">{formatarMoeda(custo.porPorcao)}</span>
          </div>
        </div>
      </Card>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 items-center">
        <StatusBadge label={LABELS_CATEGORIA_RECEITA[receita.categoria]} color={cor} />
        {receita.tempo_preparo_minutos && (
          <span className="text-xs text-text-secondary flex items-center gap-1"><Clock size={12} />{formatarTempo(receita.tempo_preparo_minutos)}</span>
        )}
        <span className="text-xs text-text-secondary flex items-center gap-1"><Users size={12} />Base: {receita.rendimento_base} {receita.unidade_rendimento}</span>
      </div>

      {/* Ingredientes */}
      <Card className="p-5">
        <h3 className="font-bold text-text-primary mb-3">Ingredientes ({porcoes} {receita.unidade_rendimento})</h3>
        <div className="divide-y divide-border">
          {ingredientes.map(ing => (
            <div key={ing.id} className="flex items-center py-2.5 gap-3">
              <span className="flex-1 text-sm text-text-primary">{ing.produto?.nome || 'Produto'}</span>
              <span className="text-sm font-semibold text-text-secondary">{ing.quantidadeEscalada} {ing.unidade_medida}</span>
              {ing.custoEstimado > 0 && <span className="text-xs text-primary font-semibold w-16 text-right">{formatarMoeda(ing.custoEstimado)}</span>}
            </div>
          ))}
        </div>
      </Card>

      {/* Modo de preparo */}
      {passos.length > 0 && (
        <Card className="p-5">
          <h3 className="font-bold text-text-primary mb-3">Modo de Preparo</h3>
          <div className="space-y-3">
            {passos.map((passo, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">{idx + 1}</span>
                </div>
                <p className="text-sm text-text-primary">{passo.replace(/^\d+\.\s*/, '')}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Observações */}
      {receita.observacoes && (
        <div className="p-4 rounded-card border border-accent/40 bg-accent/10 flex gap-3">
          <Lightbulb size={18} className="text-accent-dark shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-text-primary text-sm mb-1">Dicas e Observações</p>
            <p className="text-sm text-text-primary">{receita.observacoes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
