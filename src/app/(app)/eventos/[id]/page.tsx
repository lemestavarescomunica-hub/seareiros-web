'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, DollarSign, CheckCircle, ShoppingBag, Tag, Minus, Plus, Trash2, Sun, Sunset, Moon, Brush, Package, X, Pencil, TrendingUp, TrendingDown } from 'lucide-react';
import { useEventoStore } from '@/stores/eventoStore';
import { useVoluntarioStore } from '@/stores/voluntarioStore';
import { useVendaStore } from '@/stores/vendaStore';
import { useProdutoStore } from '@/stores/produtoStore';
import { useReceitaStore } from '@/stores/receitaStore';
import { usePrecosStore } from '@/stores/precosStore';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { formatarData, formatarMoeda, LABELS_STATUS_EVENTO, CORES_STATUS_EVENTO, LABELS_TURNO, CORES_STATUS_CONFIRMACAO, calcularCustoReceita, abrirWhatsApp, formatarListaWhatsApp, calcularPrecoVenda, gerarId, LABELS_CATEGORIA_PRODUTO } from '@/lib/utils';
import type { StatusEvento, Turno, ItemLista, CategoriaProduto } from '@/types';
import toast from 'react-hot-toast';

const TABS = ['Pratos', 'Compras', 'Equipe', 'Sobras'];
const TURNOS: Turno[] = ['manha', 'tarde', 'noite', 'limpeza'];
const TURNO_ICONS: Record<Turno, typeof Sun> = { manha: Sun, tarde: Sunset, noite: Moon, limpeza: Brush };
const STATUS_OPCOES: StatusEvento[] = ['planejamento', 'compras', 'em_execucao', 'concluido'];

