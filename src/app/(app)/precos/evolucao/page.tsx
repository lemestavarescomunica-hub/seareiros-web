'use client';
import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Search } from 'lucide-react';
import { usePrecosStore } from '@/stores/precosStore';
import { useProdutoStore } from '@/stores/produtoStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatarMoeda } from '@/lib/utils';
import type { Produto } from '@/types';

function SparkLine({ dados }: { dados: { preco: number }[] }) {
  if (dados.length < 2) return null;
  const precos = dados.map(d => d.preco);
  const min = Math.min(...precos);
  const max = Math.max(...precos);
  const range = max - min || 1;
  const W = 300; const H = 64; const PAD = 8;
  const pts = dados.map((d, i) => {
    const x = PAD + (i / (dados.length - 1)) * (W - 2 * PAD);
    const y = H - PAD - ((d.preco - min) / range) * (H - 2 * PAD);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16">
      <polyline points={pts} fill="none" stroke="#D4764E" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {dados.map((d, i) => {
        const x = PAD + (i / (dados.length - 1)) * (W - 2 * PAD);
        const y = H - PAD - ((d.preco - min) / range) * (H - 2 * PAD);
        return <circle key={i} cx={x} cy={y} r="3" fill="#D4764E" />;
      })}
    </svg>
  );
}

export default function EvolucaoPrecosPage() {
  const { produtos } = useProdutoStore();
  const { getHistoricoProduto, calcularTendencia } = usePrecosStore();
  const [busca, setBusca] = useState('');
  const [prodSel, setProdSel] = useState<Produto | null>(null);
  const [showDrop, setShowDrop] = useState(false);

  const produtosFiltrados = useMemo(
    () => produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 8),
    [produtos, busca]
  );

  const historico = useMemo(
    () => prodSel ? getHistoricoProduto(prodSel.id) : [],
    [prodSel, getHistoricoProduto]
  );

  const tendencia = useMemo(
    () => prodSel ? calcularTendencia(prodSel.id) : null,
    [prodSel, calcularTendencia]
  );

  const dadosGrafico = useMemo(
    () => [...historico].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()).slice(-12),
    [historico]
  );

  function formatarDataCurta(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  }

  function variacaoColor(v: number) {
    if (v > 2) return 'text-red-500';
    if (v < -2) return 'text-green-600';
    return 'text-gray-500';
  }

  return (
    <div className="space-y-5 animate-in">
      <PageHeader title="Evolução de Preços" backHref="/mais" />

      {/* Busca de produto */}
      <Card className="p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            value={busca}
            onChange={e => { setBusca(e.target.value); setShowDrop(true); }}
            onFocus={() => setShowDrop(true)}
            placeholder="Buscar produto..."
            className="w-full pl-9 pr-3 py-2.5 border border-border rounded-xl text-sm text-text-primary bg-background focus:ring-2 focus:ring-primary outline-none"
          />
          {showDrop && busca && (
            <div className="absolute z-10 w-full bg-surface border border-border rounded-xl shadow-lg mt-1 max-h-52 overflow-y-auto">
              {produtosFiltrados.map(p => (
                <button
                  key={p.id}
                  className="flex justify-between w-full px-4 py-3 text-sm hover:bg-primary-50 border-b border-border last:border-0"
                  onClick={() => { setProdSel(p); setBusca(p.nome); setShowDrop(false); }}
                >
                  <span className="font-medium text-text-primary">{p.nome}</span>
                  <span className="text-text-secondary">{formatarMoeda(p.preco_medio)}/{p.unidade_compra}</span>
                </button>
              ))}
              {produtosFiltrados.length === 0 && <p className="px-4 py-3 text-sm text-text-secondary">Nenhum produto encontrado.</p>}
            </div>
          )}
        </div>
      </Card>

      {!prodSel && (
        <EmptyState
          icon={TrendingUp}
          title="Selecione um produto"
          subtitle="Busque acima para ver a evolução de preços ao longo do tempo."
        />
      )}

      {prodSel && (
        <>
          {/* Card principal */}
          <Card className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-text-primary text-lg">{prodSel.nome}</h3>
                <p className="text-xs text-text-secondary">{prodSel.unidade_compra} · {prodSel.categoria}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-text-primary">{formatarMoeda(prodSel.preco_medio)}</p>
                {tendencia && tendencia.tendencia !== 'sem_dados' && (
                  <div className={`flex items-center gap-1 justify-end text-xs font-semibold mt-0.5 ${variacaoColor(tendencia.variacao)}`}>
                    {tendencia.tendencia === 'subiu' && <TrendingUp size={12} />}
                    {tendencia.tendencia === 'desceu' && <TrendingDown size={12} />}
                    {tendencia.tendencia === 'estavel' && <Minus size={12} />}
                    <span>{tendencia.variacao > 0 ? '+' : ''}{tendencia.variacao.toFixed(1)}% desde último registro</span>
                  </div>
                )}
              </div>
            </div>

            {/* Gráfico */}
            {dadosGrafico.length >= 2 ? (
              <div className="bg-orange-50 rounded-xl p-3">
                <SparkLine dados={dadosGrafico} />
              </div>
            ) : (
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <p className="text-sm text-text-secondary">Registre preços na lista de compras para ver o gráfico de evolução.</p>
              </div>
            )}
          </Card>

          {/* Tabela de histórico */}
          {historico.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="font-bold text-text-primary">Histórico de Preços</p>
              </div>
              <div className="divide-y divide-border">
                {historico.map((h, idx) => {
                  const anterior = historico[idx + 1];
                  const variacao = anterior ? ((h.preco - anterior.preco) / anterior.preco) * 100 : null;
                  return (
                    <div key={h.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text-primary">{formatarMoeda(h.preco)}/{prodSel.unidade_compra}</p>
                        <p className="text-xs text-text-secondary">{h.evento_nome || '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-text-secondary">{formatarDataCurta(h.data)}</p>
                        {variacao !== null && (
                          <p className={`text-xs font-semibold ${variacaoColor(variacao)}`}>
                            {variacao > 0 ? '+' : ''}{variacao.toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <Card className="p-5 text-center">
              <p className="text-sm text-text-secondary">Nenhum histórico registrado ainda.</p>
              <p className="text-xs text-text-secondary mt-1">Os preços são registrados automaticamente quando você edita o valor na lista de compras de um evento.</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
