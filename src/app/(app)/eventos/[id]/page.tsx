'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, DollarSign, CheckCircle, ShoppingBag, MessageCircle, Tag, Minus, Plus, Trash2, Sun, Sunset, Moon, Brush, Package, X, CheckSquare } from 'lucide-react';
import { useEventoStore } from '@/stores/eventoStore';
import { useVoluntarioStore } from '@/stores/voluntarioStore';
import { useVendaStore } from '@/stores/vendaStore';
import { useProdutoStore } from '@/stores/produtoStore';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { formatarData, formatarMoeda, LABELS_STATUS_EVENTO, CORES_STATUS_EVENTO, LABELS_TURNO, CORES_STATUS_CONFIRMACAO, calcularCustoReceita, abrirWhatsApp, formatarListaWhatsApp, calcularPrecoVenda, gerarId } from '@/lib/utils';
import type { StatusEvento, Turno } from '@/types';
import toast from 'react-hot-toast';
import { LABELS_CATEGORIA_PRODUTO } from '@/lib/utils';
import type { CategoriaProduto } from '@/types';

const TABS = ['Pratos', 'Compras', 'Equipe', 'Sobras'];
const TURNOS: Turno[] = ['manha', 'tarde', 'noite', 'limpeza'];
const TURNO_ICONS: Record<Turno, typeof Sun> = { manha: Sun, tarde: Sunset, noite: Moon, limpeza: Brush };
const STATUS_OPCOES: StatusEvento[] = ['planejamento', 'compras', 'em_execucao', 'concluido'];

