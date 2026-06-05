import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { prisma } from '@/lib/prisma'
import { mapListaCompras, mapEvento } from '@/lib/mappers'
import { gerarListaCompras } from '@/lib/utils'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const lista = await prisma.listaCompras.findFirst({
    where: { eventoId: id },
    include: { itens: { include: { produto: true } } },
    orderBy: { geradaEm: 'desc' },
  })
  if (!lista) return NextResponse.json(null)
  return NextResponse.json(mapListaCompras(lista))
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  try {
    const evento = await prisma.evento.findUnique({
      where: { id },
      include: { pratos: { include: { receita: { include: { ingredientes: { include: { produto: true } } } } } } },
    })
    if (!evento) return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })

    await prisma.listaCompras.deleteMany({ where: { eventoId: id } })

    const eventoMapped = mapEvento(evento)
    const itensBase = gerarListaCompras(eventoMapped.pratos || [])

    const lista = await prisma.listaCompras.create({
      data: {
        eventoId: id,
        itens: {
          create: itensBase.map(item => ({
            produtoId: item.produto_id,
            quantidade: item.quantidade,
            unidade: item.unidade,
            precoEstimado: item.preco_estimado,
            comprado: false,
            itemExtra: false,
            categoria: item.categoria,
          })),
        },
      },
      include: { itens: { include: { produto: true } } },
    })
    return NextResponse.json(mapListaCompras(lista), { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  try {
    const body = await req.json()
    const { action, item_id } = body

    if (action === 'toggleComprado') {
      const item = await prisma.listaComprasItem.findUnique({ where: { id: item_id } })
      if (item) await prisma.listaComprasItem.update({ where: { id: item_id }, data: { comprado: !item.comprado } })
    } else if (action === 'updatePreco') {
      await prisma.listaComprasItem.update({ where: { id: item_id }, data: { precoEstimado: body.preco } })
    } else if (action === 'addItemExtra') {
      const lista = await prisma.listaCompras.findFirst({ where: { eventoId: id }, orderBy: { geradaEm: 'desc' } })
      if (lista) {
        await prisma.listaComprasItem.create({
          data: {
            listaId: lista.id,
            produtoId: body.produto_id,
            nomeExtra: body.nome_extra,
            quantidade: body.quantidade,
            unidade: body.unidade,
            precoEstimado: body.preco_estimado,
            itemExtra: true,
            categoria: body.categoria,
          },
        })
      }
    }

    const lista = await prisma.listaCompras.findFirst({
      where: { eventoId: id },
      include: { itens: { include: { produto: true } } },
      orderBy: { geradaEm: 'desc' },
    })
    return NextResponse.json(lista ? mapListaCompras(lista) : null)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
