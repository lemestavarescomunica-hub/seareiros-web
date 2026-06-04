'use client';
import Link from 'next/link';
import { CookingPot, CalendarPlus, ClipboardList, Users, AlertCircle, AlertTriangle, ChevronRight, DollarSign } from 'lucide-react';
import { useEventoStore } from '@/stores/eventoStore';
import { useEstoqueStore } from '@/stores/estoqueStore';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { contarDias, formatarData, formatarMoeda, LABELS_STATUS_EVENTO, CORES_STATUS_EVENTO, calcularCustoReceita, verificarValidade, textoValidade } from '@/lib/utils';

export default function DashboardPage() {
  const { eventos } = useEventoStore();
  const { getAlertas, getLotesComAlerta } = useEstoqueStore();
  const { user } = useAuthStore();

  const hoje = new Date().toISOString().split('T')[0];
  const proxEvento = eventos
    .filter(e => e.data_inicio >= hoje && e.status !== 'concluido')
    .sort((a, b) => a.data_inicio.localeCompare(b.data_inicio))[0];
  const sopas = eventos.filter(e => e.nome.toLowerCase().includes('sopa') && e.status !== 'concluido');
  const alertasEstoque = getAlertas();
  const lotesAlerta = getLotesComAlerta();
  const dias = proxEvento ? contarDias(proxEvento.data_inicio) : null;

  const custoEvento = (e: typeof proxEvento) => {
    if (!e?.pratos) return 0;
    return e.pratos.reduce((acc, p) => {
      if (!p.receita?.ingredientes) return acc;
      return acc + calcularCustoReceita(p.receita.ingredientes, p.receita.rendimento_base, p.quantidade_porcoes).total;
    }, 0);
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Saudação */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Olá, {user?.nome?.split(' ')[0]} 🙏
        </h1>
        <p className="text-text-secondary text-sm">Seareiros do Bem — Aparecida de Goiânia/GO</p>
      </div>

      {/* Próximo Evento */}
      {proxEvento ? (
        <Link href={`/eventos/${proxEvento.id}`}>
          <Card hover className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <StatusBadge label={LABELS_STATUS_EVENTO[proxEvento.status]} color={CORES_STATUS_EVENTO[proxEvento.status]} />
                <h2 className="text-xl font-bold text-text-primary">{proxEvento.nome}</h2>
                <p className="text-sm text-text-secondary">{formatarData(proxEvento.data_inicio)}</p>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <span className="flex items-center gap-1"><Users size={14} />{proxEvento.publico_estimado} pessoas</span>
                  <span className="flex items-center gap-1"><DollarSign size={14} />{formatarMoeda(custoEvento(proxEvento))}</span>
                </div>
              </div>
              <div className="text-center ml-4 shrink-0">
                {dias !== null && (
                  <>
                    <div className="text-4xl font-bold text-primary">{dias === 0 ? '🎉' : dias < 0 ? '-' : dias}</div>
                    {dias > 0 && <div className="text-xs text-text-secondary">dias</div>}
                    {dias === 0 && <div className="text-xs font-bold text-primary">Hoje!</div>}
                  </>
                )}
              </div>
            </div>
          </Card>
        </Link>
      ) : (
        <Card className="p-5 text-center text-text-secondary">
          <CookingPot size={40} className="mx-auto mb-2 text-primary-200" strokeWidth={1} />
          <p className="font-semibold text-text-primary">Nenhum evento próximo</p>
          <p className="text-sm mt-1">Crie um novo evento para começar</p>
        </Card>
      )}

      {/* Alertas de Validade */}
      {lotesAlerta.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-text-primary mb-2">⏰ Atenção: Validade</h2>
          <div className="space-y-2">
            {lotesAlerta.slice(0, 3).map(lote => {
              const v = verificarValidade(lote.data_validade, lote.alerta_dias_antes);
              return (
                <Link key={lote.id} href="/estoque">
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-card border"
                    style={{ backgroundColor: v.cor + '12', borderColor: v.cor + '40' }}
                  >
                    <AlertTriangle size={18} style={{ color: v.cor }} />
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary text-sm">{lote.produto?.nome || 'Produto'}</p>
                      <p className="text-xs font-semibold" style={{ color: v.cor }}>{lote.quantidade} {lote.unidade} · {textoValidade(v.diasRestantes)}</p>
                    </div>
                    <ChevronRight size={16} className="text-text-secondary" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Sopa da Semana */}
      {sopas.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-text-primary mb-2">Sopa da Semana</h2>
          {sopas.slice(0, 1).map(sopa => (
            <Link key={sopa.id} href={`/eventos/${sopa.id}`}>
              <Card hover className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center shrink-0">
                    <CookingPot size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary">{sopa.nome}</p>
                    <p className="text-xs text-text-secondary">{formatarData(sopa.data_inicio)} · {sopa.publico_estimado} porções</p>
                  </div>
                  <StatusBadge label={LABELS_STATUS_EVENTO[sopa.status]} color={CORES_STATUS_EVENTO[sopa.status]} size="sm" />
                </div>
              </Card>
            </Link>
          ))}
        </section>
      )}

      {/* Alertas de estoque baixo */}
      {alertasEstoque.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-text-primary mb-2">⚠️ Estoque Baixo</h2>
          <div className="space-y-2">
            {alertasEstoque.slice(0, 3).map(a => (
              <Link key={a.id} href="/estoque">
                <div className="flex items-center gap-3 px-4 py-3 rounded-card border border-warning/30 bg-warning/10">
                  <AlertCircle size={18} className="text-warning shrink-0" />
                  <p className="text-sm text-text-primary flex-1">{a.produto?.nome} — {a.quantidade_atual}/{a.quantidade_minima} {a.unidade}</p>
                  <ChevronRight size={16} className="text-text-secondary" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Atalhos rápidos */}
      <section>
        <h2 className="text-base font-bold text-text-primary mb-3">Atalhos Rápidos</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: CalendarPlus, label: 'Novo Evento', href: '/eventos/novo', color: 'text-primary', bg: 'bg-primary-50' },
            { icon: CookingPot, label: 'Nova Receita', href: '/receitas/nova', color: 'text-secondary', bg: 'bg-secondary-50' },
            { icon: ClipboardList, label: 'Lista de Compras', href: '/eventos', color: 'text-accent-dark', bg: 'bg-accent/20' },
            { icon: Users, label: 'Escalar Equipe', href: '/equipe', color: 'text-text-secondary', bg: 'bg-gray-100' },
          ].map(item => (
            <Link key={item.label} href={item.href}>
              <Card hover className="p-5 flex flex-col items-center gap-3 text-center">
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <item.icon size={24} className={item.color} />
                </div>
                <span className="text-sm font-semibold text-text-primary">{item.label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
