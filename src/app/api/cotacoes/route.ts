import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { prisma } from '@/lib/prisma'
import { mapCotacao } from '@/lib/mappers'

const include = {
  fornecedores: true,
  itens: { include: { precos: true, produto: true } },
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const cotacoes = await prisma.cotacao.findMany({ include, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(cotacoes.map(mapCotacao))
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const { nome, evento_id, evento_nome, fornecedores, itens } = await req.json()

    const c = await prisma.cotacao.create({
      data: {
        nome,
        eventoId: evento_id,
        eventoNome: evento_nome,
        fornecedores: { create: fornecedores.map((n: string) => ({ nome: n })) },
      },
      include,
    })

    // Create items with prices for each fornecedor
    if (itens?.length) {
      for (const item of itens) {
        const ci = await prisma.cotacaoItem.create({
          data: {
            cotacaoId: c.id,
            produtoId: item.produto_id,
            nomeProduto: item.nome_produto,
            quantidade: item.quantidade,
            unidade: item.unidade,
          },
        })
        await prisma.cotacaoPreco.createMany({
          data: c.fornecedores.map((f: any) => ({
            cotacaoItemId: ci.id,
            fornecedorId: f.id,
            melhorPreco: false,
          })),
        })
      }
    }

    const full = await prisma.cotacao.findUnique({ where: { id: c.id }, include })
    return NextResponse.json(mapCotacao(full!), { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
