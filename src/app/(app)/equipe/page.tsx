'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Users, Phone, MessageCircle } from 'lucide-react';
import { useVoluntarioStore } from '@/stores/voluntarioStore';
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
      <PageHeader
        title="Equipe"
        subtitle={`${voluntarios.filter(v => v.ativo).length} voluntários ativos`}
        action={
          <Link href="/equipe/novo" className="flex items-center gap-2 bg-[#D4764E] hover:bg-[#B85A35] text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm">
            <Plus size={16} /> Novo
          </Link>
        }
      />

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A6B6B]" />
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar voluntário..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8DDD5] rounded-xl text-sm text-[#3B2F2F] placeholder:text-[#7A6B6B] focus:ring-2 focus:ring-[#D4764E] outline-none shadow-sm" />
      </div>

      <div className="flex gap-2">
        {(['ativos', 'todos', 'inativos'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`flex-1 py-2 rounded-full text-xs font-semibold border transition-colors ${
              filtro === f ? 'bg-[#D4764E] text-white border-[#D4764E]' : 'bg-white text-[#7A6B6B] border-[#E8DDD5]'
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum voluntário" subtitle="Adicione os membros da equipe." />
      ) : (
        <div className="space-y-3">
          {filtrados.map(v => (
            <div key={v.id} className="bg-white rounded-2xl border border-orange-100 p-4 flex items-center gap-3 shadow-sm">
              <Link href={`/equipe/${v.id}`}><Avatar nome={v.nome} size={48} fotoUrl={v.avatar_url} /></Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/equipe/${v.id}`}>
                    <p className="font-bold text-[#3B2F2F] hover:text-[#D4764E] transition-colors">{v.nome}</p>
                  </Link>
                  {!v.ativo && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-[#7A6B6B]">Inativo</span>}
                </div>
                {v.habilidades.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {v.habilidades.slice(0, 3).map(h => (
                      <span key={h} className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-[#5B8C5A] font-semibold">{h}</span>
                    ))}
                  </div>
                )}
              </div>
              {v.telefone && (
                <div className="flex gap-1">
                  <button onClick={() => abrirWhatsAppContato(v.telefone!)} className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-[#25D366] hover:bg-green-100 transition-colors" title="WhatsApp">
                    <MessageCircle size={17} />
                  </button>
                  <button onClick={() => ligarPara(v.telefone!)} className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[#D4764E] hover:bg-orange-100 transition-colors" title="Ligar">
                    <Phone size={17} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
