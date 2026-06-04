import { CookingPot, Heart, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';

const FEATURES = ['Cadastro e escalonamento de receitas', 'Gestão de eventos de caridade', 'Lista de compras automática', 'Controle de equipe e turnos', 'Controle de estoque com validade', 'Venda de sobras e arrecadação', 'Compartilhamento via WhatsApp'];

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Configurações" />
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center relative">
            <CookingPot size={32} className="text-white" />
            <Heart size={14} className="absolute bottom-2 right-1 text-accent fill-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">Seareiros</h2>
            <p className="text-text-secondary text-sm">Gestão da Cozinha</p>
            <p className="text-xs text-text-secondary mt-0.5">Versão 1.0.0 (MVP Web)</p>
          </div>
        </div>
        <p className="text-sm text-text-secondary">Aplicativo de gestão para voluntários do Grupo Espírita Seareiros do Bem. Usado para planejar eventos gastronômicos de caridade em Aparecida de Goiânia/GO.</p>
      </Card>
      <Card className="p-5 space-y-3">
        <h3 className="font-bold text-text-primary">Funcionalidades</h3>
        {FEATURES.map(f => (
          <div key={f} className="flex items-center gap-3">
            <CheckCircle size={16} className="text-secondary shrink-0" />
            <p className="text-sm text-text-primary">{f}</p>
          </div>
        ))}
      </Card>
      <p className="text-center text-sm text-text-secondary py-4">Feito com ❤️ para servir ao próximo.</p>
    </div>
  );
}
