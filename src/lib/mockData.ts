import type { Produto, Receita, Evento, Profile, EstoqueItem } from '../types';

export const MOCK_PRODUTOS: Produto[] = [
  { id: 'p1', nome: 'Feijão Preto', categoria: 'graos', unidade_compra: 'kg', preco_medio: 8.5, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p2', nome: 'Arroz Tipo 1', categoria: 'graos', unidade_compra: 'kg', preco_medio: 5.9, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p3', nome: 'Carne Bovina (patinho)', categoria: 'carnes', unidade_compra: 'kg', preco_medio: 42.0, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p4', nome: 'Linguiça Defumada', categoria: 'carnes', unidade_compra: 'kg', preco_medio: 22.0, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p5', nome: 'Cenoura', categoria: 'verduras_legumes', unidade_compra: 'kg', preco_medio: 4.5, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p6', nome: 'Batata', categoria: 'verduras_legumes', unidade_compra: 'kg', preco_medio: 5.0, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p7', nome: 'Cebola', categoria: 'verduras_legumes', unidade_compra: 'kg', preco_medio: 3.8, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p8', nome: 'Alho', categoria: 'temperos', unidade_compra: 'kg', preco_medio: 28.0, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p9', nome: 'Sal', categoria: 'temperos', unidade_compra: 'kg', preco_medio: 2.5, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p10', nome: 'Óleo de Soja', categoria: 'outros', unidade_compra: 'litro', preco_medio: 7.9, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p11', nome: 'Macarrão', categoria: 'graos', unidade_compra: 'kg', preco_medio: 4.5, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p12', nome: 'Pão Francês', categoria: 'outros', unidade_compra: 'unidade', preco_medio: 0.8, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p13', nome: 'Frango Inteiro', categoria: 'carnes', unidade_compra: 'kg', preco_medio: 14.5, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p14', nome: 'Tomate', categoria: 'verduras_legumes', unidade_compra: 'kg', preco_medio: 6.5, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p15', nome: 'Couve', categoria: 'verduras_legumes', unidade_compra: 'maço', preco_medio: 3.5, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p16', nome: 'Água Sanitária', categoria: 'limpeza', unidade_compra: 'litro', preco_medio: 5.5, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p17', nome: 'Detergente', categoria: 'limpeza', unidade_compra: 'unidade', preco_medio: 3.2, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p18', nome: 'Esponja de Limpeza', categoria: 'limpeza', unidade_compra: 'pacote', preco_medio: 8.0, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p19', nome: 'Copo Descartável 200ml', categoria: 'descartaveis', unidade_compra: 'pacote', preco_medio: 12.0, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'p20', nome: 'Prato Descartável', categoria: 'descartaveis', unidade_compra: 'pacote', preco_medio: 15.0, created_at: '2024-01-01', updated_at: '2024-01-01' },
];

