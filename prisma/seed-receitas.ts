import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper: cria produto se não existir, atualiza preço se já existir
async function upsertProduto(
  nome: string,
  categoria: any,
  unidadeCompra: string,
  precoMedio: number,
  fornecedor?: string
) {
  let produto = await prisma.produto.findFirst({ where: { nome } })

  if (produto) {
    produto = await prisma.produto.update({
      where: { id: produto.id },
      data: { categoria, unidadeCompra, precoMedio, fornecedor },
    })
    console.log(`  ✏️  Atualizado: ${nome}`)
  } else {
    produto = await prisma.produto.create({
      data: { nome, categoria, unidadeCompra, precoMedio, fornecedor },
    })
    // Registra preço inicial no histórico
    await prisma.historicoPreco.create({
      data: {
        produtoId: produto.id,
        preco: precoMedio,
        origem: 'manual',
        eventoNome: 'Cadastro inicial',
      },
    })
    console.log(`  ✅  Criado: ${nome} — R$ ${precoMedio}/${unidadeCompra}`)
  }

  return produto
}

async function main() {
  console.log('\n📦 Criando/atualizando produtos...\n')

  // ── GRÃOS ──────────────────────────────────────────────────────────────────
  const feijaoPreto       = await upsertProduto('Feijão-preto',         'GRAOS',            'kg',     9.00)
  const arroz             = await upsertProduto('Arroz branco',          'GRAOS',            'kg',     6.00)
  const farinhaMandioca   = await upsertProduto('Farinha de mandioca',   'GRAOS',            'kg',     7.00)

  // ── CARNES ─────────────────────────────────────────────────────────────────
  const carneSeca         = await upsertProduto('Carne-seca',                    'CARNES', 'kg', 58.80)
  const costelinhaStna    = await upsertProduto('Costelinha suína salgada',      'CARNES', 'kg', 38.80)
  const lomboSuino        = await upsertProduto('Lombo suíno salgado',           'CARNES', 'kg', 38.80)
  const linguicaCalabresa = await upsertProduto('Linguiça calabresa',            'CARNES', 'kg', 28.80)
  const paio              = await upsertProduto('Paio',                          'CARNES', 'kg', 34.80)
  const bacon             = await upsertProduto('Bacon',                         'CARNES', 'kg', 48.80)
  const pePorco           = await upsertProduto('Pé de porco',                   'CARNES', 'kg', 16.80)
  const orelha            = await upsertProduto('Orelha suína',                  'CARNES', 'kg', 16.80)
  const rabo              = await upsertProduto('Rabo suíno',                    'CARNES', 'kg', 32.80)
  const barrigaTorresmo   = await upsertProduto('Barriga suína para torresmo',   'CARNES', 'kg', 26.80)

  // ── VERDURAS E LEGUMES ─────────────────────────────────────────────────────
  const cebola            = await upsertProduto('Cebola',          'VERDURAS_LEGUMES', 'kg',   6.85)
  const couveManteiga     = await upsertProduto('Couve-manteiga',  'VERDURAS_LEGUMES', 'maço', 4.00)
  const laranja           = await upsertProduto('Laranja',         'VERDURAS_LEGUMES', 'kg',   4.00)
  const cheiroVerde       = await upsertProduto('Cheiro-verde',    'VERDURAS_LEGUMES', 'maço', 5.00)

  // ── TEMPEROS ───────────────────────────────────────────────────────────────
  const alho              = await upsertProduto('Alho',             'TEMPEROS', 'kg',     28.00)
  const louro             = await upsertProduto('Folhas de louro',  'TEMPEROS', 'pacote',  5.00)
  const pimentaDoReino    = await upsertProduto('Pimenta-do-reino', 'TEMPEROS', 'kg',     60.00)

  // ── OUTROS ─────────────────────────────────────────────────────────────────
  const sal               = await upsertProduto('Sal',         'OUTROS', 'kg',     4.00)
  const oleo              = await upsertProduto('Óleo de soja','OUTROS', 'frasco', 7.00)

  // ── PRODUTOS NOVOS — RECEITA 02 ────────────────────────────────────────────
  const peito_frango      = await upsertProduto('Peito de frango',      'CARNES',           'kg',         20.00)
  const mandioca          = await upsertProduto('Mandioca descascada',  'VERDURAS_LEGUMES', 'kg',          4.00)
  const massaMilho        = await upsertProduto('Massa de milho',       'GRAOS',            'kg',          6.00)
  const polpaTomate       = await upsertProduto('Polpa de tomate',      'OUTROS',           'unidade',     3.00)
  const pimentao          = await upsertProduto('Pimentão',             'VERDURAS_LEGUMES', 'kg',         10.00)
  const acafrao           = await upsertProduto('Açafrão-da-terra',     'TEMPEROS',         'kg',         32.00)
  const pimentaCheiro     = await upsertProduto('Pimenta-de-cheiro',    'TEMPEROS',         'kg',         20.00)
  const caldoGalinha      = await upsertProduto('Caldo de galinha',     'TEMPEROS',         'pacote',      7.50)

  // ── PRODUTOS NOVOS — RECEITA 03 ────────────────────────────────────────────
  const feijaoCarPre      = await upsertProduto('Feijão-carioca',       'GRAOS',            'kg',          9.00)

  // ── PRODUTOS NOVOS — RECEITA 04 ────────────────────────────────────────────
  const cremedeleite      = await upsertProduto('Creme de leite',       'LATICINIOS',       'caixinha',    2.50)
  const ketchup           = await upsertProduto('Ketchup',              'OUTROS',           'kg',         12.00)
  const mostarda          = await upsertProduto('Mostarda',             'OUTROS',           'kg',         12.00)
  const molhoIngles       = await upsertProduto('Molho inglês',         'TEMPEROS',         'litro',      20.00)
  const champignon        = await upsertProduto('Champignon',           'VERDURAS_LEGUMES', 'kg',         35.00)
  const margarina         = await upsertProduto('Manteiga/Margarina',   'LATICINIOS',       'kg',         15.00)
  const batatapalha       = await upsertProduto('Batata palha',         'OUTROS',           'kg',         36.00)

  // ── PRODUTOS NOVOS — RECEITA 05 ────────────────────────────────────────────
  const paoCachorroQuente = await upsertProduto('Pão de cachorro-quente','OUTROS',          'pacote',     10.00)
  const salsicha          = await upsertProduto('Salsicha',              'CARNES',          'kg',         12.00)
  const milhoVerde        = await upsertProduto('Milho-verde',           'VERDURAS_LEGUMES','unidade',     4.00)
  const maionese          = await upsertProduto('Maionese',              'OUTROS',          'kg',         15.00)

  // ── PRODUTOS NOVOS — RECEITA 06 ────────────────────────────────────────────
  const farinhaPizza      = await upsertProduto('Farinha de trigo para pizza (Venturelli)', 'GRAOS',            'pacote 5kg', 25.00)
  const fermentoBioSeco   = await upsertProduto('Fermento biológico seco',                  'TEMPEROS',         'kg',         30.00)
  const acucar            = await upsertProduto('Açúcar',                                   'OUTROS',           'kg',          4.00)
  const tomatePelado      = await upsertProduto('Tomate pelado (lata 2,55 kg)',              'OUTROS',           'lata',       15.00)
  const mucarelaScala     = await upsertProduto('Muçarela',                                  'LATICINIOS',       'kg',         30.00)
  const catupiry          = await upsertProduto('Catupiry',                                  'LATICINIOS',       'kg',         35.00)
  const presunto          = await upsertProduto('Presunto',                                  'CARNES',           'kg',         25.00)
  const ovos              = await upsertProduto('Ovos',                                      'OUTROS',           'unidade',     1.00)
  const palmito           = await upsertProduto('Palmito drenado',                           'VERDURAS_LEGUMES', 'kg',         25.00)
  const tomateFresco      = await upsertProduto('Tomate fresco',                             'VERDURAS_LEGUMES', 'kg',          5.00)
  const azeitonas         = await upsertProduto('Azeitonas',                                 'OUTROS',           'kg',         25.00)
  const oregano           = await upsertProduto('Orégano seco',                              'TEMPEROS',         'kg',         40.00)
  const manjericao        = await upsertProduto('Manjericão',                                'VERDURAS_LEGUMES', 'maço',        4.00)

  // ── RECEITA 01: FEIJOADA COMPLETA ──────────────────────────────────────────
  console.log('\n🍲 Criando receita: Feijoada Completa...\n')

  // Remove ingredientes antigos se a receita já existir
  let receita = await prisma.receita.findFirst({
    where: { nome: 'Feijoada Completa' },
  })

  if (receita) {
    await prisma.receitaIngrediente.deleteMany({ where: { receitaId: receita.id } })
    receita = await prisma.receita.update({
      where: { id: receita.id },
      data: {
        categoria:         'PRATO_PRINCIPAL',
        rendimentoBase:    100,
        unidadeRendimento: 'porções',
        tempoPreparoMin:   240,
        observacoes:
          'Custo estimado total: R$ 1.354,15 (R$ 13,54/pessoa). ' +
          'Com 10% margem: R$ 1.489,57 | Com 15%: R$ 1.557,27. ' +
          'Inclui feijoada + acompanhamentos (arroz, couve, farofa, torresmo, laranja).',
        modoPreparo:
          'FEIJOADA: Deixar as carnes salgadas de molho por 12h trocando a água. ' +
          'Cozinhar o feijão até ficar macio. Refogar alho e cebola no óleo, ' +
          'adicionar as carnes e o feijão. Temperar com louro, sal e pimenta. ' +
          'Cozinhar em fogo baixo por 1h.\n\n' +
          'ARROZ: Refogar alho no óleo, adicionar o arroz, água e sal. Cozinhar até secar.\n\n' +
          'TORRESMO: Cortar a barriga suína em cubos, temperar com sal e fritar até dourar.\n\n' +
          'FAROFA: Dourar alho no óleo, adicionar a farinha de mandioca, sal e cheiro-verde.\n\n' +
          'COUVE: Refogar com alho no óleo, sal a gosto.\n\n' +
          'Servir com laranja fatiada.',
      },
    })
    console.log('  ✏️  Receita atualizada')
  } else {
    receita = await prisma.receita.create({
      data: {
        nome:              'Feijoada Completa',
        categoria:         'PRATO_PRINCIPAL',
        rendimentoBase:    100,
        unidadeRendimento: 'porções',
        tempoPreparoMin:   240,
        observacoes:
          'Custo estimado total: R$ 1.354,15 (R$ 13,54/pessoa). ' +
          'Com 10% margem: R$ 1.489,57 | Com 15%: R$ 1.557,27. ' +
          'Inclui feijoada + acompanhamentos (arroz, couve, farofa, torresmo, laranja).',
        modoPreparo:
          'FEIJOADA: Deixar as carnes salgadas de molho por 12h trocando a água. ' +
          'Cozinhar o feijão até ficar macio. Refogar alho e cebola no óleo, ' +
          'adicionar as carnes e o feijão. Temperar com louro, sal e pimenta. ' +
          'Cozinhar em fogo baixo por 1h.\n\n' +
          'ARROZ: Refogar alho no óleo, adicionar o arroz, água e sal. Cozinhar até secar.\n\n' +
          'TORRESMO: Cortar a barriga suína em cubos, temperar com sal e fritar até dourar.\n\n' +
          'FAROFA: Dourar alho no óleo, adicionar a farinha de mandioca, sal e cheiro-verde.\n\n' +
          'COUVE: Refogar com alho no óleo, sal a gosto.\n\n' +
          'Servir com laranja fatiada.',
      },
    })
    console.log('  ✅  Receita criada')
  }

  // ── INGREDIENTES ───────────────────────────────────────────────────────────
  const ingredientes = [
    // --- Feijoada ---
    { produto: feijaoPreto,       quantidade: 8,   unidade: 'kg',     obs: 'Base da feijoada' },
    { produto: carneSeca,         quantidade: 4,   unidade: 'kg',     obs: 'Deixar de molho 12h' },
    { produto: costelinhaStna,    quantidade: 3,   unidade: 'kg',     obs: 'Deixar de molho 12h' },
    { produto: lomboSuino,        quantidade: 2.5, unidade: 'kg',     obs: 'Deixar de molho 12h' },
    { produto: linguicaCalabresa, quantidade: 4,   unidade: 'kg',     obs: null },
    { produto: paio,              quantidade: 2,   unidade: 'kg',     obs: null },
    { produto: bacon,             quantidade: 2,   unidade: 'kg',     obs: null },
    { produto: pePorco,           quantidade: 1.5, unidade: 'kg',     obs: 'Deixar de molho 12h' },
    { produto: orelha,            quantidade: 1,   unidade: 'kg',     obs: 'Deixar de molho 12h' },
    { produto: rabo,              quantidade: 1,   unidade: 'kg',     obs: 'Deixar de molho 12h' },
    // --- Temperos e condimentos (feijoada + acomps combinados) ---
    { produto: cebola,            quantidade: 3,   unidade: 'kg',     obs: '2 kg feijoada + 1 kg acompanhamentos' },
    { produto: alho,              quantidade: 1.2, unidade: 'kg',     obs: '700g feijoada + 500g acompanhamentos' },
    { produto: louro,             quantidade: 1,   unidade: 'pacote', obs: null },
    { produto: oleo,              quantidade: 4,   unidade: 'frascos',obs: '2 frascos feijoada + 2 frascos acompanhamentos' },
    { produto: pimentaDoReino,    quantidade: 0.1, unidade: 'kg',     obs: null },
    { produto: cheiroVerde,       quantidade: 10,  unidade: 'maços',  obs: '5 maços feijoada + 5 maços acompanhamentos' },
    { produto: sal,               quantidade: 1,   unidade: 'kg',     obs: 'Para toda a preparação' },
    // --- Acompanhamentos ---
    { produto: arroz,             quantidade: 7,   unidade: 'kg',     obs: 'Acompanhamento' },
    { produto: couveManteiga,     quantidade: 20,  unidade: 'maços',  obs: 'Acompanhamento' },
    { produto: laranja,           quantidade: 15,  unidade: 'kg',     obs: 'Acompanhamento' },
    { produto: farinhaMandioca,   quantidade: 5,   unidade: 'kg',     obs: 'Para farofa' },
    { produto: barrigaTorresmo,   quantidade: 4,   unidade: 'kg',     obs: 'Para torresmo' },
  ]

  for (const ing of ingredientes) {
    await prisma.receitaIngrediente.create({
      data: {
        receitaId:    receita.id,
        produtoId:    ing.produto.id,
        quantidade:   ing.quantidade,
        unidadeMedida: ing.unidade,
        observacao:   ing.obs ?? undefined,
      },
    })
    console.log(`  ✅  Ingrediente: ${ing.produto.nome} — ${ing.quantidade} ${ing.unidade}`)
  }

  console.log('\n🎉 Receita 01 (Feijoada Completa) inserida com sucesso!')
  console.log(`   ID da receita: ${receita.id}`)
  console.log(`   Total de ingredientes: ${ingredientes.length}`)
  console.log(`   Rendimento: 100 porções`)
  console.log(`   Custo estimado: R$ 1.354,15 (R$ 13,54/pessoa)\n`)

  // ── RECEITA 02: CALDO DE FRANGO ────────────────────────────────────────────
  console.log('\n🍲 Criando receita: Caldo de Frango...\n')

  let receita2 = await prisma.receita.findFirst({ where: { nome: 'Caldo de Frango' } })

  if (receita2) {
    await prisma.receitaIngrediente.deleteMany({ where: { receitaId: receita2.id } })
    receita2 = await prisma.receita.update({
      where: { id: receita2.id },
      data: {
        categoria:         'SOPA_SEMANAL',
        rendimentoBase:    100,
        unidadeRendimento: 'porções',
        tempoPreparoMin:   120,
        observacoes:
          'Rendimento: 40 a 45 litros. ' +
          'Custo estimado: R$ 395,93 (R$ 3,96/pessoa), usando massa de milho a R$ 6,00/kg e polpa de tomate a R$ 3,00/un. ' +
          'Subtotal sem massa de milho e polpa: R$ 326,93. ' +
          'ATENÇÃO: a combinação de 8 kg de massa de milho + 6 kg de mandioca engrossa bastante — reserve 8 a 10 litros de água quente para ajuste. ' +
          'Acrescente a massa aos poucos; pode não ser necessário usar os 8 kg completos.',
        modoPreparo:
          '1. COZINHAR O FRANGO: Divida os 8 kg em lotes e cozinhe com parte da cebola, alho, açafrão, pimenta-do-reino, sal e água suficiente para cobrir. ' +
          'Após pegar pressão, cozinhe por 15 a 20 minutos. Retire, desfie e reserve. Guarde toda a água do cozimento.\n\n' +
          '2. COZINHAR A MANDIOCA: Cozinhe os 6 kg até ficarem muito macios. Retire os fiapos centrais e bata no liquidificador com parte da água do cozimento do frango. ' +
          'Não bata com pouca água — o creme ficará pesado demais.\n\n' +
          '3. PREPARAR A MASSA DE MILHO: Dissolva os 8 kg de massa de milho aos poucos em água fria ou levemente morna. ' +
          'Nunca coloque diretamente na panela quente — empelota. Use recipientes grandes e misture até formar uma massa uniforme e relativamente líquida.\n\n' +
          '4. FAZER O REFOGADO: Em duas ou três panelas grandes, aqueça o óleo e refogue: cebola, alho, pimentão, pimenta-de-cheiro, as 7 polpas de tomate e os 100 g de açafrão. ' +
          'Deixe refogar até a polpa perder a acidez.\n\n' +
          '5. MONTAR O CALDO: Acrescente o frango desfiado ao refogado. Em seguida, adicione o creme de mandioca, parte do caldo do cozimento e a massa de milho já dissolvida, ' +
          'mexendo constantemente. Complete gradualmente com água quente ou caldo até atingir 40 a 45 litros.\n\n' +
          '6. COZINHAR A MASSA DE MILHO: Após acrescentar a massa, cozinhe por 30 a 40 minutos mexendo frequentemente para cozinhar o milho por completo, ' +
          'retirar o gosto de massa crua e evitar que grude no fundo.\n\n' +
          'Finalize com cheiro-verde e ajuste o sal. Acrescente água quente conforme o caldo engrossar durante o evento.',
      },
    })
    console.log('  ✏️  Receita atualizada')
  } else {
    receita2 = await prisma.receita.create({
      data: {
        nome:              'Caldo de Frango',
        categoria:         'SOPA_SEMANAL',
        rendimentoBase:    100,
        unidadeRendimento: 'porções',
        tempoPreparoMin:   120,
        observacoes:
          'Rendimento: 40 a 45 litros. ' +
          'Custo estimado: R$ 395,93 (R$ 3,96/pessoa), usando massa de milho a R$ 6,00/kg e polpa de tomate a R$ 3,00/un. ' +
          'Subtotal sem massa de milho e polpa: R$ 326,93. ' +
          'ATENÇÃO: a combinação de 8 kg de massa de milho + 6 kg de mandioca engrossa bastante — reserve 8 a 10 litros de água quente para ajuste. ' +
          'Acrescente a massa aos poucos; pode não ser necessário usar os 8 kg completos.',
        modoPreparo:
          '1. COZINHAR O FRANGO: Divida os 8 kg em lotes e cozinhe com parte da cebola, alho, açafrão, pimenta-do-reino, sal e água suficiente para cobrir. ' +
          'Após pegar pressão, cozinhe por 15 a 20 minutos. Retire, desfie e reserve. Guarde toda a água do cozimento.\n\n' +
          '2. COZINHAR A MANDIOCA: Cozinhe os 6 kg até ficarem muito macios. Retire os fiapos centrais e bata no liquidificador com parte da água do cozimento do frango. ' +
          'Não bata com pouca água — o creme ficará pesado demais.\n\n' +
          '3. PREPARAR A MASSA DE MILHO: Dissolva os 8 kg de massa de milho aos poucos em água fria ou levemente morna. ' +
          'Nunca coloque diretamente na panela quente — empelota. Use recipientes grandes e misture até formar uma massa uniforme e relativamente líquida.\n\n' +
          '4. FAZER O REFOGADO: Em duas ou três panelas grandes, aqueça o óleo e refogue: cebola, alho, pimentão, pimenta-de-cheiro, as 7 polpas de tomate e os 100 g de açafrão. ' +
          'Deixe refogar até a polpa perder a acidez.\n\n' +
          '5. MONTAR O CALDO: Acrescente o frango desfiado ao refogado. Em seguida, adicione o creme de mandioca, parte do caldo do cozimento e a massa de milho já dissolvida, ' +
          'mexendo constantemente. Complete gradualmente com água quente ou caldo até atingir 40 a 45 litros.\n\n' +
          '6. COZINHAR A MASSA DE MILHO: Após acrescentar a massa, cozinhe por 30 a 40 minutos mexendo frequentemente para cozinhar o milho por completo, ' +
          'retirar o gosto de massa crua e evitar que grude no fundo.\n\n' +
          'Finalize com cheiro-verde e ajuste o sal. Acrescente água quente conforme o caldo engrossar durante o evento.',
      },
    })
    console.log('  ✅  Receita criada')
  }

  const ingredientes2 = [
    { produto: peito_frango,   quantidade: 8,   unidade: 'kg',       obs: 'Cozinhar em lotes, desfiar e reservar o caldo' },
    { produto: mandioca,       quantidade: 6,   unidade: 'kg',       obs: 'Cozinhar bem, bater com caldo do frango' },
    { produto: massaMilho,     quantidade: 8,   unidade: 'kg',       obs: 'Dissolver em água fria antes de acrescentar. Usar gradualmente' },
    { produto: polpaTomate,    quantidade: 7,   unidade: 'unidades', obs: 'Refogar até perder a acidez' },
    { produto: cebola,         quantidade: 2.5, unidade: 'kg',       obs: null },
    { produto: alho,           quantidade: 0.7, unidade: 'kg',       obs: '700 g' },
    { produto: pimentao,       quantidade: 1,   unidade: 'kg',       obs: null },
    { produto: cheiroVerde,    quantidade: 8,   unidade: 'maços',    obs: 'Adicionar no final' },
    { produto: oleo,           quantidade: 2,   unidade: 'frascos',  obs: '2 frascos de 900 ml' },
    { produto: acafrao,        quantidade: 0.1, unidade: 'kg',       obs: '100 g — para cor e sabor' },
    { produto: pimentaDoReino, quantidade: 0.1, unidade: 'kg',       obs: '100 g' },
    { produto: pimentaCheiro,  quantidade: 0.5, unidade: 'kg',       obs: '500 g' },
    { produto: sal,            quantidade: 2,   unidade: 'kg',       obs: 'Até 2 kg — ajustar ao gosto' },
    { produto: caldoGalinha,   quantidade: 2,   unidade: 'pacotes',  obs: '2 pacotes grandes' },
  ]

  for (const ing of ingredientes2) {
    await prisma.receitaIngrediente.create({
      data: {
        receitaId:     receita2.id,
        produtoId:     ing.produto.id,
        quantidade:    ing.quantidade,
        unidadeMedida: ing.unidade,
        observacao:    ing.obs ?? undefined,
      },
    })
    console.log(`  ✅  Ingrediente: ${ing.produto.nome} — ${ing.quantidade} ${ing.unidade}`)
  }

  console.log('\n🎉 Receita 02 (Caldo de Frango) inserida com sucesso!')
  console.log(`   ID da receita: ${receita2.id}`)
  console.log(`   Total de ingredientes: ${ingredientes2.length}`)
  console.log(`   Rendimento: 100 porções / 40–45 litros`)
  console.log(`   Custo estimado: R$ 395,93 (R$ 3,96/pessoa)\n`)

  // ── RECEITA 03: CALDO DE FEIJÃO ────────────────────────────────────────────
  console.log('\n🍲 Criando receita: Caldo de Feijão...\n')

  let receita3 = await prisma.receita.findFirst({ where: { nome: 'Caldo de Feijão' } })

  if (receita3) {
    await prisma.receitaIngrediente.deleteMany({ where: { receitaId: receita3.id } })
    receita3 = await prisma.receita.update({
      where: { id: receita3.id },
      data: {
        categoria:         'SOPA_SEMANAL',
        rendimentoBase:    100,
        unidadeRendimento: 'porções',
        tempoPreparoMin:   90,
        observacoes:
          'Rendimento: 38 a 42 litros (porções de 350 a 400 ml). ' +
          'Custo estimado: R$ 467,33 (R$ 4,67/pessoa). ' +
          'Com 10% de margem: R$ 514,06 (R$ 5,14/pessoa). ' +
          'ATENÇÃO: o caldo engrossa enquanto permanece aquecido — mantenha 5 a 8 litros de água quente reservados para ajuste durante o evento. ' +
          'Bacon e calabresa já são salgados: não adicionar sal na etapa de cozimento do feijão.',
        modoPreparo:
          '1. COZINHAR O FEIJÃO: Lavar os 8 kg e deixar de molho por 8 a 12 horas. Dividir em panelas de pressão com água e folhas de louro. ' +
          'Cozinhar por 25 a 35 minutos após pegar pressão, até ficar bem macio. Evitar sal nessa etapa — bacon e calabresa já são salgados.\n\n' +
          '2. BATER O FEIJÃO: Bater aproximadamente 70% do feijão no liquidificador com a própria água do cozimento. ' +
          'Manter 30% dos grãos inteiros para dar textura ao caldo.\n\n' +
          '3. PREPARAR O BACON E A CALABRESA: Cortar o bacon em cubos pequenos e a calabresa em cubos ou rodelas finas. ' +
          'Fritar o bacon nas panelas grandes, acrescentar a calabresa e deixar dourar levemente. Retirar o excesso de gordura se necessário.\n\n' +
          '4. FAZER O REFOGADO: Na mesma panela, refogar: cebola, alho, pimentão, pimenta-de-cheiro, polpa de tomate e pimenta-do-reino. ' +
          'Refogar até a cebola ficar macia e a polpa cozinhar bem.\n\n' +
          '5. MONTAR O CALDO: Adicionar o feijão batido e os grãos inteiros ao refogado com bacon e calabresa. ' +
          'Acrescentar água quente aos poucos até atingir aproximadamente 40 litros. ' +
          'Cozinhar em fogo baixo por 30 minutos, mexendo frequentemente para não agarrar no fundo.\n\n' +
          '6. FINALIZAR: Adicionar o cheiro-verde nos minutos finais. Provar e acertar o sal. ' +
          'Manter 5 a 8 litros de água quente reservados para acrescentar conforme o caldo engrossar.',
      },
    })
    console.log('  ✏️  Receita atualizada')
  } else {
    receita3 = await prisma.receita.create({
      data: {
        nome:              'Caldo de Feijão',
        categoria:         'SOPA_SEMANAL',
        rendimentoBase:    100,
        unidadeRendimento: 'porções',
        tempoPreparoMin:   90,
        observacoes:
          'Rendimento: 38 a 42 litros (porções de 350 a 400 ml). ' +
          'Custo estimado: R$ 467,33 (R$ 4,67/pessoa). ' +
          'Com 10% de margem: R$ 514,06 (R$ 5,14/pessoa). ' +
          'ATENÇÃO: o caldo engrossa enquanto permanece aquecido — mantenha 5 a 8 litros de água quente reservados para ajuste durante o evento. ' +
          'Bacon e calabresa já são salgados: não adicionar sal na etapa de cozimento do feijão.',
        modoPreparo:
          '1. COZINHAR O FEIJÃO: Lavar os 8 kg e deixar de molho por 8 a 12 horas. Dividir em panelas de pressão com água e folhas de louro. ' +
          'Cozinhar por 25 a 35 minutos após pegar pressão, até ficar bem macio. Evitar sal nessa etapa — bacon e calabresa já são salgados.\n\n' +
          '2. BATER O FEIJÃO: Bater aproximadamente 70% do feijão no liquidificador com a própria água do cozimento. ' +
          'Manter 30% dos grãos inteiros para dar textura ao caldo.\n\n' +
          '3. PREPARAR O BACON E A CALABRESA: Cortar o bacon em cubos pequenos e a calabresa em cubos ou rodelas finas. ' +
          'Fritar o bacon nas panelas grandes, acrescentar a calabresa e deixar dourar levemente. Retirar o excesso de gordura se necessário.\n\n' +
          '4. FAZER O REFOGADO: Na mesma panela, refogar: cebola, alho, pimentão, pimenta-de-cheiro, polpa de tomate e pimenta-do-reino. ' +
          'Refogar até a cebola ficar macia e a polpa cozinhar bem.\n\n' +
          '5. MONTAR O CALDO: Adicionar o feijão batido e os grãos inteiros ao refogado com bacon e calabresa. ' +
          'Acrescentar água quente aos poucos até atingir aproximadamente 40 litros. ' +
          'Cozinhar em fogo baixo por 30 minutos, mexendo frequentemente para não agarrar no fundo.\n\n' +
          '6. FINALIZAR: Adicionar o cheiro-verde nos minutos finais. Provar e acertar o sal. ' +
          'Manter 5 a 8 litros de água quente reservados para acrescentar conforme o caldo engrossar.',
      },
    })
    console.log('  ✅  Receita criada')
  }

  const ingredientes3 = [
    { produto: feijaoCarPre,   quantidade: 8,   unidade: 'kg',       obs: 'Feijão-carioca ou preto. Deixar de molho 8–12h' },
    { produto: bacon,          quantidade: 3,   unidade: 'kg',       obs: 'Fritar antes do refogado' },
    { produto: linguicaCalabresa, quantidade: 4, unidade: 'kg',      obs: 'Dourar com o bacon' },
    { produto: cebola,         quantidade: 2.5, unidade: 'kg',       obs: null },
    { produto: alho,           quantidade: 0.7, unidade: 'kg',       obs: '700 g' },
    { produto: polpaTomate,    quantidade: 5,   unidade: 'unidades', obs: null },
    { produto: pimentao,       quantidade: 1,   unidade: 'kg',       obs: null },
    { produto: cheiroVerde,    quantidade: 8,   unidade: 'maços',    obs: 'Adicionar nos minutos finais' },
    { produto: louro,          quantidade: 1,   unidade: 'pacote',   obs: 'Colocar no cozimento do feijão' },
    { produto: oleo,           quantidade: 1,   unidade: 'frasco',   obs: '1 frasco de 900 ml' },
    { produto: pimentaDoReino, quantidade: 0.1, unidade: 'kg',       obs: '100 g' },
    { produto: pimentaCheiro,  quantidade: 0.5, unidade: 'kg',       obs: '500 g' },
    { produto: sal,            quantidade: 1,   unidade: 'kg',       obs: 'Até 1 kg — provar antes de salgar (bacon e calabresa já são salgados)' },
  ]

  for (const ing of ingredientes3) {
    await prisma.receitaIngrediente.create({
      data: {
        receitaId:     receita3.id,
        produtoId:     ing.produto.id,
        quantidade:    ing.quantidade,
        unidadeMedida: ing.unidade,
        observacao:    ing.obs ?? undefined,
      },
    })
    console.log(`  ✅  Ingrediente: ${ing.produto.nome} — ${ing.quantidade} ${ing.unidade}`)
  }

  console.log('\n🎉 Receita 03 (Caldo de Feijão) inserida com sucesso!')
  console.log(`   ID da receita: ${receita3.id}`)
  console.log(`   Total de ingredientes: ${ingredientes3.length}`)
  console.log(`   Rendimento: 100 porções / 38–42 litros`)
  console.log(`   Custo estimado: R$ 467,33 (R$ 4,67/pessoa)\n`)

  // ── RECEITA 04: ESTROGONOFE DE FRANGO ─────────────────────────────────────
  console.log('\n🍲 Criando receita: Estrogonofe de Frango...\n')

  let receita4 = await prisma.receita.findFirst({ where: { nome: 'Estrogonofe de Frango' } })

  if (receita4) {
    await prisma.receitaIngrediente.deleteMany({ where: { receitaId: receita4.id } })
    receita4 = await prisma.receita.update({
      where: { id: receita4.id },
      data: {
        categoria:         'PRATO_PRINCIPAL',
        rendimentoBase:    100,
        unidadeRendimento: 'porções',
        tempoPreparoMin:   120,
        observacoes:
          'Custo estimado COM champignon: R$ 1.060,80 (R$ 10,61/pessoa). ' +
          'Custo estimado SEM champignon: R$ 955,80 (R$ 9,56/pessoa). ' +
          'Com 10% de margem: R$ 1.166,88 (com) | R$ 1.051,38 (sem). ' +
          'DICA: dividir em 2 panelas — 9 kg de frango + metade dos ingredientes em cada. ' +
          'ATENÇÃO: não exagerar no sal — molho inglês, ketchup e mostarda já são salgados. ' +
          'Molho inglês NÃO flamba — serve para deglacear a panela, soltando o sabor dourado do fundo.',
        modoPreparo:
          '1. CORTAR E TEMPERAR O FRANGO: Cortar os 18 kg em cubos médios. Temperar com alho, pimenta-do-reino e sal moderado ' +
          '(ketchup, mostarda e molho inglês já são salgados).\n\n' +
          '2. FRITAR O FRANGO EM PORÇÕES: Aquecer bem a panela com óleo e manteiga. Fritar o frango em pequenas porções, ' +
          'deixando dourar bem antes de mexer para criar camada dourada no fundo. Reservar o frango.\n\n' +
          '3. DEGLACEAR COM MOLHO INGLÊS: Após cada rodada de frango, adicionar 50 a 100 ml de molho inglês na panela ainda quente. ' +
          'Usar espátula para soltar todo o sabor dourado do fundo. Usar ~1 litro dividido entre todas as rodadas — não colocar tudo de uma vez.\n\n' +
          '4. REFOGAR CEBOLA E ALHO: Na mesma panela, refogar cebola e alho com manteiga ou óleo até ficarem macios e levemente dourados. ' +
          'Voltar o frango para a panela.\n\n' +
          '5. ACRESCENTAR KETCHUP, MOSTARDA E CHAMPIGNON: Adicionar 4 kg de ketchup, 2 kg de mostarda e o champignon (se usar). ' +
          'Misturar bem e cozinhar por 10 a 15 minutos. Se ficar muito concentrado, acrescentar água quente ou caldo de frango aos poucos (máx. 3 litros).\n\n' +
          '6. FINALIZAR COM CREME DE LEITE: Baixar o fogo. Acrescentar as 50 caixinhas de creme de leite aos poucos, mexendo sem deixar ferver. ' +
          'Provar e ajustar sal, mostarda, molho inglês e pimenta-do-reino.\n\n' +
          'DIVISÃO EM 2 PANELAS: 9 kg frango | 25 cx creme de leite | 2 kg ketchup | 1 kg mostarda | 500 ml molho inglês | 2 kg cebola | 250 g alho por panela.',
      },
    })
    console.log('  ✏️  Receita atualizada')
  } else {
    receita4 = await prisma.receita.create({
      data: {
        nome:              'Estrogonofe de Frango',
        categoria:         'PRATO_PRINCIPAL',
        rendimentoBase:    100,
        unidadeRendimento: 'porções',
        tempoPreparoMin:   120,
        observacoes:
          'Custo estimado COM champignon: R$ 1.060,80 (R$ 10,61/pessoa). ' +
          'Custo estimado SEM champignon: R$ 955,80 (R$ 9,56/pessoa). ' +
          'Com 10% de margem: R$ 1.166,88 (com) | R$ 1.051,38 (sem). ' +
          'DICA: dividir em 2 panelas — 9 kg de frango + metade dos ingredientes em cada. ' +
          'ATENÇÃO: não exagerar no sal — molho inglês, ketchup e mostarda já são salgados. ' +
          'Molho inglês NÃO flamba — serve para deglacear a panela, soltando o sabor dourado do fundo.',
        modoPreparo:
          '1. CORTAR E TEMPERAR O FRANGO: Cortar os 18 kg em cubos médios. Temperar com alho, pimenta-do-reino e sal moderado ' +
          '(ketchup, mostarda e molho inglês já são salgados).\n\n' +
          '2. FRITAR O FRANGO EM PORÇÕES: Aquecer bem a panela com óleo e manteiga. Fritar o frango em pequenas porções, ' +
          'deixando dourar bem antes de mexer para criar camada dourada no fundo. Reservar o frango.\n\n' +
          '3. DEGLACEAR COM MOLHO INGLÊS: Após cada rodada de frango, adicionar 50 a 100 ml de molho inglês na panela ainda quente. ' +
          'Usar espátula para soltar todo o sabor dourado do fundo. Usar ~1 litro dividido entre todas as rodadas — não colocar tudo de uma vez.\n\n' +
          '4. REFOGAR CEBOLA E ALHO: Na mesma panela, refogar cebola e alho com manteiga ou óleo até ficarem macios e levemente dourados. ' +
          'Voltar o frango para a panela.\n\n' +
          '5. ACRESCENTAR KETCHUP, MOSTARDA E CHAMPIGNON: Adicionar 4 kg de ketchup, 2 kg de mostarda e o champignon (se usar). ' +
          'Misturar bem e cozinhar por 10 a 15 minutos. Se ficar muito concentrado, acrescentar água quente ou caldo de frango aos poucos (máx. 3 litros).\n\n' +
          '6. FINALIZAR COM CREME DE LEITE: Baixar o fogo. Acrescentar as 50 caixinhas de creme de leite aos poucos, mexendo sem deixar ferver. ' +
          'Provar e ajustar sal, mostarda, molho inglês e pimenta-do-reino.\n\n' +
          'DIVISÃO EM 2 PANELAS: 9 kg frango | 25 cx creme de leite | 2 kg ketchup | 1 kg mostarda | 500 ml molho inglês | 2 kg cebola | 250 g alho por panela.',
      },
    })
    console.log('  ✅  Receita criada')
  }

  const ingredientes4 = [
    // --- Frango ---
    { produto: peito_frango,  quantidade: 18,  unidade: 'kg',        obs: 'Cortar em cubos médios. Temperar com alho, pimenta e sal moderado' },
    // --- Molhos ---
    { produto: cremedeleite,  quantidade: 50,  unidade: 'caixinhas', obs: 'Adicionar no final com fogo baixo, sem ferver' },
    { produto: ketchup,       quantidade: 4,   unidade: 'kg',        obs: null },
    { produto: mostarda,      quantidade: 2,   unidade: 'kg',        obs: null },
    { produto: molhoIngles,   quantidade: 1,   unidade: 'litro',     obs: 'Usar 50–100 ml por rodada de fritura para deglacear. Não colocar tudo de uma vez' },
    // --- Aromáticos ---
    { produto: cebola,        quantidade: 4,   unidade: 'kg',        obs: null },
    { produto: alho,          quantidade: 0.5, unidade: 'kg',        obs: '500 g' },
    { produto: champignon,    quantidade: 3,   unidade: 'kg',        obs: 'OPCIONAL — retirar para versão sem champignon (economia de R$ 105,00)' },
    // --- Gorduras ---
    { produto: oleo,          quantidade: 2,   unidade: 'frascos',   obs: '2 frascos de 900 ml — para fritar o frango' },
    { produto: margarina,     quantidade: 1,   unidade: 'kg',        obs: 'Manteiga ou margarina' },
    // --- Temperos ---
    { produto: pimentaDoReino,quantidade: 0.1, unidade: 'kg',        obs: '100 g' },
    { produto: sal,           quantidade: 1,   unidade: 'kg',        obs: 'Até 1 kg — cuidado: ketchup, mostarda e molho inglês já são salgados' },
    // --- Acompanhamentos ---
    { produto: arroz,         quantidade: 10,  unidade: 'kg',        obs: 'Acompanhamento' },
    { produto: batatapalha,   quantidade: 6,   unidade: 'kg',        obs: 'Acompanhamento — servir por cima' },
  ]

  for (const ing of ingredientes4) {
    await prisma.receitaIngrediente.create({
      data: {
        receitaId:     receita4.id,
        produtoId:     ing.produto.id,
        quantidade:    ing.quantidade,
        unidadeMedida: ing.unidade,
        observacao:    ing.obs ?? undefined,
      },
    })
    console.log(`  ✅  Ingrediente: ${ing.produto.nome} — ${ing.quantidade} ${ing.unidade}`)
  }

  console.log('\n🎉 Receita 04 (Estrogonofe de Frango) inserida com sucesso!')
  console.log(`   ID da receita: ${receita4.id}`)
  console.log(`   Total de ingredientes: ${ingredientes4.length}`)
  console.log(`   Rendimento: 100 porções`)
  console.log(`   Custo estimado: R$ 955,80 a R$ 1.060,80 (R$ 9,56–10,61/pessoa)\n`)

  // ── RECEITA 05: CACHORRO-QUENTE ────────────────────────────────────────────
  console.log('\n🌭 Criando receita: Cachorro-Quente...\n')

  let receita5 = await prisma.receita.findFirst({ where: { nome: 'Cachorro-Quente' } })

  if (receita5) {
    await prisma.receitaIngrediente.deleteMany({ where: { receitaId: receita5.id } })
    receita5 = await prisma.receita.update({
      where: { id: receita5.id },
      data: {
        categoria:         'LANCHE',
        rendimentoBase:    100,
        unidadeRendimento: 'unidades',
        tempoPreparoMin:   60,
        observacoes:
          'Custo estimado: R$ 438,10 (R$ 4,38/unidade). ' +
          'Com 10% de margem: R$ 481,91. ' +
          'SEM ervilha. ' +
          'ATENÇÃO: salsichas e molhos já têm bastante sódio — provar antes de salgar. ' +
          'Ketchup, mostarda e maionese (1 kg cada) são para montagem individual — usar bisnagas para controlar desperdício.',
        modoPreparo:
          '1. PREPARAR AS SALSICHAS: Colocar as 100 salsichas em panela grande, cobrir com água e ferver por 5 minutos. Escorrer e descartar a água.\n\n' +
          '2. FAZER O REFOGADO: Em panela grande, aquecer o óleo e refogar: cebola picada, alho, pimentão e pimenta-do-reino. Refogar até a cebola ficar macia.\n\n' +
          '3. PREPARAR O MOLHO: Acrescentar as 10 polpas/sachês de tomate e ~4 litros de água. Cozinhar por 15 minutos.\n\n' +
          '4. COZINHAR AS SALSICHAS NO MOLHO: Colocar as salsichas no molho e cozinhar por 15 a 20 minutos. Acrescentar mais água quente se necessário.\n\n' +
          '5. FINALIZAR: Nos últimos 5 a 10 minutos, acrescentar o milho-verde escorrido. Finalizar com cheiro-verde. Provar antes de salgar.\n\n' +
          'MONTAGEM: Para cada pão — 1 salsicha + porção do molho + ketchup/mostarda/maionese a gosto + batata-palha por cima.',
      },
    })
    console.log('  ✏️  Receita atualizada')
  } else {
    receita5 = await prisma.receita.create({
      data: {
        nome:              'Cachorro-Quente',
        categoria:         'LANCHE',
        rendimentoBase:    100,
        unidadeRendimento: 'unidades',
        tempoPreparoMin:   60,
        observacoes:
          'Custo estimado: R$ 438,10 (R$ 4,38/unidade). ' +
          'Com 10% de margem: R$ 481,91. ' +
          'SEM ervilha. ' +
          'ATENÇÃO: salsichas e molhos já têm bastante sódio — provar antes de salgar. ' +
          'Ketchup, mostarda e maionese (1 kg cada) são para montagem individual — usar bisnagas para controlar desperdício.',
        modoPreparo:
          '1. PREPARAR AS SALSICHAS: Colocar as 100 salsichas em panela grande, cobrir com água e ferver por 5 minutos. Escorrer e descartar a água.\n\n' +
          '2. FAZER O REFOGADO: Em panela grande, aquecer o óleo e refogar: cebola picada, alho, pimentão e pimenta-do-reino. Refogar até a cebola ficar macia.\n\n' +
          '3. PREPARAR O MOLHO: Acrescentar as 10 polpas/sachês de tomate e ~4 litros de água. Cozinhar por 15 minutos.\n\n' +
          '4. COZINHAR AS SALSICHAS NO MOLHO: Colocar as salsichas no molho e cozinhar por 15 a 20 minutos. Acrescentar mais água quente se necessário.\n\n' +
          '5. FINALIZAR: Nos últimos 5 a 10 minutos, acrescentar o milho-verde escorrido. Finalizar com cheiro-verde. Provar antes de salgar.\n\n' +
          'MONTAGEM: Para cada pão — 1 salsicha + porção do molho + ketchup/mostarda/maionese a gosto + batata-palha por cima.',
      },
    })
    console.log('  ✅  Receita criada')
  }

  const ingredientes5 = [
    // --- Base ---
    { produto: paoCachorroQuente, quantidade: 10,   unidade: 'pacotes',   obs: '10 pacotes = 100 unidades (10 pães/pacote)' },
    { produto: salsicha,          quantidade: 5,    unidade: 'kg',        obs: '1 pacote de 5 kg = ~100 unidades' },
    // --- Molho ---
    { produto: polpaTomate,       quantidade: 10,   unidade: 'unidades',  obs: 'Polpa ou sachê de tomate' },
    { produto: cebola,            quantidade: 2,    unidade: 'kg',        obs: null },
    { produto: alho,              quantidade: 0.3,  unidade: 'kg',        obs: '300 g' },
    { produto: pimentao,          quantidade: 1,    unidade: 'kg',        obs: null },
    { produto: milhoVerde,        quantidade: 8,    unidade: 'unidades',  obs: 'Latas ou sachês — escorrer antes de usar' },
    { produto: oleo,              quantidade: 1,    unidade: 'frasco',    obs: '1 frasco de 900 ml' },
    { produto: cheiroVerde,       quantidade: 5,    unidade: 'maços',     obs: 'Adicionar no final' },
    { produto: pimentaDoReino,    quantidade: 0.05, unidade: 'kg',        obs: '50 g' },
    { produto: sal,               quantidade: 0.1,  unidade: 'kg',        obs: 'A gosto — provar antes (salsichas e molhos já têm sódio)' },
    // --- Montagem ---
    { produto: ketchup,           quantidade: 1,    unidade: 'kg',        obs: 'Para montagem — usar bisnaga para controlar' },
    { produto: mostarda,          quantidade: 1,    unidade: 'kg',        obs: 'Para montagem — usar bisnaga para controlar' },
    { produto: maionese,          quantidade: 1,    unidade: 'kg',        obs: 'Para montagem — usar bisnaga para controlar' },
    { produto: batatapalha,       quantidade: 3,    unidade: 'kg',        obs: 'Para montagem — colocar por cima' },
  ]

  for (const ing of ingredientes5) {
    await prisma.receitaIngrediente.create({
      data: {
        receitaId:     receita5.id,
        produtoId:     ing.produto.id,
        quantidade:    ing.quantidade,
        unidadeMedida: ing.unidade,
        observacao:    ing.obs ?? undefined,
      },
    })
    console.log(`  ✅  Ingrediente: ${ing.produto.nome} — ${ing.quantidade} ${ing.unidade}`)
  }

  console.log('\n🎉 Receita 05 (Cachorro-Quente) inserida com sucesso!')
  console.log(`   ID da receita: ${receita5.id}`)
  console.log(`   Total de ingredientes: ${ingredientes5.length}`)
  console.log(`   Rendimento: 100 unidades`)
  console.log(`   Custo estimado: R$ 438,10 (R$ 4,38/unidade)\n`)

  // ── RECEITA 06: PIZZADA — 150 PIZZAS GRANDES ───────────────────────────────
  console.log('\n🍕 Criando receita: Pizzada — 150 Pizzas...\n')

  let receita6 = await prisma.receita.findFirst({ where: { nome: 'Pizzada — 150 Pizzas Grandes' } })

  if (receita6) {
    await prisma.receitaIngrediente.deleteMany({ where: { receitaId: receita6.id } })
    receita6 = await prisma.receita.update({
      where: { id: receita6.id },
      data: {
        categoria:         'PRATO_PRINCIPAL',
        rendimentoBase:    150,
        unidadeRendimento: 'pizzas (35 cm)',
        tempoPreparoMin:   480,
        observacoes:
          'Divisão: 40 Frango c/ Catupiry | 40 Calabresa | 35 Portuguesa | 35 Napoletana. ' +
          '250 g de muçarela por pizza (37,5 kg consumo exato — comprar 40 kg). ' +
          '80 g de molho por pizza (12 kg total — 5 latas de 2,55 kg). ' +
          '7 pacotes de farinha Venturelli (5kg cada) rendem ~154 discos (margem de 4). ' +
          'Preços estimados onde não fornecidos: farinha R$ 25/pacote, muçarela R$ 30/kg, catupiry R$ 35/kg, presunto R$ 25/kg, ovo R$ 1/un, palmito R$ 25/kg drenado, azeitona R$ 25/kg, orégano R$ 40/kg. ' +
          'EMBALAGENS (não incluídas no custo): 165 caixas grandes + 165 liners + 165 mesinhas protetoras + 180 lacres + 180 etiquetas + 600 guardanapos. ' +
          'FRANGO: ~10 kg cru produz 7–7,5 kg desfiado. Temperar e manter seco para não molhar a massa durante entrega.',
        modoPreparo:
          '── MASSA (35 kg / 7 pacotes Venturelli) ──\n' +
          'Multiplicar a receita-base por 7. Referência: 20–22 litros de água | 200–350g fermento seco | 700–900g sal | 500–700g açúcar | 1,5–2 litros de óleo/azeite. ' +
          'Sovar bem, deixar descansar e abrir os 150 discos (sobra margem de 4 discos).\n\n' +
          '── MOLHO (5 latas tomate pelado) ──\n' +
          'Espremer os tomates com as mãos higienizadas, usando também o suco da lata. ' +
          'Acrescentar sal aos poucos (15–18g por lata). Textura levemente rústica. ' +
          'Usar concha padronizada de 80g por pizza. NÃO cozinhar no fogo.\n\n' +
          '── FRANGO COM CATUPIRY (40 pizzas) ──\n' +
          'Cozinhar 10 kg de peito com cebola (1,5 kg), alho (250g), óleo, sal, pimenta-do-reino e cheiro-verde. ' +
          'Desfiar e deixar secar bem. Por pizza: 80g molho + 250g muçarela + 180g frango + 100g catupiry + orégano.\n\n' +
          '── CALABRESA (40 pizzas) ──\n' +
          'Fatiar a calabresa de forma uniforme e fina. Fatiar também a cebola. ' +
          'Por pizza: 80g molho + 250g muçarela + 180g calabresa + 60g cebola + orégano.\n\n' +
          '── PORTUGUESA (35 pizzas) ──\n' +
          'Cozinhar, descascar e fatiar os ovos com antecedência. Manter refrigerados. ' +
          'Por pizza: 80g molho + 250g muçarela + 150g presunto + 2 ovos + 50g cebola + 30g azeitona + orégano.\n\n' +
          '── NAPOLETANA (35 pizzas) ──\n' +
          'Escorrer bem o palmito antes de usar (não usar a água da conserva). Fatiar o tomate em rodelas. ' +
          'Colocar manjericão na saída do forno para não escurecer. ' +
          'Por pizza: 80g molho + 250g muçarela + 100g tomate em rodelas + 100g palmito + manjericão + orégano opcional.\n\n' +
          '── EMBALAGEM ──\n' +
          'Caixas (165) + liners (165) + mesinhas (165) + lacres (180) + etiquetas de sabor (180) + guardanapos (600). ' +
          'Palmito: cada vidro tem ~300g drenado → comprar 14 vidros para 4 kg.',
      },
    })
    console.log('  ✏️  Receita atualizada')
  } else {
    receita6 = await prisma.receita.create({
      data: {
        nome:              'Pizzada — 150 Pizzas Grandes',
        categoria:         'PRATO_PRINCIPAL',
        rendimentoBase:    150,
        unidadeRendimento: 'pizzas (35 cm)',
        tempoPreparoMin:   480,
        observacoes:
          'Divisão: 40 Frango c/ Catupiry | 40 Calabresa | 35 Portuguesa | 35 Napoletana. ' +
          '250 g de muçarela por pizza (37,5 kg consumo exato — comprar 40 kg). ' +
          '80 g de molho por pizza (12 kg total — 5 latas de 2,55 kg). ' +
          '7 pacotes de farinha Venturelli (5kg cada) rendem ~154 discos (margem de 4). ' +
          'Preços estimados onde não fornecidos: farinha R$ 25/pacote, muçarela R$ 30/kg, catupiry R$ 35/kg, presunto R$ 25/kg, ovo R$ 1/un, palmito R$ 25/kg drenado, azeitona R$ 25/kg, orégano R$ 40/kg. ' +
          'EMBALAGENS (não incluídas no custo): 165 caixas grandes + 165 liners + 165 mesinhas protetoras + 180 lacres + 180 etiquetas + 600 guardanapos. ' +
          'FRANGO: ~10 kg cru produz 7–7,5 kg desfiado. Temperar e manter seco para não molhar a massa durante entrega.',
        modoPreparo:
          '── MASSA (35 kg / 7 pacotes Venturelli) ──\n' +
          'Multiplicar a receita-base por 7. Referência: 20–22 litros de água | 200–350g fermento seco | 700–900g sal | 500–700g açúcar | 1,5–2 litros de óleo/azeite. ' +
          'Sovar bem, deixar descansar e abrir os 150 discos (sobra margem de 4 discos).\n\n' +
          '── MOLHO (5 latas tomate pelado) ──\n' +
          'Espremer os tomates com as mãos higienizadas, usando também o suco da lata. ' +
          'Acrescentar sal aos poucos (15–18g por lata). Textura levemente rústica. ' +
          'Usar concha padronizada de 80g por pizza. NÃO cozinhar no fogo.\n\n' +
          '── FRANGO COM CATUPIRY (40 pizzas) ──\n' +
          'Cozinhar 10 kg de peito com cebola (1,5 kg), alho (250g), óleo, sal, pimenta-do-reino e cheiro-verde. ' +
          'Desfiar e deixar secar bem. Por pizza: 80g molho + 250g muçarela + 180g frango + 100g catupiry + orégano.\n\n' +
          '── CALABRESA (40 pizzas) ──\n' +
          'Fatiar a calabresa de forma uniforme e fina. Fatiar também a cebola. ' +
          'Por pizza: 80g molho + 250g muçarela + 180g calabresa + 60g cebola + orégano.\n\n' +
          '── PORTUGUESA (35 pizzas) ──\n' +
          'Cozinhar, descascar e fatiar os ovos com antecedência. Manter refrigerados. ' +
          'Por pizza: 80g molho + 250g muçarela + 150g presunto + 2 ovos + 50g cebola + 30g azeitona + orégano.\n\n' +
          '── NAPOLETANA (35 pizzas) ──\n' +
          'Escorrer bem o palmito antes de usar (não usar a água da conserva). Fatiar o tomate em rodelas. ' +
          'Colocar manjericão na saída do forno para não escurecer. ' +
          'Por pizza: 80g molho + 250g muçarela + 100g tomate em rodelas + 100g palmito + manjericão + orégano opcional.\n\n' +
          '── EMBALAGEM ──\n' +
          'Caixas (165) + liners (165) + mesinhas (165) + lacres (180) + etiquetas de sabor (180) + guardanapos (600). ' +
          'Palmito: cada vidro tem ~300g drenado → comprar 14 vidros para 4 kg.',
      },
    })
    console.log('  ✅  Receita criada')
  }

  const ingredientes6 = [
    // --- Massa ---
    { produto: farinhaPizza,    quantidade: 7,    unidade: 'pacotes (5kg)',  obs: 'Farinha Venturelli — 7 pacotes = 35 kg → ~154 discos (margem de 4)' },
    { produto: fermentoBioSeco, quantidade: 0.3,  unidade: 'kg',            obs: '200–350g — referência para 35 kg de farinha' },
    { produto: acucar,          quantidade: 0.6,  unidade: 'kg',            obs: '500–700g — referência para a massa' },
    { produto: oleo,            quantidade: 2,    unidade: 'frascos',       obs: '1,5–2 litros para a massa + 500ml para o frango' },
    // --- Molho ---
    { produto: tomatePelado,    quantidade: 5,    unidade: 'latas',         obs: '5 latas de 2,55 kg = 12,75 kg — 80g por pizza, 12 kg necessário' },
    // --- Queijo ---
    { produto: mucarelaScala,   quantidade: 40,   unidade: 'kg',            obs: '250g por pizza — 37,5 kg consumo exato, 40 kg para compra segura' },
    // --- Frango com Catupiry (40 pizzas) ---
    { produto: peito_frango,    quantidade: 10,   unidade: 'kg',            obs: 'Frango com Catupiry — 10 kg cru = ~7–7,5 kg desfiado. Manter seco' },
    { produto: catupiry,        quantidade: 4.5,  unidade: 'kg',            obs: 'Frango com Catupiry — 100g por pizza × 40 = 4 kg (comprar 4,5–5 kg)' },
    // --- Calabresa (40 pizzas) ---
    { produto: linguicaCalabresa, quantidade: 7.5, unidade: 'kg',           obs: 'Calabresa — 180g por pizza × 40 = 7,2 kg (comprar 7,5–8 kg). Fatiar fino' },
    // --- Portuguesa (35 pizzas) ---
    { produto: presunto,        quantidade: 5.5,  unidade: 'kg',            obs: 'Portuguesa — 150g por pizza × 35 = 5,25 kg (comprar 5,5 kg)' },
    { produto: ovos,            quantidade: 75,   unidade: 'unidades',      obs: 'Portuguesa — 2 ovos por pizza × 35 = 70 un (comprar 75). Cozinhar com antecedência' },
    { produto: azeitonas,       quantidade: 1.2,  unidade: 'kg',            obs: 'Portuguesa — 30g por pizza × 35 = 1,05 kg (comprar 1,2 kg drenado)' },
    // --- Napoletana (35 pizzas) ---
    { produto: tomateFresco,    quantidade: 4,    unidade: 'kg',            obs: 'Napoletana — 100g por pizza × 35 = 3,5 kg (comprar 4 kg). Fatiar em rodelas' },
    { produto: palmito,         quantidade: 4,    unidade: 'kg',            obs: 'Napoletana — 100g por pizza × 35 = 3,5 kg (comprar 4 kg drenado = ~14 vidros de 300g)' },
    { produto: manjericao,      quantidade: 9,    unidade: 'maços',         obs: 'Napoletana — 8 a 10 maços. Colocar na saída do forno para não escurecer' },
    // --- Temperos gerais ---
    { produto: cebola,          quantidade: 6,    unidade: 'kg',            obs: '1,5 kg frango + 2,5 kg calabresa + 1,75 kg portuguesa = 5,75 kg (comprar 6 kg)' },
    { produto: alho,            quantidade: 0.25, unidade: 'kg',            obs: '250g — somente para o tempero do frango' },
    { produto: cheiroVerde,     quantidade: 3,    unidade: 'maços',         obs: 'Para o tempero do frango' },
    { produto: oregano,         quantidade: 0.5,  unidade: 'kg',            obs: '500g — finalização de todas as pizzas' },
    { produto: pimentaDoReino,  quantidade: 0.03, unidade: 'kg',            obs: '30g — para o tempero do frango' },
    { produto: sal,             quantidade: 1,    unidade: 'kg',            obs: 'Massa + molho + frango — 700–900g massa, 200–250g molho, a gosto no recheio' },
  ]

  for (const ing of ingredientes6) {
    await prisma.receitaIngrediente.create({
      data: {
        receitaId:     receita6.id,
        produtoId:     ing.produto.id,
        quantidade:    ing.quantidade,
        unidadeMedida: ing.unidade,
        observacao:    ing.obs ?? undefined,
      },
    })
    console.log(`  ✅  Ingrediente: ${ing.produto.nome} — ${ing.quantidade} ${ing.unidade}`)
  }

  console.log('\n🎉 Receita 06 (Pizzada — 150 Pizzas) inserida com sucesso!')
  console.log(`   ID da receita: ${receita6.id}`)
  console.log(`   Total de ingredientes: ${ingredientes6.length}`)
  console.log(`   Rendimento: 150 pizzas grandes (35 cm)`)
  console.log(`   Divisão: 40 Frango Catupiry | 40 Calabresa | 35 Portuguesa | 35 Napoletana\n`)
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
