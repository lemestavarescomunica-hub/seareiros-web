'use client';
import { useState, useMemo } from 'react';
import { Plus, Search, ShoppingCart, Trash2, Pencil } from 'lucide-react';
import { useProdutoStore } from '@/stores/produtoStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { LABELS_CATEGORIA_PRODUTO, formatarMoeda } from '@/lib/utils';
import type { CategoriaProduto, Produto } from '@/types';
import toast from 'react-hot-toast';

const CATS: CategoriaProduto[] = ['graos','carnes','verduras_legumes','temperos','laticinios','descartaveis','limpeza','bebidas','outros'];
const CORES: Partial<Record<CategoriaProduto, string>> = { graos: '#B8860B', carnes: '#C62828', verduras_legumes: '#5B8C5A', temperos: '#E8C547', laticinios: '#5B8FC3', limpeza: '#5B8FC3' };
const inp = "w-full px-4 py-3 border border-[#E8DDD5] rounded-xl text-sm text-[#3B2F2F] bg-white focus:ring-2 focus:ring-[#D4764E] outline-none placeholder:text-[#7A6B6B]";

export default function ProdutosPage() {
  const { produtos, addProduto, updateProduto, deleteProduto } = useProdutoStore();
  const [busca, setBusca] = useState('');
  const [catFiltro, setCatFiltro] = useState<CategoriaProduto | 'todas'>('todas');
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [nome, setNome] = useState('');
  const [cat, setCat] = useState<CategoriaProduto>('graos');
  const [unidade, setUnidade] = useState('kg');
  const [preco, setPreco] = useState('');
  const [fornecedor, setFornecedor] = useState('');

  const filtrados = useMemo(() => produtos.filter(p =>
    (!busca || p.nome.toLowerCase().includes(busca.toLowerCase())) &&
    (catFiltro === 'todas' || p.categoria === catFiltro)
  ), [produtos, busca, catFiltro]);

  function abrir(p?: Produto) {
    if (p) { setEditando(p); setNome(p.nome); setCat(p.categoria); setUnidade(p.unidade_compra); setPreco(p.preco_medio.toString()); setFornecedor(p.fornecedor || ''); }
    else { setEditando(null); setNome(''); setCat('graos'); setUnidade('kg'); setPreco(''); setFornecedor(''); }
    setModal(true);
  }

  function salvar() {
    if (!nome.trim()) { toast.error('Informe o nome.'); return; }
    const d = { nome: nome.trim(), categoria: cat, unidade_compra: unidade, preco_medio: parseFloat(preco.replace(',', '.')) || 0, fornecedor: fornecedor || undefined };
    if (editando) updateProduto(editando.id, d); else addProduto(d);
    toast.success(editando ? 'Produto atualizado!' : 'Produto cadastrado!');
    setModal(false);
  }

  return (
    <div className="space-y-5 animate-in">
      <PageHeader
        title="Produtos"
        subtitle={`${produtos.length} cadastrados`}
        action={
          <button onClick={() => abrir()} className="flex items-center gap-2 bg-[#D4764E] hover:bg-[#B85A35] text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm">
            <Plus size={16} /> Novo
          </button>
        }
      />

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A6B6B]" />
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar produto..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8DDD5] rounded-xl text-sm text-[#3B2F2F] placeholder:text-[#7A6B6B] focus:ring-2 focus:ring-[#D4764E] outline-none shadow-sm" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {(['todas', ...CATS] as const).map(c => (
          <button key={c} onClick={() => setCatFiltro(c as any)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              catFiltro === c ? 'bg-[#D4764E] text-white border-[#D4764E]' : 'bg-white text-[#7A6B6B] border-[#E8DDD5]'
            }`}>
            {c === 'todas' ? 'Todos' : LABELS_CATEGORIA_PRODUTO[c as CategoriaProduto]}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="Nenhum produto" subtitle="Adicione os ingredientes usados nas receitas." />
      ) : (
        <div className="space-y-2">
          {filtrados.map(p => {
            const cor = CORES[p.categoria] || '#7A6B6B';
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-orange-100 p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: cor + '20' }}>
                  <ShoppingCart size={18} style={{ color: cor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#3B2F2F] truncate">{p.nome}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge label={LABELS_CATEGORIA_PRODUTO[p.categoria]} color={cor} size="sm" />
                    <span className="text-xs text-[#7A6B6B]">{p.unidade_compra}</span>
                  </div>
                </div>
                <p className="font-bold text-[#D4764E] shrink-0 text-sm">{formatarMoeda(p.preco_medio)}</p>
                <div className="flex gap-1">
                  <button onClick={() => abrir(p)} className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-[#D4764E] hover:bg-orange-100 transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => { if (confirm(`Excluir "${p.nome}"?`)) { deleteProduto(p.id); toast.success('Excluído.'); } }} className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar Produto' : 'Novo Produto'} size="sm">
        <div className="space-y-3">
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome *" className={inp} />
          <select value={cat} onChange={e => setCat(e.target.value as CategoriaProduto)} className={inp}>
            {CATS.map(c => <option key={c} value={c}>{LABELS_CATEGORIA_PRODUTO[c]}</option>)}
          </select>
          <input value={unidade} onChange={e => setUnidade(e.target.value)} placeholder="Unidade de compra" className={inp} />
          <input value={preco} onChange={e => setPreco(e.target.value)} placeholder="Preço médio (R$)" type="number" step="0.01" className={inp} />
          <input value={fornecedor} onChange={e => setFornecedor(e.target.value)} placeholder="Fornecedor (opcional)" className={inp} />
          <div className="flex gap-2 pt-1">
            <button onClick={() => setModal(false)} className="flex-1 py-3 border border-[#E8DDD5] rounded-xl text-sm font-semibold text-[#7A6B6B] hover:bg-gray-50">Cancelar</button>
            <button onClick={salvar} className="flex-1 py-3 bg-[#D4764E] text-white rounded-xl text-sm font-bold hover:bg-[#B85A35] transition-colors">Salvar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
