'use client';
import { useVendaStore } from '@/stores/vendaStore';
import { useEventoStore } from '@/stores/eventoStore';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatarMoeda } from '@/lib/utils';
import { Tag, DollarSign } from 'lucide-react';

export default function VendasPage() {
  const { itens, getTotalGeralArrecadado } = useVendaStore();
  const { eventos } = useEventoStore();
  const total = getTotalGeralArrecadado();
  const ativos = itens.filter(i => i.status !== 'recolhido');
  const statusCor: Record<string, string> = { disponivel: '#2E7D32', esgotado: '#C62828', recolhido: '#7A6B6B' };
  const statusLabel: Record<string, string> = { disponivel: 'Disponível', esgotado: 'Esgotado', recolhido: 'Recolhido' };

  return (
    <div className="space-y-5 animate-in">
      <PageHeader title="Itens à Venda" subtitle="Visão geral de arrecadação" />
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/15 flex items-center justify-center">
            <DollarSign size={24} className="text-success" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Total Arrecadado</p>
            <p className="text-3xl font-bold text-success">{formatarMoeda(total)}</p>
            <p className="text-xs text-text-secondary mt-0.5">{ativos.length} itens ativos</p>
          </div>
        </div>
      </Card>
      {ativos.length === 0 ? (
        <EmptyState icon={Tag} title="Nenhum item à venda" subtitle="Adicione itens na aba Sobras de cada evento." />
      ) : (
        <div className="space-y-3">
          {ativos.map(item => {
            const nome = item.nome_personalizado || item.produto?.nome || 'Item';
            const evento = eventos.find(e => e.id === item.evento_id);
            const prog = item.quantidade_disponivel > 0 ? item.quantidade_vendida / item.quantidade_disponivel : 0;
            return (
              <Card key={item.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-text-primary">{nome}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{evento?.nome || 'Evento'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatarMoeda(item.preco_venda)}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: statusCor[item.status], backgroundColor: statusCor[item.status] + '20' }}>{statusLabel[item.status]}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-text-secondary mb-1">
                    <span>{item.quantidade_vendida}/{item.quantidade_disponivel} {item.unidade} vendidos</span>
                    <span className="font-semibold text-success">Arrecadado: {formatarMoeda(item.receita_total)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border overflow-hidden"><div className="h-full rounded-full bg-success transition-all" style={{ width: `${prog * 100}%` }} /></div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
