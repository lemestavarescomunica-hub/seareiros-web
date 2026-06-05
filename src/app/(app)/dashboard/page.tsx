'use client';
import Link from 'next/link';
import { CookingPot, CalendarPlus, ClipboardList, Users, AlertCircle, AlertTriangle, ChevronRight, Bell, Calendar, CalendarHeart } from 'lucide-react';
import { useEventoStore } from '@/stores/eventoStore';
import { useEstoqueStore } from '@/stores/estoqueStore';
import { useSession } from 'next-auth/react';
import { contarDias, formatarData, formatarMoeda, LABELS_STATUS_EVENTO, CORES_STATUS_EVENTO, calcularCustoReceita, verificarValidade, textoValidade } from '@/lib/utils';

export default function DashboardPage() {
  const { eventos } = useEventoStore();
  const { getAlertas, getLotesComAlerta } = useEstoqueStore();
  const { data: session } = useSession();

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3B2F2F]">Olá, {session?.user?.name?.split(' ')[0]} 🙏</h1>
          <p className="text-sm text-[#7A6B6B]">Seareiros do Bem — Aparecida de Goiânia/GO</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-white border border-orange-100 flex items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(59,47,47,0.08)' }}>
          <Bell size={20} className="text-[#D4764E]" />
        </button>
      </div>

      {/* Card Hero — Próximo Evento */}
      {proxEvento ? (
        <Link href={`/eventos/${proxEvento.id}`}>
          <div className="rounded-2xl p-6 text-white cursor-pointer active:scale-[0.99] transition-transform" style={{ background: 'linear-gradient(135deg, #D4764E, #B85A35)', boxShadow: '0 8px 24px rgba(212,118,78,0.35)' }}>
            <div className="flex items-center gap-2 mb-1">
              <CalendarHeart size={16} className="opacity-80" />
              <span className="text-xs font-medium opacity-80">Próximo Evento</span>
            </div>
            <h2 className="text-xl font-bold mb-2">{proxEvento.nome}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm opacity-90 mb-4">
              <span className="flex items-center gap-1"><Calendar size={13} />{formatarData(proxEvento.data_inicio)}</span>
              <span className="flex items-center gap-1"><Users size={13} />{proxEvento.publico_estimado} pessoas</span>
              <span className="font-semibold">{formatarMoeda(custoEvento(proxEvento))}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                {dias === 0 ? 'Hoje!' : dias === 1 ? 'Amanhã' : dias && dias > 0 ? `Em ${dias} dias` : 'Passou'}
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                {LABELS_STATUS_EVENTO[proxEvento.status]}
              </span>
            </div>
          </div>
        </Link>
      ) : (
        <div className="bg-white rounded-2xl border border-orange-100 p-8 text-center" style={{ boxShadow: '0 2px 8px rgba(59,47,47,0.08)' }}>
          <CookingPot size={48} className="mx-auto mb-3 text-orange-200" strokeWidth={1} />
          <p className="font-bold text-[#3B2F2F]">Nenhum evento próximo</p>
          <p className="text-sm text-[#7A6B6B] mt-1">Crie um novo evento para começar</p>
          <Link href="/eventos/novo" className="inline-flex items-center gap-2 mt-4 bg-[#D4764E] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#B85A35] transition-colors">
            <CalendarPlus size={16} /> Criar Evento
          </Link>
        </div>
      )}

      {/* Alertas de Validade */}
      {lotesAlerta.length > 0 && (
        <section>
          <h3 className="text-base font-bold text-[#3B2F2F] mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            Atenção: Validade
          </h3>
          <div className="space-y-2">
            {lotesAlerta.slice(0, 3).map(lote => {
              const v = verificarValidade(lote.data_validade, lote.alerta_dias_antes);
              return (
                <Link key={lote.id} href="/estoque">
                  <div className="bg-white rounded-xl border p-4 flex items-center gap-3 hover:shadow-md transition-shadow" style={{ borderColor: v.cor + '40', boxShadow: '0 2px 8px rgba(59,47,47,0.06)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: v.cor + '20' }}>
                      <AlertTriangle size={18} style={{ color: v.cor }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#3B2F2F] text-sm">{lote.produto?.nome || 'Produto'}</p>
                      <p className="text-xs font-semibold" style={{ color: v.cor }}>{lote.quantidade} {lote.unidade} · {textoValidade(v.diasRestantes)}</p>
                    </div>
                    <ChevronRight size={16} className="text-[#7A6B6B]" />
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
          <h3 className="text-base font-bold text-[#3B2F2F] mb-3 flex items-center gap-2">
            <CookingPot size={18} className="text-[#5B8C5A]" />
            Sopa da Semana
          </h3>
          {sopas.slice(0, 1).map(sopa => (
            <Link key={sopa.id} href={`/eventos/${sopa.id}`}>
              <div className="bg-white rounded-2xl border border-orange-100 p-4 flex items-center gap-3 hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 8px rgba(59,47,47,0.08)' }}>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CookingPot size={22} className="text-[#5B8C5A]" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#3B2F2F]">{sopa.nome}</p>
                  <p className="text-sm text-[#7A6B6B]">{formatarData(sopa.data_inicio)} · {sopa.publico_estimado} porções</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ color: CORES_STATUS_EVENTO[sopa.status], backgroundColor: CORES_STATUS_EVENTO[sopa.status] + '20' }}>
                  {LABELS_STATUS_EVENTO[sopa.status]}
                </span>
                <ChevronRight size={16} className="text-[#7A6B6B]" />
              </div>
            </Link>
          ))}
        </section>
      )}

      {/* Estoque Baixo */}
      {alertasEstoque.length > 0 && (
        <section>
          <h3 className="text-base font-bold text-[#3B2F2F] mb-3 flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-500" />
            Estoque Baixo
          </h3>
          <div className="space-y-2">
            {alertasEstoque.slice(0, 3).map(a => {
              const pct = a.quantidade_minima > 0 ? a.quantidade_atual / a.quantidade_minima : 0;
              const cor = pct >= 0.5 ? '#F57F17' : '#C62828';
              return (
                <Link key={a.id} href="/estoque">
                  <div className="bg-white rounded-xl border border-orange-100 p-4 flex items-center gap-3 hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 8px rgba(59,47,47,0.06)' }}>
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <AlertCircle size={18} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#3B2F2F] text-sm">{a.produto?.nome}</p>
                      <p className="text-xs text-[#7A6B6B]">{a.quantidade_atual} de {a.quantidade_minima} {a.unidade}</p>
                    </div>
                    <div className="w-20">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct * 100, 100)}%`, backgroundColor: cor }} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Atalhos Rápidos */}
      <section>
        <h3 className="text-base font-bold text-[#3B2F2F] mb-3">Atalhos Rápidos</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/eventos/novo', label: 'Novo Evento', icon: CalendarPlus, bg: 'bg-orange-100', color: 'text-[#D4764E]' },
            { href: '/receitas/nova', label: 'Nova Receita', icon: CookingPot, bg: 'bg-green-100', color: 'text-[#5B8C5A]' },
            { href: '/eventos', label: 'Lista de Compras', icon: ClipboardList, bg: 'bg-yellow-100', color: 'text-[#C9A825]' },
            { href: '/equipe', label: 'Escalar Equipe', icon: Users, bg: 'bg-orange-100', color: 'text-[#D4764E]' },
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <div className="bg-white rounded-2xl border border-orange-100 p-4 flex flex-col items-center gap-3 hover:shadow-md transition-shadow active:scale-95 cursor-pointer" style={{ boxShadow: '0 2px 8px rgba(59,47,47,0.08)' }}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.bg}`}>
                  <item.icon size={24} className={item.color} />
                </div>
                <span className="text-sm font-semibold text-[#3B2F2F] text-center">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
