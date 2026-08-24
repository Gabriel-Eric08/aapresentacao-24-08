// Script de build (executado manualmente, não faz parte do runtime da app).
// Gera src/data/militanciaData.js a partir das planilhas reais em
// src/data/militancia/:
//  - contatos.csv .................................... nome + número (WhatsApp)
//  - LISTAGEM SECMULHER VOLUNTÁRIOS.xlsx .............. setor + bairro/município
//  - Planilha_Relacao_de_Pessoal_20_08_2026_AMANDA_02.xlsx  fallback de
//    bairro/município (endereço completo) e cargo, usado apenas quando a
//    pessoa não é encontrada na LISTAGEM.
//
// O cruzamento entre as três fontes é feito pelos 8 últimos dígitos do
// telefone (chave robusta a variações de DDD/9º dígito/formatação).
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
  roster.push({
    nome: c.nome,
    contato: c.numero ? c.numero.replace(/\s+/g, ' ').trim() : null,
    setor: loc?.setor || null,
    bairro: loc?.bairro || null,
    municipio: loc?.municipio || null,
  })
  if (c.key) chavesUsadas.add(c.key)
}

for (const l of listagem) {
  if (l.key && chavesUsadas.has(l.key)) continue
  const loc = resolverLocalizacao({ key: l.key, enderecoDireto: l.endereco, setorDireto: l.setor })
  roster.push({
    nome: titleCase(l.nome),
    contato: l.telefone ? formatarTelefone(l.telefone) : null,
    setor: loc?.setor || l.setor || null,
    bairro: loc?.bairro || null,
    municipio: loc?.municipio || null,
  })
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
console.log('Escrito em', path.relative(ROOT, OUT_FILE))
