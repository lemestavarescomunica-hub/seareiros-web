import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { prisma } from '@/lib/prisma'
import { mapProfile } from '@/lib/mappers'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const users = await prisma.user.findMany({ orderBy: { nome: 'asc' } })
  return NextResponse.json(users.map(mapProfile))
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const user = await prisma.user.create({
      data: {
        nome: body.nome,
        email: body.email || `${body.nome.toLowerCase().replace(/ /g, '.')}@seareiros.org`,
        senha: '$2a$12$placeholder', // will be set when user logs in
        telefone: body.telefone,
        role: (body.role || 'LEITOR').toUpperCase() as any,
        ativo: body.ativo ?? true,
        habilidades: body.habilidades || [],
        disponibilidade: body.disponibilidade || {},
        restricoes: body.restricoes,
      },
    })
    return NextResponse.json(mapProfile(user), { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const { id, ...data } = await req.json()
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.nome && { nome: data.nome }),
        ...(data.telefone !== undefined && { telefone: data.telefone }),
        ...(data.ativo !== undefined && { ativo: data.ativo }),
        ...(data.habilidades && { habilidades: data.habilidades }),
        ...(data.disponibilidade && { disponibilidade: data.disponibilidade }),
        ...(data.restricoes !== undefined && { restricoes: data.restricoes }),
      },
    })
    return NextResponse.json(mapProfile(user))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
