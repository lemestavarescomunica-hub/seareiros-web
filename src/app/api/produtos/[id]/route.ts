import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { prisma } from '@/lib/prisma'
import { mapProduto } from '@/lib/mappers'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const p = await prisma.produto.findUnique({ where: { id } })
  if (!p) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(mapProduto(p))
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  try {
    const body = await req.json()
    const p = await prisma.produto.update({
      where: { id },
      data: {
        ...(body.nome && { nome: body.nome }),
        ...(body.categoria && { categoria: body.categoria.toUpperCase() as any }),
        ...(body.unidade_compra && { unidadeCompra: body.unidade_compra }),
        ...(body.preco_medio !== undefined && { precoMedio: body.preco_medio }),
        ...(body.fornecedor !== undefined && { fornecedor: body.fornecedor }),
        ...(body.observacoes !== undefined && { observacoes: body.observacoes }),
      },
    })
    return NextResponse.json(mapProduto(p))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  await prisma.produto.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
