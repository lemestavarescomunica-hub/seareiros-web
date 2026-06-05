import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const senhaHash = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@seareiros.org' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@seareiros.org',
      senha: senhaHash,
      role: 'ADMIN',
      ativo: true,
      habilidades: ['Coordenação', 'Administração'],
    },
  })

  console.log('Seed concluído!')
  console.log(`Login: admin@seareiros.org / admin123`)
  console.log(`Admin ID: ${admin.id}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
