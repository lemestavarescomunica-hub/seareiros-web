'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, Plus, X, Trash2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useCotacaoStore } from '@/stores/cotacaoStore';
import { useEventoStore } from '@/stores/eventoStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { formatarMoeda, formatarData } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CotacoesPage() {
  const router = useRouter();
  const { cotacoes, addCotacao, deleteCotacao } = useCotacaoStore();
  const { eventos, getLista } = useEventoStore();
  const [modal, setModal] = useState(false);
  const [nome, setNome] = useState('');
  const [eventoId, setEventoId] = useState('');
  const [importarDeLista, setImportarDeLista] = useState(false);
  const [fornecedores, setFornecedores] = useState(['', '']);
  const inputCls = "w-full px-3 py-2.5 border border-border rounded-xl text-sm text-text-primary bg-background focus:ring-2 focus:ring-primary outline-none";

  const eventosComLista = eventos.filter(e => getLista(e.id));

  function abrirModal() {
    setNome('');
    setEventoId('');
    setImportarDeLista(false);
    setFornecedores(['', '']);
    setModal(true);
  }

  function addFornecedor() {
    if (fornecedores.length >= 5) return;
    setFornecedores(prev => [...prev, '']);
  }

  function removeFornecedor(i: number) {
    if (fornecedores.length <= 2) return;
    setFornecedores(prev => prev.filter((_, idx) => idx !== i));
  }

  async function criar() {
    const nomeFinal = nome.trim() || `Cotação ${new Date().toLocaleDateString('pt-BR')}`;
    const forsFiltrados = fornecedores.map(f => f.trim()).filter(Boolean);
    if (forsFiltrados.length < 2) { toast.error('Informe pelo menos 2 fornecedores.'); return; }

    let itens: { produto_id?: string; nome_produto: string; quantidade: number; unidade: string }[] = [];
    let eventoNome: string | undefined;
    let eId: string | undefined;

    if (importarDeLista && eventoId) {
      const ev = eventos.find(e => e.id === eventoId);
      const lista = ev ? getLista(ev.id) : null;
      eventoNome = ev?.nome;
      eId = eventoId;
      if (lista?.itens) {
        itens = lista.itens.map(i => ({
          produto_id: i.produto_id,
          nome_produto: i.produto?.nome || i.nome_extra || 'Item',
          quantidade: i.quantidade,
          unidade: i.unidade,
        }));
      }
    }

    const c = await addCotacao({ nome: nomeFinal, evento_id: eId, evento_nome: eventoNome, fornecedores: forsFiltrados, itens });
    toast.success('Cotação criada!');
    setModal(false);
    router.push(`/cotacoes/${c.id}`);
  }

  const sorted = [...cotacoes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-5 animate-in">
      <PageHeader
        title="Cotação de Preços"
        backHref="/mais"
        action={
          <button onClick={abrirModal} className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-xl text-sm hover:bg-primary-dark transition-colors">
            <Plus size={16} /> Nova
          </button>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="Nenhuma cotação ainda"
          subtitle="Crie uma cotação para comparar preços entre fornecedores."
        />
      ) : (
        <div className="space-y-3">
          {sorted.map(c => {
            const totalMelhor = c.itens.reduce((sum, item) => {
              const melhores = item.precos.filter(p => p.melhor_preco && p.preco_unitario);
              if (melhores.length) return sum + melhores[0].preco_unitario! * item.quantidade;
              return sum;
            }, 0);
            const itensCotados = c.itens.filter(i => i.precos.some(p => p.preco_unitario !== undefined && p.preco_unitario > 0)).length;
            return (
              <Card key={c.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-text-primary">{c.nome}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.status === 'concluida' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-[#D4764E]'}`}>
                        {c.status === 'concluida' ? 'Concluída' : 'Em andamento'}
                      </span>
                    </div>
                    {c.evento_nome && <p className="text-xs text-text-secondary mt-0.5">{c.evento_nome}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary flex-wrap">
                      <span>{c.itens.length} itens</span>
                      <span>{c.fornecedores.length} fornecedores</span>
                      <span>{itensCotados} cotados</span>
                      {totalMelhor > 0 && <span className="font-semibold text-success">Melhor: {formatarMoeda(totalMelhor)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { if (confirm('Excluir cotação?')) { deleteCotacao(c.id); toast.success('Cotação excluída.'); } }} className="p-1.5 text-text-secondary hover:text-error transition">
                      <Trash2 size={14} />
                    </button>
                    <button onClick={() => router.push(`/cotacoes/${c.id}`)} className="p-1.5 text-text-secondary hover:text-primary transition">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Nova Cotação">
        <div className="space-y-4">
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder={`Cotação ${new Date().toLocaleDateString('pt-BR')}`} className={inputCls} />

          {eventosComLista.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-text-primary">Importar itens de:</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={!importarDeLista} onChange={() => setImportarDeLista(false)} className="accent-primary" />
                <span className="text-sm text-text-primary">Lista vazia (adicionar itens manualmente)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={importarDeLista} onChange={() => { setImportarDeLista(true); if (!eventoId && eventosComLista[0]) setEventoId(eventosComLista[0].id); }} className="accent-primary" />
                <span className="text-sm text-text-primary">Lista de compras de um evento</span>
              </label>
              {importarDeLista && (
                <select value={eventoId} onChange={e => setEventoId(e.target.value)} className={inputCls}>
                  {eventosComLista.map(e => (
                    <option key={e.id} value={e.id}>{e.nome} — {formatarData(e.data_inicio)}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-semibold text-text-primary">Fornecedores (mínimo 2)</p>
            {fornecedores.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input value={f} onChange={e => { const n = [...fornecedores]; n[i] = e.target.value; setFornecedores(n); }} placeholder={`Fornecedor ${i + 1} *`} className={inputCls} />
                {fornecedores.length > 2 && (
                  <button onClick={() => removeFornecedor(i)} className="p-2 text-error hover:text-error/70 transition shrink-0"><X size={16} /></button>
                )}
              </div>
            ))}
            {fornecedores.length < 5 && (
              <button onClick={addFornecedor} className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark transition font-semibold">
                <Plus size={14} /> Adicionar fornecedor
              </button>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={() => setModal(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:bg-gray-50 transition">Cancelar</button>
            <button onClick={criar} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition">Criar Cotação</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
