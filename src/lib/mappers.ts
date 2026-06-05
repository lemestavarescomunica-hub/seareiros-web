import type {
  Produto, Receita, ReceitaIngrediente, Evento, EventoPrato,
  ListaCompras, ItemLista, Profile, EventoVoluntario,
  EstoqueItem, EstoqueMovimentacao, EstoqueLote, ItemVenda,
  HistoricoPreco, Cotacao, CotacaoFornecedor, CotacaoItem, CotacaoPreco,
  CategoriaProduto, CategoriaReceita, Turno, StatusConfirmacao,
} from '@/types'

function d(date: Date | string | null | undefined): string {
  if (!date) return new Date().toISOString()
  return date instanceof Date ? date.toISOString() : date
}

function n(val: any): number {
  return typeof val === 'object' && val !== null ? Number(val.toString()) : Number(val) || 0
}

export function mapProduto(p: any): Produto {
  return {
    id: p.id,
    nome: p.nome,
    categoria: (p.categoria as string).toLowerCase() as CategoriaProduto,
    unidade_compra: p.unidadeCompra,
    preco_medio: n(p.precoMedio),
    fornecedor: p.fornecedor ?? undefined,
    observacoes: p.observacoes ?? undefined,
    created_at: d(p.createdAt),
    updated_at: d(p.updatedAt),
  }
}

export function mapIngrediente(i: any): ReceitaIngrediente {
  return {
    id: i.id,
    receita_id: i.receitaId,
    produto_id: i.produtoId,
    produto: i.produto ? mapProduto(i.produto) : undefined,
    quantidade: n(i.quantidade),
    unidade_medida: i.unidadeMedida,
    observacao: i.observacao ?? undefined,
  }
}

export function mapReceita(r: any): Receita {
  return {
    id: r.id,
    nome: r.nome,
    categoria: (r.categoria as string).toLowerCase() as CategoriaReceita,
    rendimento_base: r.rendimentoBase,
    unidade_rendimento: r.unidadeRendimento,
    modo_preparo: r.modoPreparo ?? undefined,
    observacoes: r.observacoes ?? undefined,
    tempo_preparo_minutos: r.tempoPreparoMin ?? undefined,
    foto_url: r.fotoUrl ?? undefined,
    ingredientes: r.ingredientes?.map(mapIngrediente) ?? [],
    created_at: d(r.createdAt),
    updated_at: d(r.updatedAt),
  }
}

export function mapEventoPrato(p: any): EventoPrato {
  return {
    id: p.id,
    evento_id: p.eventoId,
    receita_id: p.receitaId,
    receita: p.receita ? mapReceita(p.receita) : undefined,
    quantidade_porcoes: p.quantidadePorcoes,
  }
}

export function mapEvento(e: any): Evento {
  return {
    id: e.id,
    nome: e.nome,
    data_inicio: e.dataInicio instanceof Date ? e.dataInicio.toISOString().split('T')[0] : e.dataInicio,
    data_fim: e.dataFim ? (e.dataFim instanceof Date ? e.dataFim.toISOString().split('T')[0] : e.dataFim) : undefined,
    horario_inicio: e.horarioInicio ?? undefined,
    horario_fim: e.horarioFim ?? undefined,
    publico_estimado: e.publicoEstimado,
    status: (e.status as string).toLowerCase().replace('_', '_') as any,
    recorrente: e.recorrente,
    tipo_recorrencia: e.tipoRecorrencia ?? undefined,
    observacoes: e.observacoes ?? undefined,
    pratos: e.pratos?.map(mapEventoPrato) ?? [],
    created_at: d(e.createdAt),
    updated_at: d(e.updatedAt),
  }
}

export function mapItemLista(i: any): ItemLista {
  return {
    id: i.id,
    lista_id: i.listaId,
    produto_id: i.produtoId ?? undefined,
    produto: i.produto ? mapProduto(i.produto) : undefined,
    quantidade: n(i.quantidade),
    unidade: i.unidade,
    preco_estimado: i.precoEstimado !== null ? n(i.precoEstimado) : undefined,
    comprado: i.comprado,
    local_compra: i.localCompra ?? undefined,
    item_extra: i.itemExtra,
    nome_extra: i.nomeExtra ?? undefined,
    categoria: i.categoria ?? undefined,
  }
}

export function mapListaCompras(l: any): ListaCompras {
  return {
    id: l.id,
    evento_id: l.eventoId,
    gerada_em: d(l.geradaEm),
    observacoes: l.observacoes ?? undefined,
    itens: l.itens?.map(mapItemLista) ?? [],
  }
}

export function mapProfile(u: any): Profile {
  return {
    id: u.id,
    nome: u.nome,
    telefone: u.telefone ?? undefined,
    role: (u.role as string).toLowerCase() as any,
    ativo: u.ativo,
    disponibilidade: u.disponibilidade ?? {},
    habilidades: u.habilidades ?? [],
    restricoes: u.restricoes ?? undefined,
    avatar_url: u.fotoUrl ?? undefined,
    created_at: d(u.createdAt),
    updated_at: d(u.updatedAt),
  }
}

