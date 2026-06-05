// Auth
export type UserRole = 'admin' | 'leitor';

export interface Profile {
  id: string;
  nome: string;
  telefone?: string;
  role: UserRole;
  ativo: boolean;
  disponibilidade: Record<string, string[]>;
  habilidades: string[];
  restricoes?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Produtos
export type CategoriaProduto =
  | 'graos'
  | 'carnes'
  | 'verduras_legumes'
  | 'temperos'
  | 'laticinios'
  | 'descartaveis'
  | 'limpeza'
  | 'bebidas'
  | 'outros';

export interface Produto {
  id: string;
  nome: string;
  categoria: CategoriaProduto;
  unidade_compra: string;
  preco_medio: number;
  fornecedor?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface HistoricoPreco {
  id: string;
  produto_id: string;
  preco: number;
  data: string;
  evento_id?: string;
  evento_nome?: string;
  origem?: 'manual' | 'lista_compras' | 'cotacao' | 'atualizacao_lote';
}

export interface Cotacao {
  id: string;
  nome: string;
  lista_compras_id?: string;
  evento_id?: string;
  evento_nome?: string;
  status: 'em_andamento' | 'concluida';
  fornecedores: CotacaoFornecedor[];
  itens: CotacaoItem[];
  created_at: string;
  updated_at: string;
}

export interface CotacaoFornecedor {
  id: string;
  cotacao_id: string;
  nome: string;
  observacoes?: string;
}

export interface CotacaoItem {
  id: string;
  cotacao_id: string;
  produto_id?: string;
  nome_produto: string;
  quantidade: number;
  unidade: string;
  precos: CotacaoPreco[];
}

export interface CotacaoPreco {
  id: string;
  cotacao_item_id: string;
  fornecedor_id: string;
  preco_unitario?: number;
  melhor_preco: boolean;
}

// Receitas
export type CategoriaReceita =
  | 'sopa_semanal'
  | 'caldos'
  | 'prato_principal'
  | 'lanche'
  | 'sobremesa'
  | 'almoco_trabalhadores'
  | 'outros';

export interface ReceitaIngrediente {
  id: string;
  receita_id: string;
  produto_id: string;
  produto?: Produto;
  quantidade: number;
  unidade_medida: string;
  observacao?: string;
}

export interface ReceitaIngredienteEscalado extends ReceitaIngrediente {
  quantidadeEscalada: number;
  custoEstimado: number;
}

export interface Receita {
  id: string;
  nome: string;
  categoria: CategoriaReceita;
  rendimento_base: number;
  unidade_rendimento: string;
  modo_preparo?: string;
  observacoes?: string;
  tempo_preparo_minutos?: number;
  foto_url?: string;
  ingredientes?: ReceitaIngrediente[];
  created_at: string;
  updated_at: string;
}

// Eventos
export type StatusEvento = 'planejamento' | 'compras' | 'em_execucao' | 'concluido';
export type TipoRecorrencia = 'semanal' | 'mensal' | 'anual';

export interface EventoPrato {
  id: string;
  evento_id: string;
  receita_id: string;
  receita?: Receita;
  quantidade_porcoes: number;
}

export interface Evento {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim?: string;
  horario_inicio?: string;
  horario_fim?: string;
  publico_estimado: number;
  status: StatusEvento;
  recorrente: boolean;
  tipo_recorrencia?: TipoRecorrencia;
  observacoes?: string;
  pratos?: EventoPrato[];
  created_at: string;
  updated_at: string;
}

// Lista de Compras
export interface ItemLista {
  id: string;
  lista_id: string;
  produto_id?: string;
  produto?: Produto;
  quantidade: number;
  unidade: string;
  preco_estimado?: number;
  comprado: boolean;
  local_compra?: string;
  item_extra: boolean;
  nome_extra?: string;
  categoria?: CategoriaProduto;
}

export interface ListaCompras {
  id: string;
  evento_id: string;
  gerada_em: string;
  observacoes?: string;
  itens?: ItemLista[];
}

// Voluntários / Equipe
export type Turno = 'manha' | 'tarde' | 'noite' | 'limpeza';
export type StatusConfirmacao = 'pendente' | 'confirmado' | 'recusado';

export interface EventoVoluntario {
  id: string;
  evento_id: string;
  voluntario_id: string;
  voluntario?: Profile;
  turno: Turno;
  funcao?: string;
  status_confirmacao: StatusConfirmacao;
  created_at: string;
}

// Estoque
export type TipoEstoque = 'sopa_semanal' | 'limpeza';

export interface EstoqueItem {
  id: string;
  produto_id: string;
  produto?: Produto;
  tipo: TipoEstoque;
  quantidade_atual: number;
  quantidade_minima: number;
  unidade: string;
  updated_at: string;
}

export interface EstoqueMovimentacao {
  id: string;
  estoque_id: string;
  tipo_movimento: 'entrada' | 'saida';
  quantidade: number;
  motivo?: string;
  data: string;
}

// Lotes com Validade
export type StatusLote = 'ok' | 'proximo_vencimento' | 'vencido' | 'consumido' | 'doado' | 'vendido' | 'descartado';

export interface EstoqueLote {
  id: string;
  estoque_id: string;
  produto_id: string;
  produto?: Produto;
  quantidade: number;
  unidade: string;
  data_validade: string;
  alerta_dias_antes: number;
  status: StatusLote;
  destino?: string;
  created_at: string;
  updated_at: string;
}

export interface StatusValidade {
  status: 'ok' | 'proximo_vencimento' | 'vencido';
  diasRestantes: number;
  cor: string;
  icone: string;
}

// Venda de Sobras
export type StatusItemVenda = 'disponivel' | 'esgotado' | 'recolhido';

export interface ItemVenda {
  id: string;
  produto_id?: string;
  produto?: Produto;
  evento_id: string;
  nome_personalizado?: string;
  quantidade_disponivel: number;
  unidade: string;
  preco_custo: number;
  margem_percentual: number;
  preco_venda: number;
  quantidade_vendida: number;
  receita_total: number;
  status: StatusItemVenda;
  created_at: string;
  updated_at: string;
}