export default function EventoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getEvento, updateEvento, deleteEvento, removePrato, updatePorcoes, gerarLista, getLista, toggleItemComprado } = useEventoStore();
  const { getEscalasEvento, voluntarios, escalar, removerEscala } = useVoluntarioStore();
  const { getItensPorEvento, getTotalArrecadado, addItem: addVendaItem, registrarVenda, recolher } = useVendaStore();
  const { produtos } = useProdutoStore();

  const [tab, setTab] = useState(0);
  const [modalVenda, setModalVenda] = useState(false);
  const [vBusca, setVBusca] = useState('');
  const [vProdId, setVProdId] = useState('');
  const [vQtd, setVQtd] = useState('');
  const [vUnidade, setVUnidade] = useState('kg');
  const [vCusto, setVCusto] = useState('');
  const [vMargem, setVMargem] = useState('10');
  const [vNomeCustom, setVNomeCustom] = useState('');
  const [vShowDrop, setVShowDrop] = useState(false);

  const evento = getEvento(id);
  const lista = getLista(id);
  const escalas = getEscalasEvento(id);
  const itensVenda = getItensPorEvento(id);
  const totalArrecadado = getTotalArrecadado(id);

  if (!evento) return <div className="p-8 text-center text-text-secondary">Evento não encontrado.</div>;

  const custoTotal = (evento.pratos || []).reduce((acc, p) => {
    if (!p.receita?.ingredientes) return acc;
    return acc + calcularCustoReceita(p.receita.ingredientes, p.receita.rendimento_base, p.quantidade_porcoes).total;
  }, 0);

  const listaItens = lista?.itens || [];
  const marcados = listaItens.filter(i => i.comprado).length;
  const totalLista = listaItens.reduce((a, i) => a + (i.preco_estimado || 0), 0);

  const precoVendaCalc = calcularPrecoVenda(parseFloat(vCusto.replace(',', '.')) || 0, parseFloat(vMargem) || 10);

  function salvarVenda() {
    if (!vQtd || !vCusto) { toast.error('Preencha quantidade e preço de custo.'); return; }
    const prod = produtos.find(p => p.id === vProdId);
    addVendaItem({ produto_id: vProdId || undefined, produto: prod, evento_id: id, nome_personalizado: vNomeCustom || undefined, quantidade_disponivel: parseFloat(vQtd.replace(',', '.')), unidade: vUnidade, preco_custo: parseFloat(vCusto.replace(',', '.')), margem_percentual: parseFloat(vMargem) || 10, preco_venda: precoVendaCalc, status: 'disponivel' });
    toast.success('Item adicionado à venda!');
    setModalVenda(false);
    setVBusca(''); setVProdId(''); setVQtd(''); setVCusto(''); setVMargem('10'); setVNomeCustom('');
  }

  const inputCls = "w-full px-3 py-2.5 border border-border rounded-xl text-sm text-text-primary bg-background focus:ring-2 focus:ring-primary outline-none";

  return (
    <div className="space-y-0 animate-in">
      <PageHeader title={evento.nome} subtitle={formatarData(evento.data_inicio)} backHref="/eventos"
        action={<StatusBadge label={LABELS_STATUS_EVENTO[evento.status]} color={CORES_STATUS_EVENTO[evento.status]} />}
      />

      {/* Tabs */}
      <div className="flex border-b border-border bg-surface sticky top-0 z-10 -mx-4 px-4">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${tab === i ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-text-primary'}`}>{t}</button>
        ))}
      </div>

      <div className="pt-5 space-y-4">
        {/* Tab 0: Pratos */}
        {tab === 0 && (
          <>
            {/* Resumo custo */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Users, label: 'Público', value: evento.publico_estimado.toString(), color: 'text-primary' },
                { icon: DollarSign, label: 'Custo Total', value: formatarMoeda(custoTotal), color: 'text-secondary' },
                { icon: DollarSign, label: 'Por Pessoa', value: evento.publico_estimado > 0 ? formatarMoeda(custoTotal / evento.publico_estimado) : 'R$ 0', color: 'text-accent-dark' },
              ].map(item => (
                <Card key={item.label} className="p-3 text-center">
                  <item.icon size={16} className={`mx-auto mb-1 ${item.color}`} />
                  <p className="text-xs text-text-secondary">{item.label}</p>
                  <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
                </Card>
              ))}
            </div>
            {/* Status */}
            <Card className="p-4">
              <p className="font-bold text-text-primary mb-3">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPCOES.map(s => (
                  <button key={s} onClick={() => { updateEvento(id, { status: s }); toast.success('Status atualizado!'); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${evento.status === s ? 'text-white border-transparent' : 'text-text-secondary border-border hover:border-primary hover:text-primary'}`}
                    style={evento.status === s ? { backgroundColor: CORES_STATUS_EVENTO[s] } : {}}
                  >{LABELS_STATUS_EVENTO[s]}</button>
                ))}
              </div>
            </Card>
            {/* Pratos */}
            <Card className="p-4">
              <p className="font-bold text-text-primary mb-3">Pratos</p>
              {(evento.pratos || []).length === 0 ? (
                <p className="text-sm text-text-secondary italic py-2">Nenhum prato adicionado.</p>
              ) : (
                <div className="space-y-3">
                  {(evento.pratos || []).map(prato => {
                    const custo = prato.receita?.ingredientes ? calcularCustoReceita(prato.receita.ingredientes, prato.receita.rendimento_base, prato.quantidade_porcoes) : { total: 0 };
                    return (
                      <div key={prato.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <div className="flex-1">
                          <p className="font-semibold text-text-primary text-sm">{prato.receita?.nome}</p>
                          <p className="text-xs text-text-secondary">{custo.total > 0 ? formatarMoeda(custo.total) : ''}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updatePorcoes(id, prato.id, Math.max(1, prato.quantidade_porcoes - 10))} className="w-7 h-7 border border-border rounded-lg flex items-center justify-center hover:bg-primary-50 transition text-xs font-bold">-10</button>
                          <span className="font-bold text-text-primary w-12 text-center">{prato.quantidade_porcoes}</span>
                          <button onClick={() => updatePorcoes(id, prato.id, prato.quantidade_porcoes + 10)} className="w-7 h-7 border border-border rounded-lg flex items-center justify-center hover:bg-primary-50 transition text-xs font-bold">+10</button>
                          <button onClick={() => { if (confirm('Remover prato?')) removePrato(id, prato.id); }} className="p-1 text-error hover:text-error/70"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
            <button onClick={() => { if (confirm('Excluir este evento?')) { deleteEvento(id); router.push('/eventos'); toast.success('Evento excluído.'); } }} className="w-full py-2.5 border border-error/40 text-error rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
              Excluir Evento
            </button>
          </>
        )}

        {/* Tab 1: Lista de Compras */}
        {tab === 1 && (
          <>
            <button onClick={() => { gerarLista(id); toast.success('Lista gerada!'); }} className="w-full py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-dark transition-colors flex items-center justify-center gap-2">
              <ShoppingBag size={18} />{lista ? 'Atualizar Lista' : 'Gerar Lista de Compras'}
            </button>
            {lista && listaItens.length > 0 && (
              <>
                <Card className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-text-primary">{marcados} de {listaItens.length} comprados</span>
                    <span className="text-sm font-bold text-primary">{Math.round((marcados / listaItens.length) * 100)}%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill bg-secondary" style={{ width: `${(marcados / listaItens.length) * 100}%` }} /></div>
                </Card>
                {(() => {
                  const porCat: Record<string, typeof listaItens> = {};
                  listaItens.forEach(i => { const c = i.categoria || 'outros'; if (!porCat[c]) porCat[c] = []; porCat[c].push(i); });
                  return Object.entries(porCat).map(([cat, itens]) => (
                    <div key={cat}>
                      <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-2 px-1">{LABELS_CATEGORIA_PRODUTO[cat as CategoriaProduto] || cat}</p>
                      <Card className="overflow-hidden">
                        {itens!.map((item, idx) => (
                          <button key={item.id} onClick={() => toggleItemComprado(lista.id, item.id)} className={`flex items-center gap-3 w-full p-3 border-b border-border last:border-0 text-left hover:bg-primary-50 transition-colors ${item.comprado ? 'opacity-50' : ''}`}>
                            <CheckCircle size={20} className={item.comprado ? 'text-success' : 'text-border'} />
                            <div className="flex-1">
                              <p className={`text-sm font-semibold text-text-primary ${item.comprado ? 'line-through' : ''}`}>{item.produto?.nome || item.nome_extra}</p>
                              <p className="text-xs text-text-secondary">{item.quantidade} {item.unidade}</p>
                            </div>
                            {item.preco_estimado ? <span className="text-xs font-semibold text-primary">{formatarMoeda(item.preco_estimado)}</span> : null}
                          </button>
                        ))}
                      </Card>
                    </div>
                  ));
                })()}
                <div className="flex gap-3 sticky bottom-20 lg:bottom-4">
                  <div className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 shadow-card">
                    <p className="text-xs text-text-secondary">Total estimado</p>
                    <p className="text-lg font-bold text-primary">{formatarMoeda(totalLista)}</p>
                  </div>
                  <button onClick={() => lista?.itens && abrirWhatsApp(formatarListaWhatsApp(evento, lista.itens))} className="flex items-center gap-2 px-4 py-3 bg-secondary text-white rounded-xl font-semibold text-sm hover:bg-secondary-dark transition-colors">
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                </div>
              </>
            )}
            {!lista && <EmptyState icon={ShoppingBag} title="Lista não gerada" subtitle="Clique em Gerar Lista para criar automaticamente." />}
          </>
        )}

        {/* Tab 2: Equipe */}
        {tab === 2 && (
          <div className="space-y-4">
            {TURNOS.map(turno => {
              const TurnoIcon = TURNO_ICONS[turno];
              const doTurno = escalas.filter(e => e.turno === turno);
              const confirmados = doTurno.filter(e => e.status_confirmacao === 'confirmado').length;
              return (
                <Card key={turno} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TurnoIcon size={18} className="text-primary" />
                    <p className="font-bold text-text-primary flex-1">{LABELS_TURNO[turno]}</p>
                    <span className="text-xs text-text-secondary">{confirmados}/{doTurno.length} confirmados</span>
                    <button onClick={() => {
                      const livre = voluntarios.filter(v => !escalas.some(e => e.voluntario_id === v.id));
                      if (!livre.length) { toast.error('Todos os voluntários já escalados.'); return; }
                      escalar({ evento_id: id, voluntario_id: livre[0].id, turno, status_confirmacao: 'pendente' });
                    }} className="text-primary hover:text-primary-dark transition">
                      <Plus size={20} />
                    </button>
                  </div>
                  {doTurno.length === 0 ? <p className="text-sm text-text-secondary italic">Nenhum voluntário escalado</p> : (
                    <div className="space-y-2">
                      {doTurno.map(esc => (
                        <div key={esc.id} className="flex items-center gap-3">
                          <Avatar nome={esc.voluntario?.nome || '?'} size={36} />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-text-primary">{esc.voluntario?.nome}</p>
                            {esc.funcao && <p className="text-xs text-text-secondary">{esc.funcao}</p>}
                          </div>
                          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ color: CORES_STATUS_CONFIRMACAO[esc.status_confirmacao], backgroundColor: CORES_STATUS_CONFIRMACAO[esc.status_confirmacao] + '20' }}>
                            {esc.status_confirmacao === 'pendente' ? 'Pendente' : esc.status_confirmacao === 'confirmado' ? 'Confirmado' : 'Recusou'}
                          </span>
                          <button onClick={() => removerEscala(esc.id)} className="text-error hover:text-error/70 p-1"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Tab 3: Sobras / Vendas */}
        {tab === 3 && (
          <>
            <button onClick={() => setModalVenda(true)} className="w-full py-3 bg-accent text-text-primary font-bold rounded-xl hover:bg-accent-dark/80 transition-colors flex items-center justify-center gap-2">
              <Tag size={18} /> Colocar Item à Venda
            </button>
            {itensVenda.length === 0 ? (
              <EmptyState icon={Tag} title="Nenhum item à venda" subtitle="Adicione sobras do evento para vender e arrecadar fundos." />
            ) : (
              <>
                <div className="space-y-3">
                  {itensVenda.map(item => {
                    const nome = item.nome_personalizado || item.produto?.nome || 'Item';
                    const prog = item.quantidade_disponivel > 0 ? item.quantidade_vendida / item.quantidade_disponivel : 0;
                    const statusCor = item.status === 'disponivel' ? '#2E7D32' : item.status === 'esgotado' ? '#C62828' : '#7A6B6B';
                    return (
                      <Card key={item.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-text-primary">{nome}</p>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: statusCor, backgroundColor: statusCor + '20' }}>
                              {item.status === 'disponivel' ? 'Disponível' : item.status === 'esgotado' ? 'Esgotado' : 'Recolhido'}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-primary">{formatarMoeda(item.preco_venda)}</p>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-text-secondary mb-1">
                            <span>{item.quantidade_vendida}/{item.quantidade_disponivel} {item.unidade} vendidos</span>
                            <span className="font-semibold text-success">Arrecadado: {formatarMoeda(item.receita_total)}</span>
                          </div>
                          <div className="progress-bar"><div className="progress-fill bg-success" style={{ width: `${prog * 100}%` }} /></div>
                        </div>
                        {item.status === 'disponivel' && (
                          <div className="flex gap-2">
                            <button onClick={() => { registrarVenda(item.id, 1); toast.success('+1 venda registrada!'); }} className="flex-1 py-2 bg-success text-white rounded-xl text-sm font-semibold hover:bg-success/90 transition flex items-center justify-center gap-1">
                              <Plus size={14} /> +1 Venda
                            </button>
                            <button onClick={() => { if (confirm('Recolher item?')) { recolher(item.id); toast.success('Item recolhido.'); } }} className="px-4 py-2 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:bg-gray-50 transition flex items-center gap-1">
                              <Package size={14} /> Recolher
                            </button>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
                <div className="sticky bottom-20 lg:bottom-4 bg-surface border border-border rounded-xl px-4 py-3 shadow-card flex items-center gap-3">
                  <DollarSign size={22} className="text-success" />
                  <div>
                    <p className="text-xs text-text-secondary">Total Arrecadado</p>
                    <p className="text-xl font-bold text-success">{formatarMoeda(totalArrecadado)}</p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Modal Venda */}
      <Modal open={modalVenda} onClose={() => setModalVenda(false)} title="Colocar Item à Venda">
        <div className="space-y-3">
          <div className="relative">
            <input value={vBusca} onChange={e => { setVBusca(e.target.value); setVShowDrop(true); setVProdId(''); }} onFocus={() => setVShowDrop(true)} placeholder="Buscar produto..." className={inputCls} />
            {vShowDrop && vBusca && (
              <div className="absolute z-10 w-full bg-surface border border-border rounded-xl shadow-card-md mt-1 max-h-40 overflow-y-auto">
                {produtos.filter(p => p.nome.toLowerCase().includes(vBusca.toLowerCase())).slice(0, 5).map(p => (
                  <button key={p.id} className="flex justify-between w-full px-4 py-2.5 text-sm hover:bg-primary-50 border-b border-border last:border-0" onClick={() => { setVProdId(p.id); setVBusca(p.nome); setVCusto(p.preco_medio.toString()); setVUnidade(p.unidade_compra); setVShowDrop(false); }}>
                    <span>{p.nome}</span><span className="text-text-secondary">{formatarMoeda(p.preco_medio)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <input value={vNomeCustom} onChange={e => setVNomeCustom(e.target.value)} placeholder='Nome personalizado (ex: "Marmita de Feijoada")' className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <input value={vQtd} onChange={e => setVQtd(e.target.value)} placeholder="Qtd disponível *" type="number" className={inputCls} />
            <input value={vUnidade} onChange={e => setVUnidade(e.target.value)} placeholder="Unidade" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={vCusto} onChange={e => setVCusto(e.target.value)} placeholder="Preço custo (R$) *" type="number" step="0.01" className={inputCls} />
            <input value={vMargem} onChange={e => setVMargem(e.target.value)} placeholder="Margem %" type="number" className={inputCls} />
          </div>
          {parseFloat(vCusto.replace(',', '.')) > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 border border-primary-200">
              <DollarSign size={18} className="text-primary" />
              <div>
                <p className="text-xs text-text-secondary">Preço de venda sugerido</p>
                <p className="text-xl font-bold text-primary">{formatarMoeda(precoVendaCalc)}</p>
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button onClick={() => setModalVenda(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:bg-gray-50 transition">Cancelar</button>
            <button onClick={salvarVenda} className="flex-1 py-2.5 bg-accent text-text-primary rounded-xl text-sm font-bold hover:bg-accent-dark/80 transition">Adicionar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
