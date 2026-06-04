'use client';
import { useState } from 'react';
import { Plus, Minus, CalendarClock, AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';
import { useEstoqueStore } from '@/stores/estoqueStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { verificarValidade, textoValidade } from '@/lib/utils';
import type { TipoEstoque, EstoqueLote, StatusLote } from '@/types';
import toast from 'react-hot-toast';

function BarraEstoque({ atual, minimo }: { atual: number; minimo: number }) {
  const pct = minimo > 0 ? Math.min(1, atual / minimo) : 1;
  const cor = pct >= 0.5 ? '#2E7D32' : pct >= 0.2 ? '#F57F17' : '#C62828';
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F0E8E0' }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct * 100}%`, backgroundColor: cor }} />
    </div>
  );
}

const inp = "w-full px-4 py-3 border border-[#E8DDD5] rounded-xl text-sm text-[#3B2F2F] bg-white focus:ring-2 focus:ring-[#D4764E] outline-none placeholder:text-[#7A6B6B]";

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
    toast.success('Lote cadastrado!'); setModalLote(false); setLoteQtd(''); setLoteVal('');
  }

  function confirmarResolver(status: StatusLote) {
    if (!loteResolver) return;
    if (status === 'consumido') movimentar(loteResolver.estoque_id, 'entrada', loteResolver.quantidade, 'Lote resolvido: consumido');
    resolverLote(loteResolver.id, status);
    toast.success('Lote resolvido!'); setModalResolver(false);
  }

  return (
    <div className="space-y-5 animate-in">
      <PageHeader title="Estoque" />

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl border border-orange-100 overflow-hidden shadow-sm">
        {([['sopa_semanal', '🍲 Sopa Semanal'], ['limpeza', '🧹 Limpeza']] as const).map(([tipo, label]) => (
          <button key={tipo} onClick={() => setAba(tipo)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${aba === tipo ? 'bg-[#D4764E] text-white' : 'text-[#7A6B6B] hover:bg-orange-50'}`}>
            {label}
          </button>
        ))}
      </div>

      {itensDaAba.length === 0 ? (
        <div className="py-12 text-center text-[#7A6B6B]">Nenhum item de estoque.</div>
      ) : (
        <div className="space-y-4">
          {itensDaAba.map(item => {
            const alertaBaixo = item.quantidade_atual < item.quantidade_minima;
            const lotesItem = getLotesPorEstoque(item.id);
            return (
              <div key={item.id} className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 ${alertaBaixo ? 'border-red-200' : 'border-orange-100'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-[#3B2F2F] text-base">{item.produto?.nome}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className={`text-2xl font-bold ${alertaBaixo ? 'text-red-500' : 'text-[#3B2F2F]'}`}>{item.quantidade_atual}</span>
                      <span className="text-sm text-[#7A6B6B]">/ mín {item.quantidade_minima} {item.unidade}</span>
                    </div>
                  </div>
                  {alertaBaixo && (
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle size={18} className="text-red-500" />
                    </div>
                  )}
                </div>
                <BarraEstoque atual={item.quantidade_atual} minimo={item.quantidade_minima} />
                <div className="flex gap-2">
                  <button onClick={() => { setMovId(item.id); setMovTipo('entrada'); setModalMov(true); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors">
                    <Plus size={15} /> Entrada
                  </button>
                  <button onClick={() => { setMovId(item.id); setMovTipo('saida'); setModalMov(true); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
                    <Minus size={15} /> Saída
                  </button>
                  <button onClick={() => { setLoteEstId(item.id); setLoteProdId(item.produto_id); setLoteUnidade(item.unidade); setModalLote(true); }} className="px-3 py-2.5 bg-orange-50 text-[#D4764E] border border-orange-200 rounded-xl text-xs font-semibold hover:bg-orange-100 transition-colors flex items-center gap-1">
                    <CalendarClock size={14} /> Validade
                  </button>
                </div>

                {lotesItem.length > 0 && (
                  <div className="border-t border-orange-100 pt-3 space-y-2">
                    <p className="text-xs font-bold text-[#7A6B6B] uppercase tracking-wide">Lotes</p>
                    {lotesItem.map(lote => {
                      const v = verificarValidade(lote.data_validade, lote.alerta_dias_antes);
                      const bgColor = v.status === 'vencido' ? '#C62828' : v.status === 'proximo_vencimento' ? '#F57F17' : '#2E7D32';
                      return (
                        <div key={lote.id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ backgroundColor: bgColor + '12' }}>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: bgColor + '20' }}>
                            {v.status === 'vencido' ? <AlertOctagon size={14} style={{ color: bgColor }} /> : v.status === 'proximo_vencimento' ? <AlertTriangle size={14} style={{ color: bgColor }} /> : <CheckCircle size={14} style={{ color: bgColor }} />}
                          </div>
                          <span className="flex-1 text-sm text-[#3B2F2F] font-medium">{lote.quantidade} {lote.unidade}</span>
                          <span className="text-xs font-semibold" style={{ color: bgColor }}>{textoValidade(v.diasRestantes)}</span>
                          {v.status !== 'ok' && (
                            <button onClick={() => { setLoteResolver(lote); setModalResolver(true); }} className="text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors hover:opacity-80" style={{ color: bgColor, borderColor: bgColor + '40', backgroundColor: bgColor + '10' }}>Resolver</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalMov} onClose={() => setModalMov(false)} title={movTipo === 'entrada' ? '+ Entrada de Estoque' : '- Saída de Estoque'} size="sm">
        <div className="space-y-3">
          <input value={movQtd} onChange={e => setMovQtd(e.target.value)} placeholder="Quantidade *" type="number" step="0.1" className={inp} autoFocus />
          <input value={movMotivo} onChange={e => setMovMotivo(e.target.value)} placeholder="Motivo (opcional)" className={inp} />
          <div className="flex gap-2 pt-1">
            <button onClick={() => setModalMov(false)} className="flex-1 py-3 border border-[#E8DDD5] rounded-xl text-sm font-semibold text-[#7A6B6B] hover:bg-gray-50">Cancelar</button>
            <button onClick={confirmarMov} className="flex-1 py-3 text-white rounded-xl text-sm font-bold transition-colors" style={{ backgroundColor: movTipo === 'entrada' ? '#2E7D32' : '#C62828' }}>Confirmar</button>
          </div>
        </div>
      </Modal>

      <Modal open={modalLote} onClose={() => setModalLote(false)} title="Adicionar Lote com Validade" size="sm">
        <div className="space-y-3">
          <input value={loteQtd} onChange={e => setLoteQtd(e.target.value)} placeholder="Quantidade *" type="number" step="0.1" className={inp} />
          <input value={loteUnidade} onChange={e => setLoteUnidade(e.target.value)} placeholder="Unidade" className={inp} />
          <input value={loteVal} onChange={e => setLoteVal(e.target.value)} placeholder="Data de validade *" type="date" className={inp} />
          <input value={loteDias} onChange={e => setLoteDias(e.target.value)} placeholder="Alertar X dias antes (padrão 7)" type="number" className={inp} />
          <div className="flex gap-2 pt-1">
            <button onClick={() => setModalLote(false)} className="flex-1 py-3 border border-[#E8DDD5] rounded-xl text-sm font-semibold text-[#7A6B6B]">Cancelar</button>
            <button onClick={confirmarLote} className="flex-1 py-3 bg-[#D4764E] text-white rounded-xl text-sm font-bold hover:bg-[#B85A35] transition-colors">Salvar Lote</button>
          </div>
        </div>
      </Modal>

      <Modal open={modalResolver} onClose={() => setModalResolver(false)} title="O que fazer com este lote?">
        {loteResolver && (
          <div className="space-y-4">
            <p className="text-sm text-[#7A6B6B] bg-orange-50 rounded-xl px-4 py-3">{loteResolver.quantidade} {loteResolver.unidade} · {textoValidade(Math.ceil((new Date(loteResolver.data_validade + 'T00:00:00').getTime() - new Date().setHours(0,0,0,0)) / 86400000))}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '🍲 Consumir', status: 'consumido' as StatusLote, color: '#5B8C5A', sub: 'Usar na sopa/evento' },
                { label: '🤝 Doar', status: 'doado' as StatusLote, color: '#D4764E', sub: 'Para quem precisar' },
                { label: '💰 Vender', status: 'vendido' as StatusLote, color: '#C9A825', sub: 'Colocar à venda' },
                { label: '🗑️ Descartar', status: 'descartado' as StatusLote, color: '#C62828', sub: 'Confirmar antes' },
              ].map(op => (
                <button key={op.status} onClick={() => {
                  if (op.status === 'descartado' && !confirm('Tem certeza que deseja descartar?')) return;
                  confirmarResolver(op.status);
                }} className="p-4 rounded-2xl border-2 text-center transition-all hover:scale-[0.98] active:scale-95" style={{ borderColor: op.color + '50', backgroundColor: op.color + '08' }}>
                  <p className="font-bold text-sm mb-0.5" style={{ color: op.color }}>{op.label}</p>
                  <p className="text-xs text-[#7A6B6B]">{op.sub}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setModalResolver(false)} className="w-full py-3 border border-[#E8DDD5] rounded-xl text-sm font-semibold text-[#7A6B6B] hover:bg-gray-50">Cancelar</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
