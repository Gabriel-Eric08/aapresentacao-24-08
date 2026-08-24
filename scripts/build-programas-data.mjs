// Script de build (executado manualmente, não faz parte do runtime da app).
// Gera src/data/empreendeMulherData.js a partir do cadastro do programa
// Empreende Mulher em src/data/programas/empreende-mulher.csv (exportação
// de formulário — Carimbo, Município, Nome, Fone, E-mail, Segmento etc.).
//
// O CSV usa aspas com campos multilinha (o cabeçalho de uma coluna tem
// quebras de linha) — por isso é lido com a biblioteca xlsx (que segue o
// RFC4180) em vez de split por linha.
//
// Uso: node scripts/build-programas-data.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { PE_MUNICIPIOS_GEO } from '../src/data/pernambucoMunicipiosGeo.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SRC_FILE = path.join(ROOT, 'src/data/programas/empreende-mulher.csv')
const OUT_FILE = path.join(ROOT, 'src/data/empreendeMulherData.js')

// ---------------------------------------------------------------------------
// Utilidades de texto (mesma técnica de scripts/build-militancia-data.mjs)
// ---------------------------------------------------------------------------

function stripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function normalize(s) {
  return stripAccents(String(s || '')).toLowerCase().trim().replace(/\s+/g, ' ')
}

function titleCase(s) {
  return String(s || '')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

const MUNICIPIOS_INDEX = PE_MUNICIPIOS_GEO.map((g) => ({
  id: g.id,
  nome: g.nome,
  mesorregiao: g.mesorregiao,
  norm: normalize(g.nome),
})).sort((a, b) => b.norm.length - a.norm.length)

function detectarMunicipio(texto) {
  const norm = normalize(texto)
  for (const m of MUNICIPIOS_INDEX) {
    if (new RegExp(`\\b${m.norm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(norm)) {
      return m
    }
  }
  return null
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

function limparTexto(s) {
  return String(s || '').replace(/\s+/g, ' ').trim()
}

// ---------------------------------------------------------------------------
// Leitura do CSV (via xlsx — respeita aspas/campos multilinha do RFC4180)
// ---------------------------------------------------------------------------

const csvText = fs.readFileSync(SRC_FILE, 'utf8')
const wb = XLSX.read(csvText, { type: 'string', raw: true })
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' })
rows.shift() // cabeçalho

const COL = {
  carimbo: 0,
  municipio: 1,
  nome: 2,
  telefone: 3,
  segmento: 13,
}

const cadastradas = []
let semNome = 0

for (const r of rows) {
  const nome = limparTexto(r[COL.nome])
  if (!nome) {
    semNome++
    continue
  }
  const municipio = detectarMunicipio(r[COL.municipio])
  const segmentoRaw = limparTexto(r[COL.segmento])
  const segmento = segmentoRaw ? segmentoRaw.replace(/\s*\(ex\.:.*?\)/i, '').trim() : null
  const carimbo = limparTexto(r[COL.carimbo])
  const dataMatch = /^(\d{4})\/(\d{2})\/(\d{2})/.exec(carimbo)

  cadastradas.push({
    id: `empreende-${cadastradas.length + 1}`,
    nome: titleCase(nome),
    municipioId: municipio?.id || null,
    municipioNome: municipio?.nome || null,
    segmento,
    contato: r[COL.telefone] ? formatarTelefone(r[COL.telefone]) : null,
    dataCadastro: dataMatch ? `${dataMatch[1]}-${dataMatch[2]}-${dataMatch[3]}` : null,
  })
}

cadastradas.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

const contagemMunicipio = new Map()
for (const c of cadastradas) {
  if (!c.municipioId) continue
  const chave = c.municipioId
  if (!contagemMunicipio.has(chave)) contagemMunicipio.set(chave, { municipioId: c.municipioId, municipioNome: c.municipioNome, total: 0 })
  contagemMunicipio.get(chave).total++
}
const porMunicipio = Array.from(contagemMunicipio.values()).sort((a, b) => b.total - a.total)

const segmentos = Array.from(new Set(cadastradas.map((c) => c.segmento).filter(Boolean))).sort((a, b) =>
  a.localeCompare(b, 'pt-BR')
)

const output = {
  metadata: {
    fonte: 'Cadastro Empreende Mulher (src/data/programas/empreende-mulher.csv)',
  },
  totalCadastradas: cadastradas.length,
  porMunicipio,
  segmentos,
  cadastradas,
}

const header = `// ============================================================================
// EMPREENDE_MULHER_DATA — SecMulher-PE · Programa Empreende Mulher
// ----------------------------------------------------------------------------
// Gerado por scripts/build-programas-data.mjs — não editar manualmente.
// Fonte: src/data/programas/empreende-mulher.csv (exportação do formulário
// de cadastro do programa). Município é resolvido por correspondência de
// texto contra os 184 municípios reais de PE; quando o texto não permite
// identificar um município (ex.: "RMR", "Pernambuco", vazio), o campo fica
// nulo em vez de arriscar um palpite.
//
// Para atualizar: substitua o CSV e rode
//   node scripts/build-programas-data.mjs
// ============================================================================

export const EMPREENDE_MULHER_DATA = `

fs.writeFileSync(OUT_FILE, header + JSON.stringify(output, null, 2) + '\n')

console.log('Cadastradas:', cadastradas.length, '(sem nome, ignoradas:', semNome, ')')
console.log('Com município identificado:', cadastradas.filter((c) => c.municipioId).length)
console.log('Escrito em', path.relative(ROOT, OUT_FILE))