export const MOCK_RECEITAS: Receita[] = [
  {
    id: 'r1',
    nome: 'Sopa de Frango com Legumes',
    categoria: 'sopa_semanal',
    rendimento_base: 50,
    unidade_rendimento: 'porções',
    tempo_preparo_minutos: 90,
    modo_preparo: '1. Cozinhe o frango com alho e sal por 40 minutos.\n2. Retire o frango, desfie e reserve.\n3. No caldo, adicione os legumes picados.\n4. Cozinhe por 20 minutos até legumes ficarem macios.\n5. Volte o frango desfiado à panela.\n6. Ajuste o sal e finalize.',
    observacoes: 'Para grupos grandes, use panelas de 50L. O frango deve estar bem cozido antes de desfiar.',
    ingredientes: [
      { id: 'ri1', receita_id: 'r1', produto_id: 'p13', produto: MOCK_PRODUTOS[12], quantidade: 5, unidade_medida: 'kg' },
      { id: 'ri2', receita_id: 'r1', produto_id: 'p5', produto: MOCK_PRODUTOS[4], quantidade: 3, unidade_medida: 'kg' },
      { id: 'ri3', receita_id: 'r1', produto_id: 'p6', produto: MOCK_PRODUTOS[5], quantidade: 3, unidade_medida: 'kg' },
      { id: 'ri4', receita_id: 'r1', produto_id: 'p7', produto: MOCK_PRODUTOS[6], quantidade: 1, unidade_medida: 'kg' },
      { id: 'ri5', receita_id: 'r1', produto_id: 'p8', produto: MOCK_PRODUTOS[7], quantidade: 0.1, unidade_medida: 'kg' },
      { id: 'ri6', receita_id: 'r1', produto_id: 'p9', produto: MOCK_PRODUTOS[8], quantidade: 0.2, unidade_medida: 'kg' },
    ],
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'r2',
    nome: 'Feijoada Completa',
    categoria: 'prato_principal',
    rendimento_base: 80,
    unidade_rendimento: 'porções',
    tempo_preparo_minutos: 180,
    modo_preparo: '1. Deixe o feijão de molho de véspera.\n2. Cozinhe as carnes salgadas à parte para dessalgar.\n3. Refogue alho e cebola no óleo.\n4. Adicione o feijão escorrido e as carnes.\n5. Cozinhe na pressão por 40 minutos.\n6. Sirva com arroz, couve e laranja.',
    observacoes: 'Tradicional da nossa comunidade. Sempre usar feijão preto. As carnes salgadas devem ficar de molho por pelo menos 12 horas.',
    ingredientes: [
      { id: 'ri7', receita_id: 'r2', produto_id: 'p1', produto: MOCK_PRODUTOS[0], quantidade: 8, unidade_medida: 'kg' },
      { id: 'ri8', receita_id: 'r2', produto_id: 'p4', produto: MOCK_PRODUTOS[3], quantidade: 4, unidade_medida: 'kg' },
      { id: 'ri9', receita_id: 'r2', produto_id: 'p3', produto: MOCK_PRODUTOS[2], quantidade: 5, unidade_medida: 'kg' },
      { id: 'ri10', receita_id: 'r2', produto_id: 'p7', produto: MOCK_PRODUTOS[6], quantidade: 2, unidade_medida: 'kg' },
      { id: 'ri11', receita_id: 'r2', produto_id: 'p8', produto: MOCK_PRODUTOS[7], quantidade: 0.15, unidade_medida: 'kg' },
      { id: 'ri12', receita_id: 'r2', produto_id: 'p10', produto: MOCK_PRODUTOS[9], quantidade: 0.5, unidade_medida: 'litro' },
      { id: 'ri13', receita_id: 'r2', produto_id: 'p15', produto: MOCK_PRODUTOS[14], quantidade: 5, unidade_medida: 'maço' },
      { id: 'ri14', receita_id: 'r2', produto_id: 'p2', produto: MOCK_PRODUTOS[1], quantidade: 6, unidade_medida: 'kg' },
    ],
    created_at: '2024-01-02',
    updated_at: '2024-01-02',
  },
  {
    id: 'r3',
    nome: 'Sopa de Legumes Simples',
    categoria: 'sopa_semanal',
    rendimento_base: 40,
    unidade_rendimento: 'porções',
    tempo_preparo_minutos: 60,
    modo_preparo: '1. Refogue o alho e a cebola.\n2. Adicione os legumes picados.\n3. Cubra com água e cozinhe por 25 minutos.\n4. Tempere e sirva.',
    ingredientes: [
      { id: 'ri15', receita_id: 'r3', produto_id: 'p5', produto: MOCK_PRODUTOS[4], quantidade: 4, unidade_medida: 'kg' },
      { id: 'ri16', receita_id: 'r3', produto_id: 'p6', produto: MOCK_PRODUTOS[5], quantidade: 3, unidade_medida: 'kg' },
      { id: 'ri17', receita_id: 'r3', produto_id: 'p14', produto: MOCK_PRODUTOS[13], quantidade: 2, unidade_medida: 'kg' },
      { id: 'ri18', receita_id: 'r3', produto_id: 'p7', produto: MOCK_PRODUTOS[6], quantidade: 1, unidade_medida: 'kg' },
      { id: 'ri19', receita_id: 'r3', produto_id: 'p11', produto: MOCK_PRODUTOS[10], quantidade: 2, unidade_medida: 'kg' },
      { id: 'ri20', receita_id: 'r3', produto_id: 'p9', produto: MOCK_PRODUTOS[8], quantidade: 0.15, unidade_medida: 'kg' },
    ],
    created_at: '2024-01-03',
    updated_at: '2024-01-03',
  },
];

