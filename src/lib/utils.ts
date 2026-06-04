import type {
  ReceitaIngrediente,
  ReceitaIngredienteEscalado,
  EventoPrato,
  ItemLista,
  Evento,
  CategoriaProduto,
} from '../types';

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarData(data: string): string {
  const d = new Date(data + 'T00:00:00');
  return d.toLocaleDateString('pt-BR');
}

export function formatarDataCurta(data: string): { dia: string; mes: string } {
  const d = new Date(data + 'T00:00:00');
  const dia = d.getDate().toString().padStart(2, '0');
  const mes = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  return { dia, mes };
}

export function contarDias(data: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(data + 'T00:00:00');
  return Math.ceil((alvo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatarTempo(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function gerarId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function agora(): string {
  return new Date().toISOString();
}

export const LABELS_CATEGORIA_PRODUTO: Record<CategoriaProduto, string> = {
  graos: 'Grãos',
  carnes: 'Carnes',
  verduras_legumes: 'Verduras e Legumes',
  temperos: 'Temperos',
  laticinios: 'Laticínios',
  descartaveis: 'Descartáveis',
  limpeza: 'Limpeza',
  bebidas: 'Bebidas',
  outros: 'Outros',
};

export const LABELS_CATEGORIA_RECEITA: Record<string, string> = {
  sopa_semanal: 'Sopa Semanal',
  caldos: 'Caldos',
  prato_principal: 'Prato Principal',
  lanche: 'Lanche',
  sobremesa: 'Sobremesa',
  almoco_trabalhadores: 'Almoço Trabalhadores',
  outros: 'Outros',
};

export const LABELS_STATUS_EVENTO: Record<string, string> = {
  planejamento: 'Planejamento',
  compras: 'Compras',
  em_execucao: 'Em Execução',
  concluido: 'Concluído',
};

export const LABELS_TURNO: Record<string, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
  limpeza: 'Limpeza',
};

export const CORES_STATUS_EVENTO: Record<string, string> = {
  planejamento: '#7A6B6B',
  compras: '#F57F17',
  em_execucao: '#5B8C5A',
  concluido: '#2E7D32',
};

export const CORES_STATUS_CONFIRMACAO: Record<string, string> = {
  pendente: '#F57F17',
  confirmado: '#2E7D32',
  recusado: '#C62828',
};

export function escalarReceita(
  ingredientes: ReceitaIngrediente[],
  rendimentoBase: number,
  porcoesDesejadas: number
): ReceitaIngredienteEscalado[] {
  const fator = porcoesDesejadas / rendimentoBase;
  return ingredientes.map(ing => ({
    ...ing,
    quantidadeEscalada: Math.ceil(ing.quantidade * fator * 100) / 100,
    custoEstimado: ing.quantidade * fator * (ing.produto?.preco_medio || 0),
  }));
}

export function calcularCustoReceita(
  ingredientes: ReceitaIngrediente[],
  rendimentoBase: number,
  porcoesDesejadas: number
): { total: number; porPorcao: number } {
  const fator = porcoesDesejadas / rendimentoBase;
  const total = ingredientes.reduce(
    (acc, ing) => acc + ing.quantidade * fator * (ing.produto?.preco_medio || 0),
    0
  );
  return { total, porPorcao: porcoesDesejadas > 0 ? total / porcoesDesejadas : 0 };
}

export function gerarListaCompras(pratosDoEvento: EventoPrato[]): Omit<ItemLista, 'id' | 'lista_id'>[] {
  const mapa = new Map<string, Omit<ItemLista, 'id' | 'lista_id'>>();
  for (const prato of pratosDoEvento) {
    if (!prato.receita?.ingredientes) continue;
    const fator = prato.quantidade_porcoes / prato.receita.rendimento_base;
    for (const ing of prato.receita.ingredientes) {
      const chave = ing.produto_id;
      const qtd = ing.quantidade * fator;
      if (mapa.has(chave)) {
        const item = mapa.get(chave)!;
        item.quantidade += qtd;
        item.preco_estimado = item.quantidade * (ing.produto?.preco_medio || 0);
      } else {
        mapa.set(chave, {
          produto_id: ing.produto_id, produto: ing.produto,
          quantidade: Math.ceil(qtd * 100) / 100, unidade: ing.unidade_medida,
          preco_estimado: qtd * (ing.produto?.preco_medio || 0),
          comprado: false, item_extra: false, categoria: ing.produto?.categoria,
        });
      }
    }
  }
  return Array.from(mapa.values()).sort((a, b) => (a.categoria || '').localeCompare(b.categoria || ''));
}

export function formatarListaWhatsApp(evento: Evento, itens: ItemLista[]): string {
  let texto = `🍲 *LISTA DE COMPRAS*\n📋 ${evento.nome}\n📅 ${formatarData(evento.data_inicio)}\n👥 ${evento.publico_estimado} pessoas\n\n`;
  let categoriaAtual = '';
  let total = 0;
  for (const item of itens) {
    if (item.categoria !== categoriaAtual) {
      categoriaAtual = item.categoria || '';
      texto += `\n*${LABELS_CATEGORIA_PRODUTO[item.categoria as CategoriaProduto] || 'Outros'}:*\n`;
    }
    const nome = item.item_extra ? item.nome_extra : item.produto?.nome;
    texto += `${item.comprado ? '✅' : '⬜'} ${nome} — ${item.quantidade} ${item.unidade}`;
    if (item.preco_estimado) { texto += ` (~${formatarMoeda(item.preco_estimado)})`; total += item.preco_estimado; }
    texto += '\n';
  }
  texto += `\n💰 *Total estimado: ${formatarMoeda(total)}*\n\n_Gerado pelo app Seareiros_ 🙏`;
  return texto;
}

// Web: window.open em vez de Linking
export function abrirWhatsApp(texto: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
}

export function abrirWhatsAppContato(telefone: string, mensagem?: string) {
  const numero = telefone.replace(/\D/g, '');
  const query = mensagem ? `?text=${encodeURIComponent(mensagem)}` : '';
  window.open(`https://wa.me/55${numero}${query}`, '_blank');
}

export function ligarPara(telefone: string) {
  window.open(`tel:${telefone.replace(/\D/g, '')}`, '_self');
}

export function verificarValidade(dataValidade: string, alertaDiasAntes: number): import('../types').StatusValidade {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const validade = new Date(dataValidade + 'T00:00:00');
  const diasRestantes = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  if (diasRestantes < 0) return { status: 'vencido', diasRestantes, cor: '#C62828', icone: 'alert-octagon' };
  if (diasRestantes <= alertaDiasAntes) return { status: 'proximo_vencimento', diasRestantes, cor: '#F57F17', icone: 'alert-circle' };
  return { status: 'ok', diasRestantes, cor: '#2E7D32', icone: 'check-circle' };
}

export function textoValidade(diasRestantes: number): string {
  if (diasRestantes < 0) return `Venceu há ${Math.abs(diasRestantes)} dia${Math.abs(diasRestantes) !== 1 ? 's' : ''}!`;
  if (diasRestantes === 0) return 'Vence hoje!';
  if (diasRestantes === 1) return 'Vence amanhã!';
  return `Vence em ${diasRestantes} dias`;
}

export function calcularPrecoVenda(precoCusto: number, margemPercentual = 10): number {
  return Math.ceil(precoCusto * (1 + margemPercentual / 100) * 100) / 100;
}

export function iniciais(nome: string): string {
  return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}
