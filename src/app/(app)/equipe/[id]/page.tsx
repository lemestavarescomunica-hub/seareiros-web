'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useVoluntarioStore } from '@/stores/voluntarioStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { abrirWhatsAppContato, ligarPara } from '@/lib/utils';
import { MessageCircle, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const HABILIDADES = ['Cozinheira(o)', 'Auxiliar de Cozinha', 'Limpeza', 'Compras', 'Montagem', 'Servir', 'Coordenação', 'Transporte'];

export default function VoluntarioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { voluntarios, updateVoluntario } = useVoluntarioStore();
  const v = voluntarios.find(x => x.id === id);
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(v?.nome || '');
  const [telefone, setTelefone] = useState(v?.telefone || '');
  const [habilidades, setHabilidades] = useState<string[]>(v?.habilidades || []);
  const [ativo, setAtivo] = useState(v?.ativo ?? true);

  if (!v) return <div className="p-8 text-center text-text-secondary">Voluntário não encontrado.</div>;

  const inputCls = "w-full px-3 py-2.5 border border-border rounded-xl text-sm text-text-primary bg-background focus:ring-2 focus:ring-primary outline-none";

  function salvar() { updateVoluntario(id, { nome, telefone, habilidades, ativo }); toast.success('Perfil atualizado!'); setEditando(false); }

  return (
    <div className="space-y-5 animate-in">
      <PageHeader title="Perfil" backHref="/equipe"
        action={<button onClick={() => editando ? salvar() : setEditando(true)} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition">{editando ? 'Salvar' : 'Editar'}</button>}
      />
      <Card className="p-6 flex flex-col items-center gap-3">
        <Avatar nome={v.nome} size={72} />
        {!editando ? (
          <>
            <h2 className="text-xl font-bold text-text-primary">{v.nome}</h2>
            {v.telefone && (
              <div className="flex gap-3">
                <button onClick={() => abrirWhatsAppContato(v.telefone!)} className="flex items-center gap-2 px-4 py-2 bg-secondary-50 text-secondary rounded-xl text-sm font-semibold hover:bg-secondary-100 transition"><MessageCircle size={16} /> WhatsApp</button>
                <button onClick={() => ligarPara(v.telefone!)} className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary rounded-xl text-sm font-semibold hover:bg-primary-100 transition"><Phone size={16} /> Ligar</button>
              </div>
            )}
          </>
        ) : (
          <div className="w-full space-y-3">
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome" className={inputCls} />
            <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="Telefone" className={inputCls} />
            <label className="flex items-center justify-between text-sm font-semibold text-text-primary">
              Voluntário ativo
              <input type="checkbox" checked={ativo} onChange={e => setAtivo(e.target.checked)} className="accent-primary w-5 h-5" />
            </label>
          </div>
        )}
      </Card>
      <Card className="p-5 space-y-3">
        <p className="font-bold text-text-primary">Habilidades</p>
        <div className="flex flex-wrap gap-2">
          {HABILIDADES.map(h => (
            <button key={h} disabled={!editando} onClick={() => setHabilidades(p => p.includes(h) ? p.filter(x => x !== h) : [...p, h])}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${habilidades.includes(h) ? 'bg-secondary text-white border-secondary' : 'bg-surface text-text-secondary border-border'} ${editando ? 'hover:border-secondary hover:text-secondary cursor-pointer' : 'cursor-default'}`}>
              {h}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
