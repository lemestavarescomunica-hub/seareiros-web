import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { prisma } from '@/lib/prisma'
import { mapEvento } from '@/lib/mappers'

const include = {
  pratos: { include: { receita: { include: { ingredientes: { include: { produto: true } } } } } },
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const e = await prisma.evento.findUnique({ where: { id }, include })
  if (!e) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(mapEvento(e))
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  try {
    const body = await req.json()
    const data: any = {}
    if (body.nome) data.nome = body.nome
    if (body.data_inicio) data.dataInicio = new Date(body.data_inicio)
    if (body.publico_estimado) data.publicoEstimado = body.publico_estimado
    if (body.status) data.status = body.status.toUpperCase().replace(' ', '_')
    if (body.observacoes !== undefined) data.observacoes = body.observacoes
    if (body.horario_inicio !== undefined) data.horarioInicio = body.horario_inicio
    if (body.horario_fim !== undefined) data.horarioFim = body.horario_fim

    const e = await prisma.evento.update({ where: { id }, data, include })
    return NextResponse.json(mapEvento(e))
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
    const { action } = body

    if (action === 'addPrato') {
      await prisma.eventoPrato.create({
        data: { eventoId: id, receitaId: body.receita_id, quantidadePorcoes: body.quantidade_porcoes },
      })
    } else if (action === 'removePrato') {
      await prisma.eventoPrato.delete({ where: { id: body.prato_id } })
    } else if (action === 'updatePorcoes') {
      await prisma.eventoPrato.update({ where: { id: body.prato_id }, data: { quantidadePorcoes: body.quantidade_porcoes } })
    }

    const e = await prisma.evento.findUnique({ where: { id }, include })
    return NextResponse.json(mapEvento(e!))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  await prisma.evento.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
