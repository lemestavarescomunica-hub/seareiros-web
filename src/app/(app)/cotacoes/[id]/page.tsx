'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, Plus, X, PackageCheck } from 'lucide-react';
import { useCotacaoStore } from '@/stores/cotacaoStore';
import { useProdutoStore } from '@/stores/produtoStore';
import { usePrecosStore } from '@/stores/precosStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { formatarMoeda, abrirWhatsApp, gerarId } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { CotacaoItem } from '@/types';

export default function CotacaoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getCotacao, updatePreco, concluirCotacao, addFornecedor, addItem } = useCotacaoStore();
  const { produtos, updateProduto } = useProdutoStore();
  const { addHistorico } = usePrecosStore();

  const [editando, setEditando] = useState<{ itemId: string; fornecedorId: string } | null>(null);
  const [precoInput, setPrecoInput] = useState('');
  const [modalAddItem, setModalAddItem] = useState(false);
  const [modalAddFor, setModalAddFor] = useState(false);
  const [novoItemBusca, setNovoItemBusca] = useState('');
  const [novoItemProdId, setNovoItemProdId] = useState('');
  const [novoItemNome, setNovoItemNome] = useState('');
  const [novoItemQtd, setNovoItemQtd] = useState('');
  const [novoItemUnidade, setNovoItemUnidade] = useState('kg');
  const [novoItemShowDrop, setNovoItemShowDrop] = useState(false);
  const [novoFornecedor, setNovoFornecedor] = useState('');
  const inputCls = "w-full px-3 py-2.5 border border-border rounded-xl text-sm text-text-primary bg-background focus:ring-2 focus:ring-primary outline-none";

  const cotacao = getCotacao(id);
  if (!cotacao) return <div className="p-8 text-center text-text-secondary">Cotação não encontrada.</div>;

  function iniciarEdicao(itemId: string, fornecedorId: string, precoAtual?: number) {
    setEditando({ itemId, fornecedorId });
    setPrecoInput(precoAtual?.toString() || '');
  }

  function confirmarPreco(itemId: string, fornecedorId: string) {
    const preco = parseFloat(precoInput.replace(',', '.'));
    if (!isNaN(preco) && preco > 0) {
      updatePreco(id, itemId, fornecedorId, preco);
    } else if (precoInput === '' || precoInput === '0') {
      updatePreco(id, itemId, fornecedorId, undefined);
    }
    setEditando(null);
  }

  const aplicarMelhoresPrecos = () => {
    if (!confirm('Atualizar o preço médio de cada produto com o menor preço encontrado?')) return;
    let atualizados = 0;
    for (const item of cotacao.itens) {
      if (!item.produto_id) continue;
      const melhor = item.precos.find(p => p.melhor_preco && p.preco_unitario);
      if (melhor && melhor.preco_unitario) {
        updateProduto(item.produto_id, { preco_medio: melhor.preco_unitario });
        addHistorico({ produto_id: item.produto_id, preco: melhor.preco_unitario, data: new Date().toISOString(), origem: 'cotacao' });
        atualizados++;
      }
    }
    toast.success(`${atualizados} preço(s) atualizado(s)!`);
  };

  const compartilharWhatsApp = () => {
    let texto = `📊 *COTAÇÃO DE PREÇOS*\n📋 ${cotacao.nome}\n\n`;
    for (const item of cotacao.itens) {
      texto += `*${item.nome_produto}* (${item.quantidade} ${item.unidade})\n`;
      for (const f of cotacao.fornecedores) {
        const p = item.precos.find(pr => pr.fornecedor_id === f.id);
        if (p?.preco_unitario) {
          texto += `  ${p.melhor_preco ? '✅' : '▫️'} ${f.nome}: ${formatarMoeda(p.preco_unitario)}/un\n`;
        } else {
          texto += `  ▫️ ${f.nome}: —\n`;
        }
      }
      texto += '\n';
    }
    const totais = cotacao.fornecedores.map(f => {
      const total = cotacao.itens.reduce((s, i) => {
        const p = i.precos.find(pr => pr.fornecedor_id === f.id);
        return s + (p?.preco_unitario ? p.preco_unitario * i.quantidade : 0);
      }, 0);
      return { nome: f.nome, total };
    });
    texto += `*TOTAL POR FORNECEDOR:*\n`;
    totais.forEach(t => { texto += `  ${t.nome}: ${formatarMoeda(t.total)}\n`; });
    const melhor = cotacao.itens.reduce((s, i) => {
      const m = i.precos.find(p => p.melhor_preco && p.preco_unitario);
      return s + (m?.preco_unitario ? m.preco_unitario * i.quantidade : 0);
    }, 0);
    if (melhor > 0) texto += `\n💰 *Melhor cenário: ${formatarMoeda(melhor)}*\n`;
    texto += `_Gerado por Seareiros 🙏_`;
    abrirWhatsApp(texto);
  };

  function salvarNovoItem() {
    const prod = produtos.find(p => p.id === novoItemProdId);
    const nome = novoItemNome.trim() || prod?.nome;
    if (!nome) { toast.error('Informe o nome do item.'); return; }
    if (!novoItemQtd) { toast.error('Informe a quantidade.'); return; }
    addItem(id, { produto_id: novoItemProdId || undefined, nome_produto: nome, quantidade: parseFloat(novoItemQtd.replace(',', '.')), unidade: novoItemUnidade });
    toast.success('Item adicionado!');
    setModalAddItem(false);
    setNovoItemBusca(''); setNovoItemProdId(''); setNovoItemNome(''); setNovoItemQtd(''); setNovoItemUnidade('kg');
  }

  function salvarNovoFornecedor() {
    if (!novoFornecedor.trim()) { toast.error('Informe o nome do fornecedor.'); return; }
    addFornecedor(id, novoFornecedor.trim());
    toast.success('Fornecedor adicionado!');
    setModalAddFor(false);
    setNovoFornecedor('');
  }

  const totaisFornecedores = cotacao.fornecedores.map(f => ({
    ...f,
    total: cotacao.itens.reduce((s, i) => {
      const p = i.precos.find(pr => pr.fornecedor_id === f.id);
      return s + (p?.preco_unitario ? p.preco_unitario * i.quantidade : 0);
    }, 0),
  }));

  const totalMelhorCenario = cotacao.itens.reduce((s, i) => {
    const m = i.precos.find(p => p.melhor_preco && p.preco_unitario);
    return s + (m?.preco_unitario ? m.preco_unitario * i.quantidade : 0);
  }, 0);

  const itensCotados = cotacao.itens.filter(i => i.precos.some(p => p.preco_unitario && p.preco_unitario > 0)).length;

  return (
    <div className="space-y-5 animate-in">
      <PageHeader title={cotacao.nome} subtitle={cotacao.evento_nome} backHref="/cotacoes"
        action={
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cotacao.status === 'concluida' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-[#D4764E]'}`}>
            {cotacao.status === 'concluida' ? 'Concluída' : 'Em andamento'}
          </span>
        }
      />

      {/* Resumo */}
      {totalMelhorCenario > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-800">Melhor cenário (melhores preços de cada fornecedor)</p>
            <p className="text-xl font-bold text-green-700">{formatarMoeda(totalMelhorCenario)}</p>
          </div>
        </div>
      )}

      {/* Progresso */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-text-primary">{itensCotados} de {cotacao.itens.length} itens cotados</span>
          <span className="text-sm font-bold text-primary">{cotacao.itens.length > 0 ? Math.round((itensCotados / cotacao.itens.length) * 100) : 0}%</span>
        </div>
        <div className="progress-bar"><div className="progress-fill bg-primary" style={{ width: `${cotacao.itens.length > 0 ? (itensCotados / cotacao.itens.length) * 100 : 0}%` }} /></div>
      </Card>

      {/* Lista de itens (mobile: card por item) */}
      <div className="space-y-3">
        {cotacao.itens.map(item => (
          <Card key={item.id} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-text-primary">{item.nome_produto}</p>
                <p className="text-xs text-text-secondary">{item.quantidade} {item.unidade}</p>
              </div>
            </div>
            <div className="space-y-2">
              {cotacao.fornecedores.map(f => {
                const preco = item.precos.find(p => p.fornecedor_id === f.id);
                const estaEditando = editando?.itemId === item.id && editando?.fornecedorId === f.id;
                const isMelhor = preco?.melhor_preco && preco?.preco_unitario;
                return (
                  <div key={f.id} className={`flex items-center gap-3 rounded-xl px-3 py-2 border transition-colors ${isMelhor ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent'}`}>
                    <span className={`text-sm flex-1 ${isMelhor ? 'font-bold text-green-800' : 'text-text-secondary'}`}>{f.nome}</span>
                    {estaEditando ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-text-secondary">R$</span>
                        <input
                          type="number" step="0.01" value={precoInput}
                          onChange={e => setPrecoInput(e.target.value)}
                          className="w-20 text-sm text-right border border-primary rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                          autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') confirmarPreco(item.id, f.id); if (e.key === 'Escape') setEditando(null); }}
                          onBlur={() => confirmarPreco(item.id, f.id)}
                        />
                        <button onClick={() => setEditando(null)}><X size={14} className="text-text-secondary" /></button>
                      </div>
                    ) : (
                      <button onClick={() => iniciarEdicao(item.id, f.id, preco?.preco_unitario)} className="flex items-center gap-1.5">
                        {preco?.preco_unitario ? (
                          <span className={`text-sm font-semibold ${isMelhor ? 'text-green-700' : 'text-text-primary'}`}>{formatarMoeda(preco.preco_unitario)}/un</span>
                        ) : (
                          <span className="text-sm text-text-secondary italic">Tocar para informar</span>
                        )}
                        {isMelhor && <CheckCircle2 size={14} className="text-green-600" />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Totais por fornecedor */}
      {totaisFornecedores.some(f => f.total > 0) && (
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="font-bold text-text-primary">Total por Fornecedor</p>
          </div>
          {totaisFornecedores.map(f => (
            <div key={f.id} className="flex justify-between px-4 py-3 border-b border-border last:border-0">
              <span className="text-sm text-text-primary font-medium">{f.nome}</span>
              <span className="text-sm font-bold text-text-primary">{f.total > 0 ? formatarMoeda(f.total) : '—'}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Ações */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <button onClick={() => setModalAddItem(true)} className="flex-1 py-2.5 border-2 border-primary text-primary font-semibold rounded-xl text-sm hover:bg-orange-50 transition flex items-center justify-center gap-1.5">
            <Plus size={16} /> Adicionar Item
          </button>
          <button onClick={() => setModalAddFor(true)} className="flex-1 py-2.5 border-2 border-secondary text-secondary font-semibold rounded-xl text-sm hover:bg-green-50 transition flex items-center justify-center gap-1.5">
            <Plus size={16} /> Fornecedor
          </button>
        </div>
        <button onClick={aplicarMelhoresPrecos} disabled={totalMelhorCenario === 0} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition disabled:opacity-40 flex items-center justify-center gap-2">
          <PackageCheck size={18} /> Aplicar Melhores Preços
        </button>
        <button onClick={compartilharWhatsApp} className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold rounded-xl transition-colors">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Compartilhar via WhatsApp
        </button>
        {cotacao.status === 'em_andamento' && (
          <button onClick={() => { concluirCotacao(id); toast.success('Cotação concluída!'); }} className="w-full py-2.5 border border-secondary text-secondary font-semibold rounded-xl text-sm hover:bg-green-50 transition">
            Concluir Cotação
          </button>
        )}
      </div>

      {/* Modal adicionar item */}
      <Modal open={modalAddItem} onClose={() => setModalAddItem(false)} title="Adicionar Item">
        <div className="space-y-3">
          <div className="relative">
            <input value={novoItemBusca} onChange={e => { setNovoItemBusca(e.target.value); setNovoItemShowDrop(true); setNovoItemProdId(''); }} onFocus={() => setNovoItemShowDrop(true)} placeholder="Buscar produto..." className={inputCls} />
            {novoItemShowDrop && novoItemBusca && (
              <div className="absolute z-10 w-full bg-surface border border-border rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                {produtos.filter(p => p.nome.toLowerCase().includes(novoItemBusca.toLowerCase())).slice(0, 5).map(p => (
                  <button key={p.id} className="flex justify-between w-full px-4 py-2.5 text-sm hover:bg-primary-50 border-b border-border last:border-0" onClick={() => { setNovoItemProdId(p.id); setNovoItemBusca(p.nome); setNovoItemUnidade(p.unidade_compra); setNovoItemShowDrop(false); }}>
                    <span>{p.nome}</span><span className="text-text-secondary">{p.unidade_compra}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <input value={novoItemNome} onChange={e => setNovoItemNome(e.target.value)} placeholder="Nome (se não estiver no catálogo)" className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <input value={novoItemQtd} onChange={e => setNovoItemQtd(e.target.value)} placeholder="Quantidade *" type="number" className={inputCls} />
            <input value={novoItemUnidade} onChange={e => setNovoItemUnidade(e.target.value)} placeholder="Unidade" className={inputCls} />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setModalAddItem(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:bg-gray-50 transition">Cancelar</button>
            <button onClick={salvarNovoItem} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition">Adicionar</button>
          </div>
        </div>
      </Modal>

      {/* Modal adicionar fornecedor */}
      <Modal open={modalAddFor} onClose={() => setModalAddFor(false)} title="Novo Fornecedor">
        <div className="space-y-3">
          <input value={novoFornecedor} onChange={e => setNovoFornecedor(e.target.value)} placeholder="Nome do fornecedor *" className={inputCls} autoFocus onKeyDown={e => e.key === 'Enter' && salvarNovoFornecedor()} />
          <div className="flex gap-2 pt-1">
            <button onClick={() => setModalAddFor(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:bg-gray-50 transition">Cancelar</button>
            <button onClick={salvarNovoFornecedor} className="flex-1 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold hover:bg-secondary-dark transition">Adicionar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