export default function EventoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getEvento, updateEvento, deleteEvento, removePrato, updatePorcoes, gerarLista, getLista, toggleItemComprado, addItemExtra, updateItemPreco } = useEventoStore();
  const { getEscalasEvento, voluntarios, escalar, removerEscala } = useVoluntarioStore();
  const { getItensPorEvento, getTotalArrecadado, addItem: addVendaItem, registrarVenda, recolher } = useVendaStore();
  const { produtos, updateProduto } = useProdutoStore();
  const { addIngrediente } = useReceitaStore();
  const { addHistorico, calcularTendencia } = usePrecosStore();

  const [tab, setTab] = useState(0);

  // Modal venda
  const [modalVenda, setModalVenda] = useState(false);
  const [vBusca, setVBusca] = useState('');
  const [vProdId, setVProdId] = useState('');
  const [vQtd, setVQtd] = useState('');
  const [vUnidade, setVUnidade] = useState('kg');
  const [vCusto, setVCusto] = useState('');
  const [vMargem, setVMargem] = useState('10');
  const [vNomeCustom, setVNomeCustom] = useState('');
  const [vShowDrop, setVShowDrop] = useState(false);

  // Modal item extra
  const [modalExtra, setModalExtra] = useState(false);
  const [exBusca, setExBusca] = useState('');
  const [exProdId, setExProdId] = useState('');
  const [exNomeCustom, setExNomeCustom] = useState('');
  const [exQtd, setExQtd] = useState('');
  const [exUnidade, setExUnidade] = useState('un');
  const [exShowDrop, setExShowDrop] = useState(false);
  const [exDestino, setExDestino] = useState<'lista' | 'receita'>('lista');
  const [exReceitaId, setExReceitaId] = useState('');

  // Edição de preço inline
  const [editandoPreco, setEditandoPreco] = useState<string | null>(null);
  const [precoInput, setPrecoInput] = useState('');

  // Popover de tendência
  const [tendenciaPopover, setTendenciaPopover] = useState<string | null>(null);

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
  const itensNormais = listaItens.filter(i => !i.item_extra);
  const itensExtrasLista = listaItens.filter(i => i.item_extra);
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

  const salvarItemExtra = () => {
    if (!lista) return;
    if (!exProdId && !exNomeCustom.trim()) { toast.error('Informe o produto ou nome do item.'); return; }
    if (!exQtd) { toast.error('Informe a quantidade.'); return; }
    const prod = produtos.find(p => p.id === exProdId);
    const qtd = parseFloat(exQtd.replace(',', '.'));

    if (exDestino === 'receita' && exReceitaId && exProdId) {
      const receitaPrato = evento.pratos?.find(p => p.receita_id === exReceitaId);
      addIngrediente(exReceitaId, {
        receita_id: exReceitaId, produto_id: exProdId, produto: prod,
        quantidade: qtd, unidade_medida: exUnidade,
      });
      toast.success(`Adicionado à lista e à receita "${receitaPrato?.receita?.nome}"!`);
    } else {
      toast.success('Item adicionado à lista!');
    }

    addItemExtra(lista.id, {
      produto_id: exProdId || undefined, produto: prod,
      nome_extra: exNomeCustom || prod?.nome,
      quantidade: qtd, unidade: exUnidade,
      preco_estimado: prod ? prod.preco_medio * qtd : undefined,
      comprado: false, item_extra: true,
      categoria: prod?.categoria,
    });

    setModalExtra(false);
    setExBusca(''); setExProdId(''); setExNomeCustom(''); setExQtd(''); setExUnidade('un'); setExDestino('lista'); setExReceitaId('');
  };

  const iniciarEdicaoPreco = (item: ItemLista) => {
    setEditandoPreco(item.id);
    setPrecoInput(item.preco_estimado?.toString() || '');
    setTendenciaPopover(null);
  };

  const salvarPreco = (item: ItemLista, novoPreco: number) => {
    if (!lista || isNaN(novoPreco) || novoPreco < 0) { setEditandoPreco(null); return; }
    updateItemPreco(lista.id, item.id, novoPreco);
    if (item.produto_id && item.quantidade > 0) {
      const precoUnitario = novoPreco / item.quantidade;
      updateProduto(item.produto_id, { preco_medio: precoUnitario });
      addHistorico({ produto_id: item.produto_id, preco: precoUnitario, data: new Date().toISOString(), evento_id: id, evento_nome: evento.nome, origem: 'lista_compras' });
    }
    setEditandoPreco(null);
    toast.success(`Preço atualizado para ${formatarMoeda(novoPreco)}!`);
  };

  function renderItemLista(item: ItemLista) {
    const tendencia = item.produto_id ? calcularTendencia(item.produto_id) : null;
    return (
      <div key={item.id} className={`flex items-center gap-3 p-3 border-b border-border last:border-0 ${item.comprado ? 'opacity-50' : ''}`}>
        <button onClick={() => toggleItemComprado(lista!.id, item.id)} className="shrink-0">
          <CheckCircle size={20} className={item.comprado ? 'text-success' : 'text-border'} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className={`text-sm font-semibold text-text-primary ${item.comprado ? 'line-through' : ''}`}>
              {item.produto?.nome || item.nome_extra}
            </p>
            {item.item_extra && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">Extra</span>
            )}
          </div>
          <p className="text-xs text-text-secondary">{item.quantidade} {item.unidade}</p>
        </div>

        {editandoPreco === item.id ? (
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-text-secondary">R$</span>
            <input
              type="number" step="0.01" defaultValue={item.preco_estimado}
              className="w-20 text-sm text-right border border-primary rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
              onBlur={e => salvarPreco(item, parseFloat(e.target.value))}
              onKeyDown={e => { if (e.key === 'Enter') salvarPreco(item, parseFloat(e.currentTarget.value)); if (e.key === 'Escape') setEditandoPreco(null); }}
            />
            <button onClick={() => setEditandoPreco(null)}><X size={14} className="text-text-secondary" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => iniciarEdicaoPreco(item)} className="flex items-center gap-1 text-xs text-text-secondary hover:text-primary transition-colors">
              {item.preco_estimado ? <span className="font-semibold text-primary">{formatarMoeda(item.preco_estimado)}</span> : <span>—</span>}
              <Pencil size={10} />
            </button>
            {tendencia && tendencia.tendencia !== 'sem_dados' && (
              <div className="relative">
                <button onClick={() => setTendenciaPopover(tendenciaPopover === item.id ? null : item.id)}>
                  {tendencia.tendencia === 'subiu' && <TrendingUp size={10} className="text-red-400" />}
                  {tendencia.tendencia === 'desceu' && <TrendingDown size={10} className="text-green-500" />}
                  {tendencia.tendencia === 'estavel' && <Minus size={10} className="text-gray-400" />}
                </button>
                {tendenciaPopover === item.id && (
                  <div className="absolute right-0 bottom-6 z-30 bg-white border border-orange-100 rounded-xl shadow-lg p-3 w-44 text-xs">
                    <p className="font-bold text-text-primary mb-2">Histórico</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between"><span className="text-text-secondary">Atual:</span><span className="font-semibold">{formatarMoeda(tendencia.precoAtual || 0)}/un</span></div>
                      <div className="flex justify-between"><span className="text-text-secondary">Anterior:</span><span>{formatarMoeda(tendencia.precoAnterior || 0)}/un</span></div>
                      <div className={`flex justify-between font-semibold ${tendencia.tendencia === 'subiu' ? 'text-red-500' : 'text-green-600'}`}>
                        <span>Variação:</span>
                        <span>{tendencia.variacao > 0 ? '+' : ''}{tendencia.variacao.toFixed(1)}%</span>
                      </div>
                    </div>
                    <Link href="/precos/evolucao" className="block mt-2 text-primary text-center text-[11px] hover:underline">Ver histórico completo →</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const inputCls = "w-full px-3 py-2.5 border border-border rounded-xl text-sm text-text-primary bg-background focus:ring-2 focus:ring-primary outline-none";

  const pratosDaReceitas = evento.pratos || [];

  return (
    <div className="space-y-0 animate-in" onClick={() => { if (tendenciaPopover) setTendenciaPopover(null); }}>
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
            <Card className="p-4">
              <p className="font-bold text-text-primary mb-3">Pratos</p>
              {pratosDaReceitas.length === 0 ? (
                <p className="text-sm text-text-secondary italic py-2">Nenhum prato adicionado.</p>
              ) : (
                <div className="space-y-3">
                  {pratosDaReceitas.map(prato => {
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
            <div className="flex gap-2">
              <button onClick={() => { gerarLista(id); toast.success('Lista gerada!'); }} className="flex-1 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-dark transition-colors flex items-center justify-center gap-2">
                <ShoppingBag size={18} />{lista ? 'Atualizar Lista' : 'Gerar Lista de Compras'}
              </button>
              {lista && (
                <button onClick={() => setModalExtra(true)} className="py-3 px-4 bg-white border-2 border-secondary text-secondary font-bold rounded-xl hover:bg-green-50 transition-colors flex items-center gap-1.5 text-sm">
                  <Plus size={16} /> Item
                </button>
              )}
            </div>

            {lista && listaItens.length > 0 && (
              <>
                <Card className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-text-primary">{marcados} de {listaItens.length} comprados</span>
                    <span className="text-sm font-bold text-primary">{Math.round((marcados / listaItens.length) * 100)}%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill bg-secondary" style={{ width: `${(marcados / listaItens.length) * 100}%` }} /></div>
                </Card>

                {/* Itens das receitas agrupados por categoria */}
                {(() => {
                  const porCat: Record<string, ItemLista[]> = {};
                  itensNormais.forEach(i => { const c = i.categoria || 'outros'; if (!porCat[c]) porCat[c] = []; porCat[c].push(i); });
                  return Object.entries(porCat).map(([cat, catItens]) => (
                    <div key={cat}>
                      <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-2 px-1">{LABELS_CATEGORIA_PRODUTO[cat as CategoriaProduto] || cat}</p>
                      <Card className="overflow-hidden">
                        {catItens.map(item => renderItemLista(item))}
                      </Card>
                    </div>
                  ));
                })()}

                {/* Itens extras */}
                {itensExtrasLista.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-2 px-1">Itens Extras</p>
                    <Card className="overflow-hidden">
                      {itensExtrasLista.map(item => renderItemLista(item))}
                    </Card>
                  </div>
                )}

                <div className="flex gap-3 sticky bottom-20 lg:bottom-4">
                  <div className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 shadow-card">
                    <p className="text-xs text-text-secondary">Total estimado</p>
                    <p className="text-lg font-bold text-primary">{formatarMoeda(totalLista)}</p>
                  </div>
                  <button
                    onClick={() => lista?.itens && abrirWhatsApp(formatarListaWhatsApp(evento, lista.itens))}
                    className="flex items-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#1da851] text-white rounded-xl font-semibold text-sm transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
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

      {/* Modal Item Extra */}
      <Modal open={modalExtra} onClose={() => setModalExtra(false)} title="Adicionar Item à Lista">
        <div className="space-y-3">
          <div className="relative">
            <input
              value={exBusca}
              onChange={e => { setExBusca(e.target.value); setExShowDrop(true); setExProdId(''); }}
              onFocus={() => setExShowDrop(true)}
              placeholder="Buscar produto cadastrado..."
              className={inputCls}
            />
            {exProdId && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-success text-xs font-bold">✓</span>}
            {exShowDrop && exBusca && (
              <div className="absolute z-10 w-full bg-surface border border-border rounded-xl shadow-card-md mt-1 max-h-40 overflow-y-auto">
                {produtos.filter(p => p.nome.toLowerCase().includes(exBusca.toLowerCase())).slice(0, 6).map(p => (
                  <button key={p.id} className="flex justify-between w-full px-4 py-2.5 text-sm hover:bg-primary-50 border-b border-border last:border-0" onClick={() => { setExProdId(p.id); setExBusca(p.nome); setExUnidade(p.unidade_compra); setExShowDrop(false); }}>
                    <span>{p.nome}</span><span className="text-text-secondary">{p.unidade_compra}</span>
                  </button>
                ))}
                {produtos.filter(p => p.nome.toLowerCase().includes(exBusca.toLowerCase())).length === 0 && (
                  <p className="px-4 py-3 text-sm text-text-secondary">Nenhum produto encontrado.</p>
                )}
              </div>
            )}
          </div>
          <input value={exNomeCustom} onChange={e => setExNomeCustom(e.target.value)} placeholder="Nome do item (se não estiver no catálogo)" className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <input value={exQtd} onChange={e => setExQtd(e.target.value)} placeholder="Quantidade *" type="number" className={inputCls} />
            <input value={exUnidade} onChange={e => setExUnidade(e.target.value)} placeholder="Unidade" className={inputCls} />
          </div>

          {/* Destino */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-text-primary">Onde adicionar?</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={exDestino === 'lista'} onChange={() => setExDestino('lista')} className="accent-primary" />
              <span className="text-sm text-text-primary">Somente nesta lista de compras</span>
            </label>
            {pratosDaReceitas.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={exDestino === 'receita'} onChange={() => { setExDestino('receita'); if (!exReceitaId && pratosDaReceitas[0]) setExReceitaId(pratosDaReceitas[0].receita_id); }} className="accent-primary" />
                <span className="text-sm text-text-primary">Adicionar também na receita</span>
              </label>
            )}
          </div>

          {exDestino === 'receita' && pratosDaReceitas.length > 1 && (
            <select value={exReceitaId} onChange={e => setExReceitaId(e.target.value)} className={inputCls}>
              {pratosDaReceitas.map(p => (
                <option key={p.receita_id} value={p.receita_id}>{p.receita?.nome}</option>
              ))}
            </select>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={() => setModalExtra(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:bg-gray-50 transition">Cancelar</button>
            <button onClick={salvarItemExtra} className="flex-1 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold hover:bg-secondary-dark transition">Adicionar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
