import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { prisma } from '@/lib/prisma'
import { mapItemVenda } from '@/lib/mappers'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const itens = await prisma.itemVenda.findMany({ where: { eventoId: id }, include: { produto: true } })
  return NextResponse.json(itens.map(mapItemVenda))
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  try {
    const body = await req.json()
    const item = await prisma.itemVenda.create({
      data: {
        eventoId: id,
        produtoId: body.produto_id,
        nomePersonalizado: body.nome_personalizado,
        quantidadeDisponivel: body.quantidade_disponivel,
        unidade: body.unidade,
        precoCusto: body.preco_custo,
        margemPercentual: body.margem_percentual,
        precoVenda: body.preco_venda,
        status: 'disponivel',
      },
      include: { produto: true },
    })
    return NextResponse.json(mapItemVenda(item), { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params: _ }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const { item_id, action, quantidade } = await req.json()
    const item = await prisma.itemVenda.findUnique({ where: { id: item_id }, include: { produto: true } })
    if (!item) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    if (action === 'venda') {
      const novaQtd = Number(item.quantidadeVendida) + (quantidade || 1)
      const esgotado = novaQtd >= Number(item.quantidadeDisponivel)
      const updated = await prisma.itemVenda.update({
        where: { id: item_id },
        data: { quantidadeVendida: novaQtd, receitaTotal: Number(item.precoVenda) * novaQtd, status: esgotado ? 'esgotado' : 'disponivel' },
        include: { produto: true },
      })
      return NextResponse.json(mapItemVenda(updated))
    } else if (action === 'recolher') {
      const updated = await prisma.itemVenda.update({ where: { id: item_id }, data: { status: 'recolhido' }, include: { produto: true } })
      return NextResponse.json(mapItemVenda(updated))
    }
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
