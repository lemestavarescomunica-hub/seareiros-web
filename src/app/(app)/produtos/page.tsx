'use client';
import { useState, useMemo } from 'react';
import { Plus, Search, ShoppingCart, Trash2, Pencil } from 'lucide-react';
import { useProdutoStore } from '@/stores/produtoStore';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { LABELS_CATEGORIA_PRODUTO, formatarMoeda } from '@/lib/utils';
import type { CategoriaProduto, Produto } from '@/types';
import toast from 'react-hot-toast';

const CATS: CategoriaProduto[] = ['graos','carnes','verduras_legumes','temperos','laticinios','descartaveis','limpeza','bebidas','outros'];
const CORES: Partial<Record<CategoriaProduto, string>> = { graos: '#B8860B', carnes: '#C62828', verduras_legumes: '#5B8C5A', temperos: '#E8C547', laticinios: '#5B8FC3' };

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

  const filtrados = useMemo(() => produtos.filter(p => (!busca || p.nome.toLowerCase().includes(busca.toLowerCase())) && (catFiltro === 'todas' || p.categoria === catFiltro)), [produtos, busca, catFiltro]);

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

  const inputCls = "w-full px-3 py-2.5 border border-border rounded-xl text-sm text-text-primary bg-background focus:ring-2 focus:ring-primary outline-none";

  return (
    <div className="space-y-5 animate-in">
      <PageHeader title="Produtos" subtitle={`${produtos.length} cadastrados`}
        action={<button onClick={() => abrir()} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition"><Plus size={16} /> Novo</button>}
      />
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar produto..." className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm bg-surface focus:ring-2 focus:ring-primary outline-none" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {(['todas', ...CATS] as const).map(c => (
          <button key={c} onClick={() => setCatFiltro(c as any)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${catFiltro === c ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}>
            {c === 'todas' ? 'Todos' : LABELS_CATEGORIA_PRODUTO[c as CategoriaProduto]}
          </button>
        ))}
      </div>
      {filtrados.length === 0 ? <EmptyState icon={ShoppingCart} title="Nenhum produto" subtitle="Adicione os ingredientes usados nas receitas." /> : (
        <div className="space-y-2">
          {filtrados.map(p => {
            const cor = CORES[p.categoria] || '#7A6B6B';
            return (
              <Card key={p.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cor + '20' }}>
                    <ShoppingCart size={18} style={{ color: cor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary truncate">{p.nome}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge label={LABELS_CATEGORIA_PRODUTO[p.categoria]} color={cor} size="sm" />
                      <span className="text-xs text-text-secondary">{p.unidade_compra}</span>
                    </div>
                  </div>
                  <p className="font-bold text-primary shrink-0">{formatarMoeda(p.preco_medio)}</p>
                  <button onClick={() => abrir(p)} className="p-2 rounded-xl hover:bg-primary-50 text-text-secondary hover:text-primary transition"><Pencil size={15} /></button>
                  <button onClick={() => { if (confirm(`Excluir "${p.nome}"?`)) { deleteProduto(p.id); toast.success('Excluído.'); } }} className="p-2 rounded-xl hover:bg-red-50 text-text-secondary hover:text-error transition"><Trash2 size={15} /></button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar Produto' : 'Novo Produto'} size="sm">
        <div className="space-y-3">
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome *" className={inputCls} />
          <select value={cat} onChange={e => setCat(e.target.value as CategoriaProduto)} className={inputCls}>
            {CATS.map(c => <option key={c} value={c}>{LABELS_CATEGORIA_PRODUTO[c]}</option>)}
          </select>
          <input value={unidade} onChange={e => setUnidade(e.target.value)} placeholder="Unidade de compra" className={inputCls} />
          <input value={preco} onChange={e => setPreco(e.target.value)} placeholder="Preço médio (R$)" type="number" step="0.01" className={inputCls} />
          <input value={fornecedor} onChange={e => setFornecedor(e.target.value)} placeholder="Fornecedor (opcional)" className={inputCls} />
          <div className="flex gap-2 pt-1">
            <button onClick={() => setModal(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:bg-gray-50 transition">Cancelar</button>
            <button onClick={salvar} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition">Salvar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
