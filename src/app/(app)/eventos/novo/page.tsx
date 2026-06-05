'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEventoStore } from '@/stores/eventoStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import type { StatusEvento, TipoRecorrencia } from '@/types';

export default function NovoEventoPage() {
  const { addEvento } = useEventoStore();
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');
  const [horI, setHorI] = useState('');
  const [horF, setHorF] = useState('');
  const [publico, setPublico] = useState('100');
  const [recorrente, setRecorrente] = useState(false);
  const [tipoRec, setTipoRec] = useState<TipoRecorrencia>('semanal');
  const [obs, setObs] = useState('');

  const inputCls = "w-full px-3 py-2.5 border border-border rounded-xl text-sm text-text-primary bg-background focus:ring-2 focus:ring-primary outline-none";

  async function salvar() {
    if (!nome.trim()) { toast.error('Informe o nome do evento.'); return; }
    if (!data) { toast.error('Informe a data do evento.'); return; }
    const evento = await addEvento({ nome: nome.trim(), data_inicio: data, horario_inicio: horI || undefined, horario_fim: horF || undefined, publico_estimado: parseInt(publico) || 100, status: 'planejamento' as StatusEvento, recorrente, tipo_recorrencia: recorrente ? tipoRec : undefined, observacoes: obs.trim() || undefined, pratos: [] });
    toast.success('Evento criado!');
    router.push(`/eventos/${evento.id}`);
  }

  return (
    <div className="space-y-5 animate-in">
      <PageHeader title="Novo Evento" backHref="/eventos" />
      <Card className="p-5 space-y-4">
        <h3 className="font-bold text-text-primary">Informações do Evento</h3>
        <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do evento *" className={inputCls} />
        <input value={data} onChange={e => setData(e.target.value)} placeholder="Data (AAAA-MM-DD) *" type="date" className={inputCls} />
        <div className="grid grid-cols-2 gap-3">
          <input value={horI} onChange={e => setHorI(e.target.value)} placeholder="Horário início" type="time" className={inputCls} />
          <input value={horF} onChange={e => setHorF(e.target.value)} placeholder="Horário fim" type="time" className={inputCls} />
        </div>
        <input value={publico} onChange={e => setPublico(e.target.value)} placeholder="Público estimado *" type="number" className={inputCls} />
      </Card>
      <Card className="p-5 space-y-3">
        <label className="flex items-center justify-between">
          <div>
            <p className="font-bold text-text-primary">Evento Recorrente</p>
            <p className="text-xs text-text-secondary">Sopa semanal, missa mensal...</p>
          </div>
          <input type="checkbox" checked={recorrente} onChange={e => setRecorrente(e.target.checked)} className="accent-primary w-5 h-5" />
        </label>
        {recorrente && (
          <div className="flex gap-2">
            {(['semanal','mensal','anual'] as TipoRecorrencia[]).map(t => (
              <button key={t} onClick={() => setTipoRec(t)} className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-colors ${tipoRec === t ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text-secondary hover:border-primary hover:text-primary'}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        )}
      </Card>
      <Card className="p-5 space-y-3">
        <h3 className="font-bold text-text-primary">Observações</h3>
        <textarea value={obs} onChange={e => setObs(e.target.value)} placeholder="Detalhes, local, observações..." rows={3} className={inputCls + ' resize-none'} />
      </Card>
      <button onClick={salvar} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors">Criar Evento</button>
    </div>
  );
}
