'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Phone, MessageCircle, Users } from 'lucide-react';
import { useVoluntarioStore } from '@/stores/voluntarioStore';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { abrirWhatsAppContato, ligarPara } from '@/lib/utils';

export default function EquipePage() {
  const { voluntarios } = useVoluntarioStore();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<'ativos' | 'inativos' | 'todos'>('ativos');

  const filtrados = useMemo(() => voluntarios.filter(v => {
    const ok = !busca || v.nome.toLowerCase().includes(busca.toLowerCase());
    const ativo = filtro === 'todos' || (filtro === 'ativos' && v.ativo) || (filtro === 'inativos' && !v.ativo);
    return ok && ativo;
  }), [voluntarios, busca, filtro]);

  return (
    <div className="space-y-5 animate-in">
      <PageHeader title="Equipe" subtitle={`${voluntarios.filter(v => v.ativo).length} voluntários ativos`}
        action={<Link href="/equipe/novo" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors"><Plus size={16} /> Novo</Link>}
      />
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar voluntário..." className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm bg-surface focus:ring-2 focus:ring-primary outline-none" />
      </div>
      <div className="flex gap-2">
        {(['ativos','todos','inativos'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)} className={`flex-1 py-2 rounded-full text-xs font-semibold border transition-colors ${filtro === f ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:border-primary hover:text-primary'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {filtrados.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum voluntário" subtitle="Adicione os membros da equipe." />
      ) : (
        <div className="space-y-3">
          {filtrados.map(v => (
            <Card key={v.id} className="p-4">
              <div className="flex items-center gap-3">
                <Link href={`/equipe/${v.id}`}><Avatar nome={v.nome} size={48} /></Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/equipe/${v.id}`}><p className="font-bold text-text-primary hover:text-primary transition">{v.nome}</p></Link>
                    {!v.ativo && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-text-secondary">Inativo</span>}
                  </div>
                  {v.habilidades.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {v.habilidades.slice(0, 3).map(h => (
                        <span key={h} className="text-xs px-2 py-0.5 rounded-full bg-secondary-100 text-secondary font-semibold">{h}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {v.telefone && (
                    <>
                      <button onClick={() => abrirWhatsAppContato(v.telefone!)} className="p-2 rounded-xl hover:bg-secondary-50 text-secondary transition"><MessageCircle size={18} /></button>
                      <button onClick={() => ligarPara(v.telefone!)} className="p-2 rounded-xl hover:bg-primary-50 text-primary transition"><Phone size={18} /></button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
