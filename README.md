# Seareiros Web — Gestão da Cozinha

PWA de gestão de eventos gastronômicos de caridade do **Grupo Espírita Seareiros do Bem** (sopas semanais para hospitais, feijoadas, festas juninas).

---

## 1. Identidade do Projeto

| | |
|---|---|
| **Nome** | Seareiros Web — Gestão da Cozinha |
| **Organização** | Grupo Espírita Seareiros do Bem |
| **Propósito** | Gestão de eventos gastronômicos de caridade |
| **Tipo** | PWA (Progressive Web App) — instalável no celular |

---

## 2. Localização e Repositório

| | |
|---|---|
| **Pasta local** | `C:\Users\USER\Documents\claude projects\cozinha_gesb\seareiros-web` |
| **GitHub** | `github.com/lemestavarescomunica-hub/seareiros-web` |
| **Branch principal** | `master` |
| **Deploy** | Vercel → **seareiros-web.vercel.app** |
| **Projeto Vercel** | `prj_VTGUhtXol78BLyMf8lCRdkjaJwyG` (team: Paulo Tavares' projects) |

---

## 3. Stack Técnica

```
Frontend:     Next.js 16.2.7 (App Router) + Turbopack
Estilo:       Tailwind CSS v4
Estado:       Zustand (com cache localStorage)
Auth:         NextAuth.js v4 (JWT + CredentialsProvider + bcrypt)
ORM:          Prisma v5.22
Banco:        PostgreSQL (servidor Hetzner próprio)
UI libs:      Headless UI + Lucide React + React Hot Toast
```

---

## 4. Banco de Dados

### Servidor

```
Host:     178.156.179.224
Porta:    5432
Banco:    seareiros
Usuário:  seareiros_admin
```

### 20 Modelos Prisma (agrupados por domínio)

| Domínio | Modelos |
|---|---|
| **Auth** | `User` (roles: ADMIN / LEITOR) |
| **Produtos** | `Produto`, `HistoricoPreco` |
| **Receitas** | `Receita`, `ReceitaIngrediente` |
| **Eventos** | `Evento`, `EventoPrato` |
| **Lista de Compras** | `ListaCompras`, `ListaComprasItem` |
| **Voluntários** | `EventoVoluntario` |
| **Estoque** | `Estoque`, `EstoqueLote`, `EstoqueMovimentacao` |
| **Vendas** | `ItemVenda` |
| **Cotações** | `Cotacao`, `CotacaoFornecedor`, `CotacaoItem`, `CotacaoPreco` |

### Usuário padrão (seed)

```
Email:  admin@seareiros.org
Senha:  admin123
Role:   ADMIN
```

> ⚠️ Trocar a senha após o primeiro acesso em produção.

---

## 5. Variáveis de Ambiente

Arquivo de referência: `.env.example`

```env
DATABASE_URL="postgresql://seareiros_admin:SENHA@178.156.179.224:5432/seareiros"
NEXTAUTH_SECRET="gerar com: openssl rand -base64 32"
NEXTAUTH_URL="https://seareiros-web.vercel.app"
```

Essas 3 variáveis precisam estar configuradas em:
- **Local:** arquivo `.env` na raiz do projeto (não comitar — já está no `.gitignore`)
- **Vercel:** Settings → Environment Variables

---

## 6. Estrutura de Pastas

```
seareiros-web/
├── prisma/
│   ├── schema.prisma       ← 20 modelos do banco
│   └── seed.ts             ← cria admin inicial
├── src/
│   ├── app/
│   │   ├── (app)/          ← rotas protegidas (requer login)
│   │   │   ├── dashboard/
│   │   │   ├── receitas/       + [id]/ + [id]/editar/ + nova/
│   │   │   ├── eventos/        + [id]/ + novo/
│   │   │   ├── equipe/         + [id]/ + novo/
│   │   │   ├── produtos/
│   │   │   ├── estoque/
│   │   │   ├── vendas/
│   │   │   ├── precos/evolucao/
│   │   │   ├── cotacoes/       + [id]/
│   │   │   ├── configuracoes/
│   │   │   └── mais/
│   │   ├── (auth)/login/   ← tela de login
│   │   └── api/            ← 16 API Routes server-side
│   │       ├── auth/[...nextauth]/
│   │       ├── auth/registro/
│   │       ├── produtos/       + [id]/
│   │       ├── receitas/       + [id]/
│   │       ├── eventos/        + [id]/lista-compras/
│   │       │                   + [id]/vendas/
│   │       │                   + [id]/voluntarios/
│   │       ├── estoque/
│   │       ├── cotacoes/       + [id]/
│   │       ├── historico-precos/
│   │       ├── upload-foto/
│   │       └── usuarios/
│   ├── components/
│   │   ├── layout/         ← AppLayout, Sidebar, BottomNav, AuthGuard
│   │   └── ui/             ← Avatar, Card, EmptyState, FotoUpload, Modal,
│   │                          PageHeader, StatusBadge
│   ├── stores/             ← Zustand (9 stores, fetch + cache localStorage)
│   ├── lib/
│   │   ├── prisma.ts       ← singleton PrismaClient
│   │   ├── mappers.ts      ← converte dados Prisma → tipos TypeScript
│   │   └── utils.ts        ← formatadores de data, moeda, etc.
│   └── types/
│       ├── index.ts        ← todos os tipos TypeScript do domínio
│       └── next-auth.d.ts  ← extensão dos tipos de sessão
```

---

## 7. API Routes

| Rota | Métodos | O que faz |
|---|---|---|
| `/api/auth/[...nextauth]` | POST | Login / logout (NextAuth) |
| `/api/auth/registro` | POST | Cadastro de novo usuário |
| `/api/produtos` | GET / POST | Listar / criar produto |
| `/api/produtos/[id]` | GET / PUT / DELETE | Detalhe / editar / excluir |
| `/api/receitas` | GET / POST | Listar / criar receita |
| `/api/receitas/[id]` | GET / PUT / DELETE | Detalhe / editar / excluir |
| `/api/eventos` | GET / POST | Listar / criar evento |
| `/api/eventos/[id]` | GET / PUT / DELETE | Detalhe / editar / excluir |
| `/api/eventos/[id]/lista-compras` | GET / POST | Gerar / buscar lista de compras |
| `/api/eventos/[id]/vendas` | GET / POST | Itens de venda do evento |
| `/api/eventos/[id]/voluntarios` | GET / POST | Equipe escalada |
| `/api/estoque` | GET / POST | Controle de estoque e lotes |
| `/api/cotacoes` | GET / POST | Listar / criar cotação |
| `/api/cotacoes/[id]` | GET / PUT / DELETE | Detalhe da cotação |
| `/api/historico-precos` | GET / POST | Evolução de preços por produto |
| `/api/upload-foto` | POST | Upload de foto (Base64 no banco) |
| `/api/usuarios` | GET / POST / PUT | Gerenciar voluntários/usuários |

---

## 8. Paleta de Cores

| Cor | Hex | Uso |
|---|---|---|
| Terracota | `#D4764E` | Cor primária, botões, destaques |
| Verde sálvia | `#5B8C5A` | Sucesso, confirmação |
| Amarelo mostarda | `#E8C547` | Avisos, alertas |
| Fundo creme | `#FFF9F2` | Background geral |

---

## 9. Comandos Essenciais

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Gerar client Prisma (após mudar schema)
npx prisma generate

# Aplicar schema no banco
npx prisma db push

# Popular banco com admin inicial
npx prisma db seed

# Build de produção
npm run build          # = prisma generate && next build
```

---

## 10. Status Atual

| Item | Status |
|---|---|
| Build local | ✅ Sem erros |
| Deploy Vercel | ✅ READY |
| Banco PostgreSQL | ✅ Online (Hetzner) |
| Autenticação | ✅ NextAuth JWT |
| Integração Supabase | ❌ Removida — migrado para PostgreSQL próprio |
| App mobile (React Native) | ✅ MVP com dados mockados (projeto separado: `seareiros-app`) |
