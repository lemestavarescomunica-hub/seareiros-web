import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { prisma } from '@/lib/prisma'
import { mapProduto } from '@/lib/mappers'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const produtos = await prisma.produto.findMany({ orderBy: { nome: 'asc' } })
  return NextResponse.json(produtos.map(mapProduto))
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const { nome, categoria, unidade_compra, preco_medio, fornecedor, observacoes } = await req.json()
    const p = await prisma.produto.create({
      data: {
        nome,
        categoria: categoria.toUpperCase() as any,
        unidadeCompra: unidade_compra,
        precoMedio: preco_medio,
        fornecedor,
        observacoes,
      },
    })
    return NextResponse.json(mapProduto(p), { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
