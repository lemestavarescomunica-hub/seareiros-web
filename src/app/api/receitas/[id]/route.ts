import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { prisma } from '@/lib/prisma'
import { mapReceita } from '@/lib/mappers'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const r = await prisma.receita.findUnique({
    where: { id },
    include: { ingredientes: { include: { produto: true } } },
  })
  if (!r) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(mapReceita(r))
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  try {
    const { nome, categoria, rendimento_base, unidade_rendimento, modo_preparo, observacoes, tempo_preparo_minutos, ingredientes } = await req.json()

    await prisma.receitaIngrediente.deleteMany({ where: { receitaId: id } })

    const r = await prisma.receita.update({
      where: { id },
      data: {
        nome,
        categoria: categoria.toUpperCase().replace(/ /g, '_') as any,
        rendimentoBase: rendimento_base,
        unidadeRendimento: unidade_rendimento,
        modoPreparo: modo_preparo,
        observacoes,
        tempoPreparoMin: tempo_preparo_minutos,
        ingredientes: ingredientes?.length ? {
          create: ingredientes.map((i: any) => ({
            produtoId: i.produto_id,
            quantidade: i.quantidade,
            unidadeMedida: i.unidade_medida,
            observacao: i.observacao,
          })),
        } : undefined,
      },
      include: { ingredientes: { include: { produto: true } } },
    })
    return NextResponse.json(mapReceita(r))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  await prisma.receita.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
