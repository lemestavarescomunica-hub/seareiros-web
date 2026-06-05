import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('foto') as File
    const userId = formData.get('userId') as string

    if (!file) return NextResponse.json({ error: 'Nenhuma foto enviada' }, { status: 400 })
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Arquivo deve ser uma imagem' }, { status: 400 })
    if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: 'Imagem deve ter no máximo 2MB' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const fotoUrl = `data:${file.type};base64,${base64}`

    await prisma.user.update({ where: { id: userId }, data: { fotoUrl } })
    return NextResponse.json({ message: 'Foto atualizada!', fotoUrl })
  } catch {
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
  }
}