export function mapEscala(e: any): EventoVoluntario {
  return {
    id: e.id,
    evento_id: e.eventoId,
    voluntario_id: e.voluntarioId,
    voluntario: e.voluntario ? mapProfile(e.voluntario) : undefined,
    turno: (e.turno as string).toLowerCase() as Turno,
    funcao: e.funcao ?? undefined,
    status_confirmacao: (e.statusConfirmacao as string).toLowerCase() as StatusConfirmacao,
    created_at: d(e.createdAt),
  }
}

export function mapEstoqueItem(i: any): EstoqueItem {
  return {
    id: i.id,
    produto_id: i.produtoId,
    produto: i.produto ? mapProduto(i.produto) : undefined,
    tipo: (i.tipo as string).toLowerCase() as any,
    quantidade_atual: n(i.quantidadeAtual),
    quantidade_minima: n(i.quantidadeMinima),
    unidade: i.unidade,
    updated_at: d(i.updatedAt),
  }
}

export function mapMovimentacao(m: any): EstoqueMovimentacao {
  return {
    id: m.id,
    estoque_id: m.estoqueId,
    tipo_movimento: m.tipoMovimento as any,
    quantidade: n(m.quantidade),
    motivo: m.motivo ?? undefined,
    data: d(m.data),
  }
}

export function mapLote(l: any): EstoqueLote {
  return {
    id: l.id,
    estoque_id: l.estoqueId,
    produto_id: l.produtoId,
    produto: l.produto ? mapProduto(l.produto) : undefined,
    quantidade: n(l.quantidade),
    unidade: l.unidade,
    data_validade: l.dataValidade instanceof Date ? l.dataValidade.toISOString().split('T')[0] : l.dataValidade,
    alerta_dias_antes: l.alertaDiasAntes,
    status: l.status as any,
    destino: l.destino ?? undefined,
    created_at: d(l.createdAt),
    updated_at: d(l.updatedAt),
  }
}

export function mapItemVenda(i: any): ItemVenda {
  return {
    id: i.id,
    produto_id: i.produtoId ?? undefined,
    produto: i.produto ? mapProduto(i.produto) : undefined,
    evento_id: i.eventoId,
    nome_personalizado: i.nomePersonalizado ?? undefined,
    quantidade_disponivel: n(i.quantidadeDisponivel),
    unidade: i.unidade,
    preco_custo: n(i.precoCusto),
    margem_percentual: n(i.margemPercentual),
    preco_venda: n(i.precoVenda),
    quantidade_vendida: n(i.quantidadeVendida),
    receita_total: n(i.receitaTotal),
    status: i.status as any,
    created_at: d(i.createdAt),
    updated_at: d(i.updatedAt),
  }
}

export function mapHistoricoPreco(h: any): HistoricoPreco {
  return {
    id: h.id,
    produto_id: h.produtoId,
    preco: n(h.preco),
    data: d(h.data),
    evento_id: h.eventoId ?? undefined,
    evento_nome: h.eventoNome ?? undefined,
    origem: h.origem as any,
  }
}

export function mapCotacaoPreco(p: any): CotacaoPreco {
  return {
    id: p.id,
    cotacao_item_id: p.cotacaoItemId,
    fornecedor_id: p.fornecedorId,
    preco_unitario: p.precoUnitario !== null ? n(p.precoUnitario) : undefined,
    melhor_preco: p.melhorPreco,
  }
}

export function mapCotacaoItem(i: any): CotacaoItem {
  return {
    id: i.id,
    cotacao_id: i.cotacaoId,
    produto_id: i.produtoId ?? undefined,
    nome_produto: i.nomeProduto,
    quantidade: n(i.quantidade),
    unidade: i.unidade,
    precos: i.precos?.map(mapCotacaoPreco) ?? [],
  }
}

export function mapCotacaoFornecedor(f: any): CotacaoFornecedor {
  return {
    id: f.id,
    cotacao_id: f.cotacaoId,
    nome: f.nome,
    observacoes: f.observacoes ?? undefined,
  }
}

export function mapCotacao(c: any): Cotacao {
  return {
    id: c.id,
    nome: c.nome,
    evento_id: c.eventoId ?? undefined,
    evento_nome: c.eventoNome ?? undefined,
    status: c.status as any,
    fornecedores: c.fornecedores?.map(mapCotacaoFornecedor) ?? [],
    itens: c.itens?.map(mapCotacaoItem) ?? [],
    created_at: d(c.createdAt),
    updated_at: d(c.updatedAt),
  }
}

export function requireAuth(session: any) {
  if (!session) throw new Error('Unauthorized')
}
