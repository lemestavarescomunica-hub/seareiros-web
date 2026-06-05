import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { prisma } from '@/lib/prisma'
import { mapEstoqueItem, mapMovimentacao, mapLote } from '@/lib/mappers'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo')

  const [itens, movimentacoes, lotes] = await Promise.all([
    prisma.estoque.findMany({ where: tipo ? { tipo: tipo.toUpperCase() as any } : undefined, include: { produto: true } }),
    prisma.estoqueMovimentacao.findMany({ orderBy: { data: 'desc' } }),
    prisma.estoqueLote.findMany({ include: { produto: true }, orderBy: { dataValidade: 'asc' } }),
  ])

  return NextResponse.json({
    itens: itens.map(mapEstoqueItem),
    movimentacoes: movimentacoes.map(mapMovimentacao),
    lotes: lotes.map(mapLote),
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const { action } = body

    if (action === 'addItem') {
      const item = await prisma.estoque.create({
        data: {
          produtoId: body.produto_id,
          tipo: body.tipo.toUpperCase() as any,
          quantidadeAtual: body.quantidade_atual,
          quantidadeMinima: body.quantidade_minima,
          unidade: body.unidade,
        },
        include: { produto: true },
      })
      return NextResponse.json(mapEstoqueItem(item), { status: 201 })
    }

    if (action === 'movimentar') {
      const [mov, item] = await prisma.$transaction([
        prisma.estoqueMovimentacao.create({
          data: {
            estoqueId: body.estoque_id,
            tipoMovimento: body.tipo_movimento,
            quantidade: body.quantidade,
            motivo: body.motivo,
          },
        }),
        prisma.estoque.update({
          where: { id: body.estoque_id },
          data: {
            quantidadeAtual: {
              [body.tipo_movimento === 'entrada' ? 'increment' : 'decrement']: body.quantidade,
            },
          },
          include: { produto: true },
        }),
      ])
      return NextResponse.json({ movimentacao: mapMovimentacao(mov), item: mapEstoqueItem(item) })
    }

    if (action === 'addLote') {
      const lote = await prisma.estoqueLote.create({
        data: {
          estoqueId: body.estoque_id,
          produtoId: body.produto_id,
          quantidade: body.quantidade,
          unidade: body.unidade,
          dataValidade: new Date(body.data_validade),
          alertaDiasAntes: body.alerta_dias_antes || 7,
          status: 'ok',
        },
        include: { produto: true },
      })
      return NextResponse.json(mapLote(lote), { status: 201 })
    }

    if (action === 'resolverLote') {
      const lote = await prisma.estoqueLote.update({
        where: { id: body.lote_id },
        data: { status: body.status, destino: body.destino },
        include: { produto: true },
      })
      return NextResponse.json(mapLote(lote))
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
