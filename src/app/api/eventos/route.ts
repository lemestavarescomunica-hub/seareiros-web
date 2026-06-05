import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { prisma } from '@/lib/prisma'
import { mapEvento } from '@/lib/mappers'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const eventos = await prisma.evento.findMany({
    include: {
      pratos: { include: { receita: { include: { ingredientes: { include: { produto: true } } } } } },
    },
    orderBy: { dataInicio: 'asc' },
  })
  return NextResponse.json(eventos.map(mapEvento))
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const { nome, data_inicio, data_fim, horario_inicio, horario_fim, publico_estimado, status, recorrente, tipo_recorrencia, observacoes } = await req.json()

    const e = await prisma.evento.create({
      data: {
        nome,
        dataInicio: new Date(data_inicio),
        dataFim: data_fim ? new Date(data_fim) : undefined,
        horarioInicio: horario_inicio,
        horarioFim: horario_fim,
        publicoEstimado: publico_estimado,
        status: (status || 'planejamento').toUpperCase().replace(' ', '_') as any,
        recorrente: recorrente || false,
        tipoRecorrencia: tipo_recorrencia,
        observacoes,
      },
      include: { pratos: { include: { receita: { include: { ingredientes: { include: { produto: true } } } } } } },
    })
    return NextResponse.json(mapEvento(e), { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
