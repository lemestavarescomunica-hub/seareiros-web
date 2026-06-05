import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { prisma } from '@/lib/prisma'
import { mapReceita } from '@/lib/mappers'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const receitas = await prisma.receita.findMany({
    include: { ingredientes: { include: { produto: true } } },
    orderBy: { nome: 'asc' },
  })
  return NextResponse.json(receitas.map(mapReceita))
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const { nome, categoria, rendimento_base, unidade_rendimento, modo_preparo, observacoes, tempo_preparo_minutos, ingredientes } = await req.json()

    const r = await prisma.receita.create({
      data: {
        nome,
        categoria: categoria.toUpperCase().replace(' ', '_') as any,
        rendimentoBase: rendimento_base,
        unidadeRendimento: unidade_rendimento || 'porções',
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
    return NextResponse.json(mapReceita(r), { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
