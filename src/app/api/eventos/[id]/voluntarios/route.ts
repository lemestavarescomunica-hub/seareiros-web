import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { prisma } from '@/lib/prisma'
import { mapEscala } from '@/lib/mappers'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const escalas = await prisma.eventoVoluntario.findMany({
    where: { eventoId: id },
    include: { voluntario: true },
  })
  return NextResponse.json(escalas.map(mapEscala))
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  try {
    const { voluntario_id, turno, funcao } = await req.json()
    const e = await prisma.eventoVoluntario.create({
      data: { eventoId: id, voluntarioId: voluntario_id, turno: turno.toUpperCase() as any, funcao },
      include: { voluntario: true },
    })
    return NextResponse.json(mapEscala(e), { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params: _ }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const { escala_id, status_confirmacao, action } = await req.json()
    if (action === 'remover') {
      await prisma.eventoVoluntario.delete({ where: { id: escala_id } })
      return NextResponse.json({ ok: true })
    }
    if (action === 'confirmar') {
      const e = await prisma.eventoVoluntario.update({
        where: { id: escala_id },
        data: { statusConfirmacao: status_confirmacao.toUpperCase() as any },
        include: { voluntario: true },
      })
      return NextResponse.json(mapEscala(e))
    }
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
