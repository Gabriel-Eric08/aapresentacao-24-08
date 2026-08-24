// Script de build (executado manualmente, não faz parte do runtime da app).
// Gera src/data/militanciaData.js a partir das planilhas reais em
// src/data/militancia/:
//  - contatos.csv .................................... nome + número (WhatsApp)
//  - LISTAGEM SECMULHER VOLUNTÁRIOS.xlsx .............. setor + bairro/município
//  - Planilha_Relacao_de_Pessoal_20_08_2026_AMANDA_02.xlsx  fallback de
//    bairro/município (endereço completo) e cargo, usado apenas quando a
//    pessoa não é encontrada na LISTAGEM.
//  - ../TERCEIRIZADOS SECMULHER - ELEIÇÃO.xlsx ......... nomes completos,
//    sem telefone, usado só pra completar apelidos/primeiros nomes que
//    sobraram sem nome completo nas outras fontes (ver resolverNomeCompleto).
//
// O cruzamento entre as fontes com telefone é feito pelos 8 últimos dígitos
// do telefone (chave robusta a variações de DDD/9º dígito/formatação). A
// TERCEIRIZADOS não tem telefone — o cruzamento aí é por primeiro nome, e só
// é aplicado quando é uma correspondência única (ver TERCEIRIZADOS_EXCLUIR
// para casos de match único que outra fonte contradiz).
//
// Uso: node scripts/build-militancia-data.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { PE_MUNICIPIOS_GEO } from '../src/data/pernambucoMunicipiosGeo.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SRC_DIR = path.join(ROOT, 'src/data/militancia')
const TERCEIRIZADOS_FILE = path.join(ROOT, 'src/data/TERCEIRIZADOS SECMULHER - ELEIÇÃO.xlsx')
const OUT_FILE = path.join(ROOT, 'src/data/militanciaData.js')

// ---------------------------------------------------------------------------
// Utilidades de texto
// ---------------------------------------------------------------------------

function stripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function normalize(s) {
  return stripAccents(String(s || '')).toLowerCase().trim().replace(/\s+/g, ' ')
}

const PALAVRAS_MINUSCULAS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'as', 'os',
  'ao', 'aos', 'à', 'às', 'em', 'no', 'na', 'nos', 'nas', 'para', 'com', 'por',
])

function titleCase(s) {
  return String(s || '')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((palavra, i) => {
      if (i > 0 && PALAVRAS_MINUSCULAS.has(palavra)) return palavra
      return palavra.charAt(0).toUpperCase() + palavra.slice(1)
    })
    .join(' ')
}

