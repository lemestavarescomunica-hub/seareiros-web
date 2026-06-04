'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVoluntarioStore } from '@/stores/voluntarioStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

const HABILIDADES = ['Cozinheira(o)', 'Auxiliar de Cozinha', 'Limpeza', 'Compras', 'Montagem', 'Servir', 'Coordenação', 'Transporte'];

export default function NovoVoluntarioPage() {
  const { addVoluntario } = useVoluntarioStore();
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [habilidades, setHabilidades] = useState<string[]>([]);
  const inputCls = "w-full px-3 py-2.5 border border-border rounded-xl text-sm text-text-primary bg-background focus:ring-2 focus:ring-primary outline-none";

  function salvar() {
    if (!nome.trim()) { toast.error('Informe o nome.'); return; }
    addVoluntario({ nome: nome.trim(), telefone: telefone || undefined, role: 'leitor', ativo: true, habilidades, disponibilidade: {} });
    toast.success('Voluntário cadastrado!');
    router.push('/equipe');
  }

  return (
    <div className="space-y-5 animate-in">
      <PageHeader title="Novo Voluntário" backHref="/equipe" />
      <Card className="p-5 space-y-4">
        <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo *" className={inputCls} />
        <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="Telefone (WhatsApp)" type="tel" className={inputCls} />
      </Card>
      <Card className="p-5 space-y-3">
        <p className="font-bold text-text-primary">Habilidades</p>
        <div className="flex flex-wrap gap-2">
          {HABILIDADES.map(h => (
            <button key={h} onClick={() => setHabilidades(p => p.includes(h) ? p.filter(x => x !== h) : [...p, h])}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${habilidades.includes(h) ? 'bg-secondary text-white border-secondary' : 'bg-surface text-text-secondary border-border hover:border-secondary hover:text-secondary'}`}>
              {h}
            </button>
          ))}
        </div>
      </Card>
      <button onClick={salvar} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors">Cadastrar Voluntário</button>
    </div>
  );
}
