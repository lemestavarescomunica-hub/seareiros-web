'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { useReceitaStore } from '@/stores/receitaStore';
import { useProdutoStore } from '@/stores/produtoStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { LABELS_CATEGORIA_RECEITA, gerarId } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { CategoriaReceita, ReceitaIngrediente } from '@/types';

const CATEGORIAS: CategoriaReceita[] = ['sopa_semanal','caldos','prato_principal','lanche','sobremesa','almoco_trabalhadores','outros'];

export default function NovaReceitaPage() {
  const { addReceita } = useReceitaStore();
  const { produtos } = useProdutoStore();
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<CategoriaReceita>('sopa_semanal');
  const [rendimento, setRendimento] = useState('50');
  const [unidade, setUnidade] = useState('porções');
  const [tempo, setTempo] = useState('');
  const [preparo, setPreparo] = useState('');
  const [obs, setObs] = useState('');
  const [ingredientes, setIngredientes] = useState<ReceitaIngrediente[]>([]);
  const [busca, setBusca] = useState('');
  const [prodSel, setProdSel] = useState('');
  const [ingQtd, setIngQtd] = useState('');
  const [ingUnidade, setIngUnidade] = useState('kg');
  const [showDrop, setShowDrop] = useState(false);

  const produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 6);

  function adicionarIngrediente() {
    const prod = produtos.find(p => p.id === prodSel);
    if (!prod || !ingQtd) return;
    setIngredientes(prev => [...prev, { id: gerarId(), receita_id: '', produto_id: prod.id, produto: prod, quantidade: parseFloat(ingQtd.replace(',', '.')), unidade_medida: ingUnidade }]);
    setBusca(''); setProdSel(''); setIngQtd('');
  }

  function salvar() {
    if (!nome.trim()) { toast.error('Informe o nome da receita.'); return; }
    addReceita({ nome: nome.trim(), categoria, rendimento_base: parseInt(rendimento) || 50, unidade_rendimento: unidade, tempo_preparo_minutos: tempo ? parseInt(tempo) : undefined, modo_preparo: preparo.trim() || undefined, observacoes: obs.trim() || undefined, ingredientes });
    toast.success('Receita salva!');
    router.push('/receitas');
  }

  const inputCls = "w-full px-3 py-2.5 border border-border rounded-xl text-sm text-text-primary bg-background focus:ring-2 focus:ring-primary outline-none";

  return (
    <div className="space-y-5 animate-in">
      <PageHeader title="Nova Receita" backHref="/receitas" />

      <Card className="p-5 space-y-4">
        <h3 className="font-bold text-text-primary">Informações Básicas</h3>
        <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome da receita *" className={inputCls} />
        <select value={categoria} onChange={e => setCategoria(e.target.value as CategoriaReceita)} className={inputCls}>
          {CATEGORIAS.map(c => <option key={c} value={c}>{LABELS_CATEGORIA_RECEITA[c]}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input value={rendimento} onChange={e => setRendimento(e.target.value)} placeholder="Rendimento *" type="number" className={inputCls} />
          <input value={unidade} onChange={e => setUnidade(e.target.value)} placeholder="Unidade" className={inputCls} />
        </div>
        <input value={tempo} onChange={e => setTempo(e.target.value)} placeholder="Tempo de preparo (minutos)" type="number" className={inputCls} />
      </Card>

      <Card className="p-5 space-y-3">
        <h3 className="font-bold text-text-primary">Ingredientes</h3>
        {ingredientes.map(ing => (
          <div key={ing.id} className="flex items-center gap-2 py-2 border-b border-border">
            <span className="flex-1 text-sm text-text-primary">{ing.produto?.nome}</span>
            <span className="text-sm text-text-secondary">{ing.quantidade} {ing.unidade_medida}</span>
            <button onClick={() => setIngredientes(prev => prev.filter(i => i.id !== ing.id))} className="text-error hover:text-error/70 transition p-1"><X size={14} /></button>
          </div>
        ))}
        <div className="relative">
          <input value={busca} onChange={e => { setBusca(e.target.value); setShowDrop(true); setProdSel(''); }} onFocus={() => setShowDrop(true)} placeholder="Buscar produto..." className={inputCls} />
          {prodSel && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-success text-xs font-bold">✓</span>}
          {showDrop && busca && (
            <div className="absolute z-10 w-full bg-surface border border-border rounded-xl shadow-card-md mt-1 max-h-48 overflow-y-auto">
              {produtosFiltrados.map(p => (
                <button key={p.id} className="flex justify-between w-full px-4 py-2.5 text-sm text-left hover:bg-primary-50 border-b border-border last:border-0" onClick={() => { setProdSel(p.id); setBusca(p.nome); setIngUnidade(p.unidade_compra); setShowDrop(false); }}>
                  <span>{p.nome}</span><span className="text-text-secondary">{p.unidade_compra}</span>
                </button>
              ))}
              {produtosFiltrados.length === 0 && <p className="px-4 py-3 text-sm text-text-secondary">Nenhum produto encontrado.</p>}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input value={ingQtd} onChange={e => setIngQtd(e.target.value)} placeholder="Qtd" type="number" className={inputCls} />
          <input value={ingUnidade} onChange={e => setIngUnidade(e.target.value)} placeholder="Unidade" className={inputCls} />
        </div>
        <button onClick={adicionarIngrediente} disabled={!prodSel || !ingQtd} className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark disabled:opacity-40 transition">
          <Plus size={16} /> Adicionar Ingrediente
        </button>
      </Card>

      <Card className="p-5 space-y-3">
        <h3 className="font-bold text-text-primary">Modo de Preparo</h3>
        <textarea value={preparo} onChange={e => setPreparo(e.target.value)} placeholder="Escreva os passos (um por linha)..." rows={5} className={inputCls + ' resize-none'} />
      </Card>

      <Card className="p-5 space-y-3">
        <h3 className="font-bold text-text-primary">Observações</h3>
        <textarea value={obs} onChange={e => setObs(e.target.value)} placeholder="Dicas, segredos da receita..." rows={3} className={inputCls + ' resize-none'} />
      </Card>

      <button onClick={salvar} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors">
        Salvar Receita
      </button>
    </div>
  );
}