function limparNome(nome) {
  // Remove emojis e demais símbolos decorativos mantendo letras/acentos/espaços/pontuação de nome.
  return String(nome || '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function phoneKey(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (digits.length < 8) return null
  return digits.slice(-8)
}

function formatarTelefone(raw) {
  const digits = String(raw || '').replace(/\D/g, '').replace(/^55/, '')
  if (digits.length < 10) return String(raw || '').trim() || null
  const ddd = digits.slice(0, 2)
  const local = digits.slice(2)
  const meio = local.length === 9 ? local.slice(0, 5) : local.slice(0, 4)
  const fim = local.length === 9 ? local.slice(5) : local.slice(4)
  return `+55 ${ddd} ${meio}-${fim}`
}

// ---------------------------------------------------------------------------
// Índice de municípios reais de PE (malha geográfica já validada)
// ---------------------------------------------------------------------------

const MUNICIPIOS_INDEX = PE_MUNICIPIOS_GEO.map((g) => ({
  id: g.id,
  nome: g.nome,
  mesorregiao: g.mesorregiao,
  norm: normalize(g.nome),
})).sort((a, b) => b.norm.length - a.norm.length) // mais longos primeiro (evita match parcial errado)

// Pequenos desvios de grafia encontrados nas planilhas de origem.
const ALIASES_MUNICIPIO = [
  [/\brecifa\b/g, 'recife'],
  [/\bsalgueirto\b/g, 'salgueiro'],
  [/\bcabo do santo agostinho\b/g, 'cabo de santo agostinho'],
]

function detectarMunicipio(enderecoRaw) {
  let norm = normalize(enderecoRaw)
  norm = norm.replace(/\bcep\b[:.]?\s*[\d.\-]+/g, ' ')
  for (const [re, sub] of ALIASES_MUNICIPIO) norm = norm.replace(re, sub)
  for (const m of MUNICIPIOS_INDEX) {
    if (new RegExp(`\\b${m.norm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(norm)) {
      return m
    }
  }
  return null
}

// Extrai o bairro de um endereço curto no formato "BAIRRO - MUNICÍPIO" (LISTAGEM).
function extrairBairroCurto(enderecoRaw, municipio) {
  if (!municipio) return null
  let norm = normalize(enderecoRaw)
  const idx = norm.indexOf(municipio.norm)
  let resto = idx >= 0 ? norm.slice(0, idx) : norm
  resto = resto.replace(/[-–,]+$/g, '').trim()
  if (!resto) return null
  // Recorta o texto original (preservando acentuação) na mesma extensão do resto normalizado.
  const original = String(enderecoRaw || '').trim()
  const cortado = original.slice(0, resto.length).replace(/[-–,]+$/g, '').trim()
  return titleCase(cortado || resto)
}

// Extrai o bairro de um endereço completo (Planilha_Relacao_de_Pessoal): "... Bairro X ...".
function extrairBairroLongo(enderecoRaw) {
  const m = /bairro\.?\s+(?:do\s+|da\s+|dos\s+|das\s+)?([^,\-–]+)/i.exec(enderecoRaw)
  if (!m) return null
  const bairro = m[1]
    .replace(/\bcep\b.*$/i, '')
    .replace(/[_\-–.\s]+$/, '')
    .trim()
  return bairro ? titleCase(bairro) : null
}

// ---------------------------------------------------------------------------
// 1) contatos.csv — nome + número (roster de autodeclarados militantes)
// ---------------------------------------------------------------------------

const csvRaw = fs.readFileSync(path.join(SRC_DIR, 'contatos.csv'), 'utf8')
const csvLinhas = csvRaw.split(/\r?\n/).filter(Boolean)
csvLinhas.shift() // cabeçalho
const contatos = csvLinhas
  .map((linha) => {
    const idx = linha.lastIndexOf(',')
    const nome = limparNome(linha.slice(0, idx))
    const numero = linha.slice(idx + 1).trim()
    return { nome, numero, key: phoneKey(numero) }
  })
  .filter((c) => c.nome)

// ---------------------------------------------------------------------------
// 2) LISTAGEM SECMULHER VOLUNTÁRIOS.xlsx — setor + endereço curto
// ---------------------------------------------------------------------------

const wbListagem = XLSX.readFile(path.join(SRC_DIR, 'LISTAGEM SECMULHER VOLUNTÁRIOS.xlsx'))
const listagemRows = XLSX.utils.sheet_to_json(wbListagem.Sheets['Plan1'], { header: 1, defval: '' })
listagemRows.shift()
const listagem = listagemRows
  .filter((r) => String(r[1] || '').trim())
  .map((r) => ({
    setor: String(r[0] || '').trim(),
    nome: limparNome(r[1]),
    telefone: String(r[3] || '').trim(),
    endereco: String(r[4] || '').trim(),
    key: phoneKey(r[3]),
  }))

// ---------------------------------------------------------------------------
// 3) Planilha_Relacao_de_Pessoal — fallback de endereço completo + cargo
// ---------------------------------------------------------------------------

const wbPlanilha = XLSX.readFile(path.join(SRC_DIR, 'Planilha_Relacao_de_Pessoal_20_08_2026_AMANDA_02.xlsx'))
const planilhaRowsRaw = XLSX.utils.sheet_to_json(wbPlanilha.Sheets['Table 1'], { header: 1, defval: '' })
const planilha = planilhaRowsRaw
  .filter((r) => {
    const nome = String(r[0] || '').trim()
    if (!nome || nome === 'NOME') return false
    if (!String(r[3] || '').trim()) return false
    return true
  })
  .map((r) => ({
    nome: limparNome(r[0]),
    cargo: titleCase(String(r[1] || '').trim()),
    endereco: String(r[3] || '').trim(),
    telefone: String(r[4] || '').trim(),
    key: phoneKey(r[4]),
  }))

const listagemPorKey = new Map(listagem.filter((l) => l.key).map((l) => [l.key, l]))
const planilhaPorKey = new Map(planilha.filter((p) => p.key).map((p) => [p.key, p]))

// ---------------------------------------------------------------------------
// 4) TERCEIRIZADOS SECMULHER - ELEIÇÃO.xlsx — nomes completos, sem telefone.
// Usado só para completar nomes que hoje são um apelido/primeiro nome só
// (ex.: "Iris" → "Iris Pessoa Cavalcanti"). Como não tem telefone pra
// cruzar, a correspondência é por primeiro nome — e só é aceita quando
// existe EXATAMENTE UM nome completo nessa planilha começando com aquele
// primeiro nome. Se duas pessoas diferentes começam com o mesmo primeiro
// nome (ex.: duas "Marinalva"), a pessoa fica com o nome como está — errar
// pra menos (nome incompleto) é preferível a errar pra outra pessoa.
// ---------------------------------------------------------------------------

const wbTerceirizados = XLSX.readFile(TERCEIRIZADOS_FILE)
const terceirizadosRows = XLSX.utils.sheet_to_json(wbTerceirizados.Sheets['Plan1'], { header: 1, defval: '' })
const nomesTerceirizados = new Set()
for (const r of terceirizadosRows) {
  const nome = limparNome(r[4])
  if (nome && nome.length > 2) nomesTerceirizados.add(nome)
}
const candidatosPorPrimeiroNome = new Map() // primeiro-nome-normalizado -> Set(nome-completo-normalizado)
const nomeNormalizadoParaOriginal = new Map()
for (const nome of nomesTerceirizados) {
  const norm = normalize(nome)
  nomeNormalizadoParaOriginal.set(norm, nome)
  const primeiro = norm.split(' ')[0]
  if (!candidatosPorPrimeiroNome.has(primeiro)) candidatosPorPrimeiroNome.set(primeiro, new Set())
  candidatosPorPrimeiroNome.get(primeiro).add(norm)
}

// Casos de match único que, cruzados com outra fonte (endereço/cargo já
// conhecidos), se mostraram sendo provavelmente OUTRA pessoa com o mesmo
// primeiro nome — não aplicar mesmo sendo único na planilha de terceirizados.
const TERCEIRIZADOS_EXCLUIR = new Set([
  'elaine', // match único é vigilante em Camaragibe; a "Elaine" já mapeada é do DIPLAG em São Lourenço da Mata — municípios não batem, risco de ser outra pessoa
])

function nomeCompletoPorTerceirizados(nomeAtual) {
  const norm = normalize(nomeAtual)
  if (TERCEIRIZADOS_EXCLUIR.has(norm)) return null
  const candidatos = candidatosPorPrimeiroNome.get(norm)
  if (!candidatos || candidatos.size !== 1) return null
  const [unico] = candidatos
  return nomeNormalizadoParaOriginal.get(unico)
}

// ---------------------------------------------------------------------------
// Correções manuais — pra quando você (que conhece a pessoa) sabe o nome
// certo e as fontes automáticas não resolveram (ambíguo, tipo "Janaina" com
// 2 candidatas) ou resolveram errado. Isso tem prioridade sobre qualquer
// resolução automática.
//
// Chave preferida = telefone (8 últimos dígitos, robusto a formatação) —
// pega o número exibido na coluna Contato do painel. Só use a chave por
// nome atual (NOME_OVERRIDES_POR_NOME) quando a pessoa não tem telefone
// cadastrado.
// ---------------------------------------------------------------------------

const NOME_OVERRIDES_POR_TELEFONE = {
  // Pendentes hoje ambíguas ou excluídas — descomente a linha certa e
  // preencha o nome completo (chave = telefone que já aparece no painel):
  // '99786344': 'Nome completo aqui', // Janaina, +55 81 9978-6344
  // '91663433': 'Nome completo aqui', // Marinalva, +55 81 9166-3433
  // '85948914': 'Nome completo aqui', // Severino, +55 81 8594-8914
  // '88771051': 'Nome completo aqui', // Elaine, +55 81 8877-1051 (São Lourenço da Mata)
}
const NOME_OVERRIDES_POR_NOME = {
  // Use esta quando a pessoa não tem telefone cadastrado no painel:
  // 'Fabi': 'Fabiana Xxxxx da Silva',
}

// Correção final de nome + cargo/setor — roda depois de tudo (inclusive
// resolverNomeCompleto), então funciona mesmo pra apelidos com espaço
// ("Ewelin SecMulher", "Família Cruz Pessoa" etc.), que resolverNomeCompleto
// ignora. Chave = telefone (8 últimos dígitos). `setor: null` deixa o setor
// como já resolvido pelas outras fontes.
const CORRECAO_FINAL_POR_TELEFONE = {
  '91898472': { nome: 'Ewelin Cardoso' }, // era "Ewelin SecMulher"
  '98529225': { nome: 'Selence Correia' }, // era "Selene sec mulher"
  '94716607': { nome: 'Elyziana Machado', setor: 'Chefe de Gabinete' }, // era "Eli secmulher"
  '96740834': { nome: 'Eduardo Florêncio' }, // era "Eduardo Lopes"
  '85117883': { nome: 'Ana Paula', setor: 'Vigilante' }, // era "Deus é bom o tempo todo"
  '89690804': { nome: 'Jana Cruz', setor: 'Governanta' }, // era "Família Cruz Pessoa"
  '93269320': { nome: 'Vitotia Silva', setor: 'Diplag UPL' }, // era "Vi"
  '94883535': { nome: 'Daniele Souza', setor: 'DEVG 190' }, // era "Dani"
}

function aplicarCorrecaoFinal(pessoa, key) {
  const correcao = key && CORRECAO_FINAL_POR_TELEFONE[key]
  if (!correcao) return pessoa
  return {
    ...pessoa,
    nome: correcao.nome ?? pessoa.nome,
    setor: correcao.setor ?? pessoa.setor,
  }
}

// Resolve o nome completo de uma pessoa cujo nome atual é uma palavra só
// (apelido/primeiro nome). Prioridade: 1) correção manual acima 2) telefone
// batendo com a Planilha_Relacao_de_Pessoal (já verificado por telefone em
// resolverLocalizacao) 3) match único por primeiro nome nos terceirizados.
const nomesCompletados = []

function resolverNomeCompleto(nomeAtual, key) {
  if (!nomeAtual || nomeAtual.includes(' ')) return nomeAtual
  if (key && NOME_OVERRIDES_POR_TELEFONE[key]) {
    const completo = titleCase(NOME_OVERRIDES_POR_TELEFONE[key])
    nomesCompletados.push({ de: nomeAtual, para: completo, fonte: 'correção manual (telefone)' })
    return completo
  }
  if (NOME_OVERRIDES_POR_NOME[nomeAtual]) {
    const completo = titleCase(NOME_OVERRIDES_POR_NOME[nomeAtual])
    nomesCompletados.push({ de: nomeAtual, para: completo, fonte: 'correção manual (nome)' })
    return completo
  }
  if (key && planilhaPorKey.has(key)) {
    const completo = titleCase(planilhaPorKey.get(key).nome)
    nomesCompletados.push({ de: nomeAtual, para: completo, fonte: 'telefone (Planilha_Relacao_de_Pessoal)' })
    return completo
  }
  const doTerceirizados = nomeCompletoPorTerceirizados(nomeAtual)
  if (doTerceirizados) {
    const completo = titleCase(doTerceirizados)
    nomesCompletados.push({ de: nomeAtual, para: completo, fonte: 'primeiro nome único (TERCEIRIZADOS)' })
    return completo
  }
  return nomeAtual
}

// ---------------------------------------------------------------------------
// Resolve setor + bairro + município para um registro-fonte (contato ou
// linha da LISTAGEM), cruzando com a Planilha_Relacao_de_Pessoal quando
// necessário.
// ---------------------------------------------------------------------------

function resolverLocalizacao({ key, enderecoDireto, setorDireto }) {
  if (enderecoDireto) {
    const municipio = detectarMunicipio(enderecoDireto)
    if (municipio) {
      const bairro = extrairBairroCurto(enderecoDireto, municipio)
      return { setor: setorDireto, bairro, municipio, origem: 'listagem' }
    }
  }
  if (key && planilhaPorKey.has(key)) {
    const p = planilhaPorKey.get(key)
    const municipio = detectarMunicipio(p.endereco)
    if (municipio) {
      const bairro = extrairBairroLongo(p.endereco)
      return { setor: setorDireto || p.cargo, bairro, municipio, origem: 'planilha' }
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Monta o roster final: contatos.csv ∪ LISTAGEM (dedup por telefone).
// Todo mundo entra — quem não tem município identificado vai para a lista
// de pendências (precisa ligar para completar o cadastro).
// ---------------------------------------------------------------------------

const roster = []
const chavesUsadas = new Set()

for (const c of contatos) {
  const listagemMatch = c.key ? listagemPorKey.get(c.key) : null
  const loc = resolverLocalizacao({
    key: c.key,
    enderecoDireto: listagemMatch?.endereco,
    setorDireto: listagemMatch?.setor,
  })
  roster.push(aplicarCorrecaoFinal({
    nome: resolverNomeCompleto(c.nome, c.key),
    contato: c.numero ? c.numero.replace(/\s+/g, ' ').trim() : null,
    setor: loc?.setor || null,
    bairro: loc?.bairro || null,
    municipio: loc?.municipio || null,
  }, c.key))
  if (c.key) chavesUsadas.add(c.key)
}

for (const l of listagem) {
  if (l.key && chavesUsadas.has(l.key)) continue
  const loc = resolverLocalizacao({ key: l.key, enderecoDireto: l.endereco, setorDireto: l.setor })
  roster.push(aplicarCorrecaoFinal({
    nome: resolverNomeCompleto(titleCase(l.nome), l.key),
    contato: l.telefone ? formatarTelefone(l.telefone) : null,
    setor: loc?.setor || l.setor || null,
    bairro: loc?.bairro || null,
    municipio: loc?.municipio || null,
  }, l.key))
  if (l.key) chavesUsadas.add(l.key)
}

const localizados = roster.filter((p) => p.municipio)
const pendentes = roster.filter((p) => !p.municipio)

// ---------------------------------------------------------------------------
// Agrupa por município e monta a estrutura final consumida pelo app
// ---------------------------------------------------------------------------

const porMunicipio = new Map()
for (const pessoa of localizados) {
  const id = pessoa.municipio.id
  if (!porMunicipio.has(id)) {
    porMunicipio.set(id, {
      id,
      nome: pessoa.municipio.nome,
      mesorregiao: pessoa.municipio.mesorregiao,
      pessoas: [],
    })
  }
  porMunicipio.get(id).pessoas.push(pessoa)
}

const municipiosBrutos = Array.from(porMunicipio.values())
const maiorTotal = Math.max(...municipiosBrutos.map((m) => m.pessoas.length))

const municipios = municipiosBrutos
  .map((m) => {
    const pessoasOrdenadas = m.pessoas
      .map((p, i) => ({
        id: `${m.id}-${i + 1}`,
        nome: p.nome,
        setor: p.setor || null,
        bairro: p.bairro || null,
        contato: p.contato || null,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

    const contagemBairros = new Map()
    for (const p of m.pessoas) {
      if (!p.bairro) continue
      contagemBairros.set(p.bairro, (contagemBairros.get(p.bairro) || 0) + 1)
    }
    const topBairros = Array.from(contagemBairros.entries())
      .map(([bairro, militantes]) => ({ bairro, militantes }))
      .sort((a, b) => b.militantes - a.militantes || a.bairro.localeCompare(b.bairro, 'pt-BR'))
      .slice(0, 5)

    return {
      id: m.id,
      nome: m.nome,
      mesorregiao: m.mesorregiao,
      totalMilitantes: pessoasOrdenadas.length,
      percentualMilitantes: Math.round((pessoasOrdenadas.length / maiorTotal) * 1000) / 10,
      topBairros,
      pessoas: pessoasOrdenadas,
    }
  })
  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

const setores = Array.from(new Set(localizados.map((p) => p.setor).filter(Boolean))).sort((a, b) =>
  a.localeCompare(b, 'pt-BR')
)

const bairrosUnicos = new Set(localizados.map((p) => p.bairro).filter(Boolean))

// Pessoas sem município identificado: entram na listagem geral (não no
// mapa/fichas por município), sempre no final da lista — os campos que não
// têm dado ficam em branco em vez de um rótulo de placeholder.
const pendencias = pendentes
  .map((p, i) => ({
    id: `pendencia-${i + 1}`,
    nome: p.nome,
    contato: p.contato || null,
    setor: p.setor || null,
    bairro: null,
    municipio: null,
  }))
  .sort((a, b) => {
    const aTem = a.contato ? 0 : 1
    const bTem = b.contato ? 0 : 1
    return aTem - bTem || a.nome.localeCompare(b.nome, 'pt-BR')
  })

const kpis = {
  totalMilitantes: roster.length,
  coberturaMunicipal: { atual: municipios.length, total: PE_MUNICIPIOS_GEO.length },
  setoresMapeados: setores.length,
  bairrosMapeados: bairrosUnicos.size,
}

const mesorregioes = Array.from(new Set(PE_MUNICIPIOS_GEO.map((g) => g.mesorregiao)))

const output = {
  metadata: {
    orgao: 'Secretaria da Mulher de Pernambuco (SecMulher-PE)',
    painel: 'Mapeamento de Militância e Presença Territorial',
    ultimaAtualizacao: '2026-08-20',
    modo: 'producao',
  },
  kpis,
  mesorregioes,
  setores,
  municipios,
  pendencias,
}

// ---------------------------------------------------------------------------
// Gera o arquivo final
// ---------------------------------------------------------------------------

const header = `// ============================================================================
// MILITANCIA_DATA — SecMulher-PE · Painel de Mapeamento de Militância
// ----------------------------------------------------------------------------
// Gerado por scripts/build-militancia-data.mjs — não editar manualmente.
// Fontes (src/data/militancia/):
//   - contatos.csv                                       nome + número
//   - LISTAGEM SECMULHER VOLUNTÁRIOS.xlsx                 setor + bairro/município
//   - Planilha_Relacao_de_Pessoal_20_08_2026_AMANDA_02.xlsx  fallback de
//     bairro/município (endereço) e cargo, usado só quando a pessoa não
//     aparece na LISTAGEM.
// Cruzamento feito pelos 8 últimos dígitos do telefone. Todo mundo que tem
// nome entra na base — quem não teve município identificável em nenhuma das
// três fontes vai para MILITANCIA_DATA.pendencias (lista de quem precisa ser
// contatado para completar bairro/setor) em vez de ser descartado.
//
// Para atualizar: substitua os arquivos-fonte e rode
//   node scripts/build-militancia-data.mjs
// ============================================================================

export const MILITANCIA_DATA = `

fs.writeFileSync(OUT_FILE, header + JSON.stringify(output, null, 2) + '\n')

console.log('Roster total:', roster.length)
console.log('Localizados (em município):', localizados.length, 'em', municipios.length, 'municípios')
console.log('Pendências (precisam contato):', pendencias.length)
console.log('Setores:', setores)
console.log(`\nNomes completados (${nomesCompletados.length}):`)
for (const n of nomesCompletados) console.log(`  "${n.de}" -> "${n.para}"  [${n.fonte}]`)
console.log('\nEscrito em', path.relative(ROOT, OUT_FILE))
