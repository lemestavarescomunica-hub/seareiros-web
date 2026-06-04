'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, CalendarHeart, Users, Repeat } from 'lucide-react';
import { useEventoStore } from '@/stores/eventoStore';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatarDataCurta, formatarMoeda, LABELS_STATUS_EVENTO, CORES_STATUS_EVENTO, calcularCustoReceita } from '@/lib/utils';
import type { StatusEvento } from '@/types';

const FILTROS: { key: StatusEvento | 'todos'; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'planejamento', label: 'Planejamento' },
  { key: 'compras', label: 'Compras' },
  { key: 'em_execucao', label: 'Em Execução' },
  { key: 'concluido', label: 'Concluídos' },
];

export default function EventosPage() {
  const { eventos } = useEventoStore();
  const [filtro, setFiltro] = useState<StatusEvento | 'todos'>('todos');
  const [mostrarConcluidos, setMostrarConcluidos] = useState(false);

  const filtrados = useMemo(() => eventos.filter(e => {
    if (!mostrarConcluidos && e.status === 'concluido' && filtro === 'todos') return false;
    if (filtro !== 'todos' && e.status !== filtro) return false;
    return true;
  }).sort((a, b) => b.data_inicio.localeCompare(a.data_inicio)), [eventos, filtro, mostrarConcluidos]);

  return (
    <div className="space-y-5 animate-in">
      <PageHeader
        title="Eventos"
        subtitle={`${eventos.length} eventos`}
        action={
          <Link href="/eventos/novo" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors">
            <Plus size={16} /> Novo Evento
          </Link>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {FILTROS.map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filtro === f.key ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:border-primary hover:text-primary'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
        <input type="checkbox" checked={mostrarConcluidos} onChange={e => setMostrarConcluidos(e.target.checked)} className="accent-primary" />
        Mostrar concluídos
      </label>

      {filtrados.length === 0 ? (
        <EmptyState icon={CalendarHeart} title="Nenhum evento" subtitle="Crie seu primeiro evento de caridade!" />
      ) : (
        <div className="space-y-3">
          {filtrados.map(e => {
            const { dia, mes } = formatarDataCurta(e.data_inicio);
            const custo = (e.pratos || []).reduce((acc, p) => {
              if (!p.receita?.ingredientes) return acc;
              return acc + calcularCustoReceita(p.receita.ingredientes, p.receita.rendimento_base, p.quantidade_porcoes).total;
            }, 0);
            return (
              <Link key={e.id} href={`/eventos/${e.id}`}>
                <Card hover className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 text-center bg-primary-50 rounded-xl py-2 shrink-0">
                      <div className="text-2xl font-bold text-primary">{dia}</div>
                      <div className="text-xs font-semibold text-primary uppercase">{mes}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text-primary truncate">{e.nome}</p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <StatusBadge label={LABELS_STATUS_EVENTO[e.status]} color={CORES_STATUS_EVENTO[e.status]} size="sm" />
                        <span className="text-xs text-text-secondary flex items-center gap-1"><Users size={12} />{e.publico_estimado}</span>
                        {custo > 0 && <span className="text-xs text-text-secondary">{formatarMoeda(custo)}</span>}
                        {e.recorrente && <Repeat size={12} className="text-secondary" />}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
