import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { prisma } from '@/lib/prisma'
import { mapHistoricoPreco } from '@/lib/mappers'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const produtoId = searchParams.get('produto_id')

  const historico = await prisma.historicoPreco.findMany({
    where: produtoId ? { produtoId } : undefined,
    orderBy: { data: 'desc' },
  })
  return NextResponse.json(historico.map(mapHistoricoPreco))
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const { produto_id, preco, evento_id, evento_nome, origem } = await req.json()
    const h = await prisma.historicoPreco.create({
      data: { produtoId: produto_id, preco, eventoId: evento_id, eventoNome: evento_nome, origem: origem || 'manual' },
    })
    return NextResponse.json(mapHistoricoPreco(h), { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
