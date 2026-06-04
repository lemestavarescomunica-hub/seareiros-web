'use client';
import { useState } from 'react';
import { Plus, Minus, CalendarClock, AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';
import { useEstoqueStore } from '@/stores/estoqueStore';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { verificarValidade, textoValidade } from '@/lib/utils';
import type { TipoEstoque, EstoqueLote, StatusLote } from '@/types';
import toast from 'react-hot-toast';

function BarraEstoque({ atual, minimo }: { atual: number; minimo: number }) {
  const pct = minimo > 0 ? Math.min(1, atual / minimo) : 1;
  const cor = pct >= 0.5 ? '#2E7D32' : pct >= 0.2 ? '#F57F17' : '#C62828';
  return <div className="h-2 rounded-full bg-border overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${pct * 100}%`, backgroundColor: cor }} /></div>;
}

const ALERTA_ICONS: Record<string, typeof CheckCircle> = { ok: CheckCircle, proximo_vencimento: AlertTriangle, vencido: AlertOctagon };

export default function EstoquePage() {
  const { itens, movimentar, addLote, resolverLote, getLotesPorEstoque } = useEstoqueStore();
  const [aba, setAba] = useState<TipoEstoque>('sopa_semanal');

  const [modalMov, setModalMov] = useState(false);
  const [movId, setMovId] = useState('');
  const [movTipo, setMovTipo] = useState<'entrada' | 'saida'>('entrada');
  const [movQtd, setMovQtd] = useState('');
  const [movMotivo, setMovMotivo] = useState('');

  const [modalLote, setModalLote] = useState(false);
  const [loteEstId, setLoteEstId] = useState('');
  const [loteProdId, setLoteProdId] = useState('');
  const [loteQtd, setLoteQtd] = useState('');
  const [loteUnidade, setLoteUnidade] = useState('kg');
  const [loteVal, setLoteVal] = useState('');
  const [loteDias, setLoteDias] = useState('7');

  const [modalResolver, setModalResolver] = useState(false);
  const [loteResolver, setLoteResolver] = useState<EstoqueLote | null>(null);

  const itensDaAba = itens.filter(i => i.tipo === aba);
  const inputCls = "w-full px-3 py-2.5 border border-border rounded-xl text-sm text-text-primary bg-background focus:ring-2 focus:ring-primary outline-none";

  function confirmarMov() {
    const q = parseFloat(movQtd.replace(',', '.'));
    if (!q || q <= 0) { toast.error('Quantidade inválida.'); return; }
    movimentar(movId, movTipo, q, movMotivo || undefined);
    toast.success(movTipo === 'entrada' ? 'Entrada registrada!' : 'Saída registrada!');
    setModalMov(false); setMovQtd(''); setMovMotivo('');
  }

  function confirmarLote() {
    if (!loteQtd || !loteVal) { toast.error('Informe quantidade e validade.'); return; }
    addLote({ estoque_id: loteEstId, produto_id: loteProdId, quantidade: parseFloat(loteQtd.replace(',', '.')), unidade: loteUnidade, data_validade: loteVal, alerta_dias_antes: parseInt(loteDias) || 7 });
    toast.success('Lote cadastrado!');
    setModalLote(false); setLoteQtd(''); setLoteVal('');
  }

  function confirmarResolver(status: StatusLote, destino?: string) {
    if (!loteResolver) return;
    if (status === 'consumido') movimentar(loteResolver.estoque_id, 'entrada', loteResolver.quantidade, 'Lote resolvido: consumido');
    resolverLote(loteResolver.id, status, destino);
    toast.success('Lote resolvido!');
    setModalResolver(false);
  }

  return (
    <div className="space-y-5 animate-in">
      <PageHeader title="Estoque" />
      <div className="flex border-b border-border">
        {([['sopa_semanal', 'Sopa Semanal'], ['limpeza', 'Limpeza']] as const).map(([tipo, label]) => (
          <button key={tipo} onClick={() => setAba(tipo)} className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${aba === tipo ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-text-primary'}`}>{label}</button>
        ))}
      </div>
      {itensDaAba.length === 0 ? <div className="py-12 text-center text-text-secondary">Nenhum item de estoque.</div> : (
        <div className="space-y-4">
          {itensDaAba.map(item => {
            const alertaBaixo = item.quantidade_atual < item.quantidade_minima;
            const lotesItem = getLotesPorEstoque(item.id);
            return (
              <Card key={item.id} className={`p-4 space-y-3 ${alertaBaixo ? 'border border-error/40' : ''}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-text-primary">{item.produto?.nome}</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className={`text-xl font-bold ${alertaBaixo ? 'text-error' : 'text-text-primary'}`}>{item.quantidade_atual}</span>
                      <span className="text-sm text-text-secondary">/ mín {item.quantidade_minima} {item.unidade}</span>
                    </div>
                  </div>
                  {alertaBaixo && <AlertTriangle size={20} className="text-error shrink-0" />}
                </div>
                <BarraEstoque atual={item.quantidade_atual} minimo={item.quantidade_minima} />
                <div className="flex gap-2">
                  <button onClick={() => { setMovId(item.id); setMovTipo('entrada'); setModalMov(true); }} className="flex-1 flex items-center justify-center gap-1 py-2 bg-success/15 text-success border border-success/30 rounded-xl text-sm font-semibold hover:bg-success/25 transition">
                    <Plus size={14} /> Entrada
                  </button>
                  <button onClick={() => { setMovId(item.id); setMovTipo('saida'); setModalMov(true); }} className="flex-1 flex items-center justify-center gap-1 py-2 bg-error/10 text-error border border-error/30 rounded-xl text-sm font-semibold hover:bg-error/20 transition">
                    <Minus size={14} /> Saída
                  </button>
                  <button onClick={() => { setLoteEstId(item.id); setLoteProdId(item.produto_id); setLoteUnidade(item.unidade); setModalLote(true); }} className="px-3 py-2 border border-primary/40 text-primary rounded-xl text-sm font-semibold hover:bg-primary-50 transition flex items-center gap-1">
                    <CalendarClock size={14} /> Validade
                  </button>
                </div>
                {lotesItem.length > 0 && (
                  <div className="border-t border-border pt-3 space-y-2">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">Lotes</p>
                    {lotesItem.map(lote => {
                      const v = verificarValidade(lote.data_validade, lote.alerta_dias_antes);
                      const AlertIcon = ALERTA_ICONS[v.status] || CheckCircle;
                      return (
                        <div key={lote.id} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: v.cor + '12' }}>
                          <AlertIcon size={15} style={{ color: v.cor }} />
                          <span className="flex-1 text-sm text-text-primary">{lote.quantidade} {lote.unidade}</span>
                          <span className="text-xs font-semibold" style={{ color: v.cor }}>{textoValidade(v.diasRestantes)}</span>
                          {v.status !== 'ok' && (
                            <button onClick={() => { setLoteResolver(lote); setModalResolver(true); }} className="text-xs font-bold px-2 py-1 rounded-lg border" style={{ color: v.cor, borderColor: v.cor + '50' }}>Resolver</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalMov} onClose={() => setModalMov(false)} title={movTipo === 'entrada' ? '+ Entrada' : '- Saída'} size="sm">
        <div className="space-y-3">
          <input value={movQtd} onChange={e => setMovQtd(e.target.value)} placeholder="Quantidade *" type="number" step="0.1" className={inputCls} autoFocus />
          <input value={movMotivo} onChange={e => setMovMotivo(e.target.value)} placeholder="Motivo (opcional)" className={inputCls} />
          <div className="flex gap-2 pt-1">
            <button onClick={() => setModalMov(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-secondary">Cancelar</button>
            <button onClick={confirmarMov} className="flex-1 py-2.5 text-white rounded-xl text-sm font-bold transition" style={{ backgroundColor: movTipo === 'entrada' ? '#2E7D32' : '#C62828' }}>Confirmar</button>
          </div>
        </div>
      </Modal>

      <Modal open={modalLote} onClose={() => setModalLote(false)} title="Adicionar Lote com Validade" size="sm">
        <div className="space-y-3">
          <input value={loteQtd} onChange={e => setLoteQtd(e.target.value)} placeholder="Quantidade *" type="number" step="0.1" className={inputCls} />
          <input value={loteUnidade} onChange={e => setLoteUnidade(e.target.value)} placeholder="Unidade" className={inputCls} />
          <input value={loteVal} onChange={e => setLoteVal(e.target.value)} placeholder="Data de validade *" type="date" className={inputCls} />
          <input value={loteDias} onChange={e => setLoteDias(e.target.value)} placeholder="Alertar X dias antes" type="number" className={inputCls} />
          <div className="flex gap-2 pt-1">
            <button onClick={() => setModalLote(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-secondary">Cancelar</button>
            <button onClick={confirmarLote} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition">Salvar Lote</button>
          </div>
        </div>
      </Modal>

      <Modal open={modalResolver} onClose={() => setModalResolver(false)} title="O que fazer com este lote?">
        {loteResolver && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">{loteResolver.quantidade} {loteResolver.unidade} · {textoValidade(Math.ceil((new Date(loteResolver.data_validade + 'T00:00:00').getTime() - new Date().setHours(0,0,0,0)) / 86400000))}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '🍲 Consumir', status: 'consumido' as StatusLote, color: '#5B8C5A', sub: 'Usar na sopa/evento' },
                { label: '🤝 Doar', status: 'doado' as StatusLote, color: '#D4764E', sub: 'Informar destino' },
                { label: '💰 Vender', status: 'vendido' as StatusLote, color: '#E8C547', sub: 'Colocar à venda' },
                { label: '🗑️ Descartar', status: 'descartado' as StatusLote, color: '#C62828', sub: 'Confirmação dupla' },
              ].map(op => (
                <button key={op.status} onClick={() => {
                  if (op.status === 'descartado' && !confirm('Tem certeza que deseja descartar?')) return;
                  confirmarResolver(op.status);
                }} className="p-3 rounded-xl border-2 text-center transition hover:opacity-80" style={{ borderColor: op.color + '60', backgroundColor: op.color + '10' }}>
                  <p className="font-bold text-sm" style={{ color: op.color }}>{op.label}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{op.sub}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setModalResolver(false)} className="w-full py-2.5 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:bg-gray-50 transition">Cancelar</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
