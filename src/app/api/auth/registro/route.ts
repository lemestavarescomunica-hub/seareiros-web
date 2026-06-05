import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { nome, email, senha, telefone } = await req.json()

    const existe = await prisma.user.findUnique({ where: { email } })
    if (existe) {
      return NextResponse.json({ error: 'Este email já está cadastrado' }, { status: 400 })
    }

    const senhaHash = await bcrypt.hash(senha, 12)
    const totalUsuarios = await prisma.user.count()
    const role = totalUsuarios === 0 ? 'ADMIN' : 'LEITOR'

    const user = await prisma.user.create({
      data: { nome, email, senha: senhaHash, telefone, role: role as any },
    })

    return NextResponse.json({ message: 'Cadastro realizado com sucesso!', userId: user.id })
  } catch {
    return NextResponse.json({ error: 'Erro ao cadastrar usuário' }, { status: 500 })
  }
}
