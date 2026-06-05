import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { prisma } from '@/lib/prisma'
import { mapCotacao } from '@/lib/mappers'

const include = {
  fornecedores: true,
  itens: { include: { precos: true, produto: true } },
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const c = await prisma.cotacao.findUnique({ where: { id }, include })
  if (!c) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(mapCotacao(c))
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  try {
    const body = await req.json()
    const { action } = body

    if (action === 'updatePreco') {
      const { item_id, fornecedor_id, preco } = body
      await prisma.cotacaoPreco.updateMany({
        where: { cotacaoItemId: item_id, fornecedorId: fornecedor_id },
        data: { precoUnitario: preco ?? null },
      })
      const precos = await prisma.cotacaoPreco.findMany({ where: { cotacaoItemId: item_id } })
      const validos = precos.filter((p: any) => p.precoUnitario !== null && Number(p.precoUnitario) > 0)
      if (validos.length > 0) {
        const min = Math.min(...validos.map((p: any) => Number(p.precoUnitario)))
        await Promise.all(precos.map((p: any) =>
          prisma.cotacaoPreco.update({
            where: { id: p.id },
            data: { melhorPreco: p.precoUnitario !== null && Number(p.precoUnitario) === min },
          })
        ))
      } else {
        await prisma.cotacaoPreco.updateMany({ where: { cotacaoItemId: item_id }, data: { melhorPreco: false } })
      }
    } else if (action === 'concluir') {
      await prisma.cotacao.update({ where: { id }, data: { status: 'concluida' } })
    } else if (action === 'addFornecedor') {
      const f = await prisma.cotacaoFornecedor.create({ data: { cotacaoId: id, nome: body.nome } })
      const itens = await prisma.cotacaoItem.findMany({ where: { cotacaoId: id } })
      await prisma.cotacaoPreco.createMany({
        data: itens.map((i: any) => ({ cotacaoItemId: i.id, fornecedorId: f.id, melhorPreco: false })),
      })
    } else if (action === 'addItem') {
      const item = await prisma.cotacaoItem.create({
        data: { cotacaoId: id, produtoId: body.produto_id, nomeProduto: body.nome_produto, quantidade: body.quantidade, unidade: body.unidade },
      })
      const fornecedores = await prisma.cotacaoFornecedor.findMany({ where: { cotacaoId: id } })
      await prisma.cotacaoPreco.createMany({
        data: fornecedores.map((f: any) => ({ cotacaoItemId: item.id, fornecedorId: f.id, melhorPreco: false })),
      })
    }

    const c = await prisma.cotacao.findUnique({ where: { id }, include })
    return NextResponse.json(mapCotacao(c!))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  await prisma.cotacao.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