export const MOCK_VOLUNTARIOS: Profile[] = [
  { id: 'v1', nome: 'Maria das Graças', telefone: '62999001234', role: 'admin', ativo: true, habilidades: ['Cozinheira', 'Coordenação'], disponibilidade: { 'sex': ['tarde', 'noite'] }, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'v2', nome: 'José Roberto', telefone: '62988112233', role: 'leitor', ativo: true, habilidades: ['Compras', 'Transporte'], disponibilidade: {}, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'v3', nome: 'Ana Lucia Ferreira', telefone: '62977223344', role: 'leitor', ativo: true, habilidades: ['Auxiliar de Cozinha', 'Servir'], disponibilidade: {}, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'v4', nome: 'Carlos Eduardo', telefone: '62966334455', role: 'leitor', ativo: true, habilidades: ['Limpeza', 'Montagem'], disponibilidade: {}, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'v5', nome: 'Fernanda Silva', telefone: '62955445566', role: 'leitor', ativo: true, habilidades: ['Cozinheira', 'Sobremesas'], disponibilidade: {}, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'v6', nome: 'Pedro Henrique', telefone: '62944556677', role: 'leitor', ativo: false, habilidades: ['Compras'], disponibilidade: {}, created_at: '2024-01-01', updated_at: '2024-01-01' },
];

const hoje = new Date();
const proximaSexta = new Date(hoje);
proximaSexta.setDate(hoje.getDate() + ((5 - hoje.getDay() + 7) % 7 || 7));
const dataProxEvento = proximaSexta.toISOString().split('T')[0];

const proximoMes = new Date(hoje);
proximoMes.setMonth(hoje.getMonth() + 1);
const dataFeijoada = proximoMes.toISOString().split('T')[0];

export const MOCK_EVENTOS: Evento[] = [
  {
    id: 'e1',
    nome: 'Sopa Semanal',
    data_inicio: dataProxEvento,
    horario_inicio: '17:00',
    horario_fim: '20:00',
    publico_estimado: 150,
    status: 'compras',
    recorrente: true,
    tipo_recorrencia: 'semanal',
    pratos: [
      { id: 'ep1', evento_id: 'e1', receita_id: 'r1', receita: MOCK_RECEITAS[0], quantidade_porcoes: 150 },
    ],
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'e2',
    nome: 'Feijoada Beneficente',
    data_inicio: dataFeijoada,
    horario_inicio: '11:00',
    horario_fim: '15:00',
    publico_estimado: 200,
    status: 'planejamento',
    recorrente: false,
    observacoes: 'Evento especial de arrecadação de fundos. Confirmar local com antecedência.',
    pratos: [
      { id: 'ep2', evento_id: 'e2', receita_id: 'r2', receita: MOCK_RECEITAS[1], quantidade_porcoes: 200 },
    ],
    created_at: '2024-01-02',
    updated_at: '2024-01-02',
  },
];

export const MOCK_ESTOQUE: EstoqueItem[] = [
  { id: 'est1', produto_id: 'p1', produto: MOCK_PRODUTOS[0], tipo: 'sopa_semanal', quantidade_atual: 5, quantidade_minima: 10, unidade: 'kg', updated_at: '2024-01-01' },
  { id: 'est2', produto_id: 'p9', produto: MOCK_PRODUTOS[8], tipo: 'sopa_semanal', quantidade_atual: 3, quantidade_minima: 2, unidade: 'kg', updated_at: '2024-01-01' },
  { id: 'est3', produto_id: 'p10', produto: MOCK_PRODUTOS[9], tipo: 'sopa_semanal', quantidade_atual: 2, quantidade_minima: 5, unidade: 'litro', updated_at: '2024-01-01' },
  { id: 'est4', produto_id: 'p16', produto: MOCK_PRODUTOS[15], tipo: 'limpeza', quantidade_atual: 4, quantidade_minima: 3, unidade: 'litro', updated_at: '2024-01-01' },
  { id: 'est5', produto_id: 'p17', produto: MOCK_PRODUTOS[16], tipo: 'limpeza', quantidade_atual: 1, quantidade_minima: 5, unidade: 'unidade', updated_at: '2024-01-01' },
  { id: 'est6', produto_id: 'p18', produto: MOCK_PRODUTOS[17], tipo: 'limpeza', quantidade_atual: 6, quantidade_minima: 4, unidade: 'pacote', updated_at: '2024-01-01' },
];
