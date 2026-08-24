// Script de build (executado manualmente, não faz parte do runtime da app).
// Gera src/data/servicosEssenciaisData.js a partir de
// src/data/TERCEIRIZADOS SECMULHER - ELEIÇÃO.xlsx — puxa TODAS as linhas
// cuja LOTAÇÃO é uma unidade de atendimento externo (Casa Abrigo, Casa
// Passagem, Abrigamento, e as unidades específicas Adalgisa/Marici, que
// aparecem tanto como LOTAÇÃO direta quanto como "município" de linhas
// LOTAÇÃO=CASA ABRIGO — nome de código, já que endereço de casa abrigo é
// sigiloso por segurança das acolhidas).
//
// Uso: node scripts/build-servicos-essenciais-data.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const TERCEIRIZADOS_FILE = path.join(ROOT, 'src/data/TERCEIRIZADOS SECMULHER - ELEIÇÃO.xlsx')
const OUT_FILE = path.join(ROOT, 'src/data/servicosEssenciaisData.js')

function normalize(s) {
  return String(s || '').trim().toUpperCase().replace(/\s+/g, ' ')
}

const PALAVRAS_MINUSCULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'as', 'os'])
function titleCase(s) {
  return String(s || '')
    .trim()
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
  return String(nome || '').replace(/\s+/g, ' ').trim()
}

// Serial de data do Excel (dias desde 1899-12-30) -> "DD/MM/AAAA".
function formatarData(valor) {
  if (!valor) return null
  if (typeof valor === 'number') {
    const utcDias = Math.floor(valor - 25569)
    const data = new Date(utcDias * 86400 * 1000)
    const dd = String(data.getUTCDate()).padStart(2, '0')
    const mm = String(data.getUTCMonth() + 1).padStart(2, '0')
    const yyyy = data.getUTCFullYear()
    return `${dd}/${mm}/${yyyy}`
  }
  const str = String(valor).trim()
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(str)
  if (m) {
    const [, mes, dia, ano] = m
    return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`
  }
  return str || null
}

// LOTAÇÃO que identifica trabalho externo em unidade de acolhimento/abrigo.
const LOTACOES_SERVICOS_ESSENCIAIS = new Set([
  'CASA ABRIGO',
  'CASA',
  'CASA MARICI',
  'CASA PASSAGEM',
  'ABRIGAMENTO',
  'ADALGISA',
  'MARICI',
])

// Nomes de unidade (código) que também aparecem na coluna
// Cidade/Município quando LOTAÇÃO é o genérico "CASA ABRIGO"/"CASA" —
// precisam cair na MESMA unidade que quando aparecem como LOTAÇÃO direta.
const UNIDADE_POR_LOTACAO_ESPECIFICA = {
  ADALGISA: 'Adalgisa',
  MARICI: 'Marici',
  'CASA MARICI': 'Marici',
  'CASA PASSAGEM': 'Casa Passagem',
}

// Pequenos ajustes de nome pra ficar mais claro (nomes reais de município).
const ALIAS_UNIDADE = {
  CABO: 'Cabo de Santo Agostinho',
}

function resolverUnidade(lotacaoNorm, municipioRaw) {
  if (UNIDADE_POR_LOTACAO_ESPECIFICA[lotacaoNorm]) return UNIDADE_POR_LOTACAO_ESPECIFICA[lotacaoNorm]
  const municipioNorm = normalize(municipioRaw)
  if (UNIDADE_POR_LOTACAO_ESPECIFICA[municipioNorm]) return UNIDADE_POR_LOTACAO_ESPECIFICA[municipioNorm]
  if (ALIAS_UNIDADE[municipioNorm]) return ALIAS_UNIDADE[municipioNorm]
  return titleCase(municipioRaw) || 'Não Identificada'
}

const wb = XLSX.readFile(TERCEIRIZADOS_FILE)
const rows = XLSX.utils.sheet_to_json(wb.Sheets['Plan1'], { header: 1, defval: '' })

const pessoas = []
for (const r of rows) {
  const lotacaoNorm = normalize(r[7])
  if (!LOTACOES_SERVICOS_ESSENCIAIS.has(lotacaoNorm)) continue
  const nome = limparNome(r[4])
  if (!nome || nome.length < 3) continue
  pessoas.push({
    nome: titleCase(nome),
    cargo: titleCase(String(r[6] || '').trim()) || null,
    unidade: resolverUnidade(lotacaoNorm, r[8]),
    empresaContratada: limparNome(r[3]) || null,
    admissao: formatarData(r[5]),
    jornada: String(r[9] || '').trim() || null,
    turno: titleCase(String(r[10] || '').trim()) || null,
  })
}

pessoas.sort((a, b) => a.unidade.localeCompare(b.unidade, 'pt-BR') || a.nome.localeCompare(b.nome, 'pt-BR'))

// Agrupa por unidade (equivalente a "município" na base de Militância).
const porUnidade = new Map()
for (const p of pessoas) {
  if (!porUnidade.has(p.unidade)) porUnidade.set(p.unidade, [])
  porUnidade.get(p.unidade).push(p)
}

function slug(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const unidades = Array.from(porUnidade.entries())
  .map(([nome, lista]) => {
    const cargosCount = new Map()
    for (const p of lista) {
      if (!p.cargo) continue
      cargosCount.set(p.cargo, (cargosCount.get(p.cargo) || 0) + 1)
    }
    return {
      id: slug(nome),
      nome,
      totalFuncionarios: lista.length,
      cargos: Array.from(cargosCount.entries())
        .map(([cargo, total]) => ({ cargo, total }))
        .sort((a, b) => b.total - a.total),
      pessoas: lista.map((p, i) => ({ id: `${slug(nome)}-${i + 1}`, ...p })),
    }
  })
  .sort((a, b) => b.totalFuncionarios - a.totalFuncionarios)

const cargosDistintos = new Set(pessoas.map((p) => p.cargo).filter(Boolean))

const SERVICOS_ESSENCIAIS_DATA = {
  metadata: {
    orgao: 'Secretaria da Mulher de Pernambuco (SecMulher-PE)',
    painel: 'Militância — Serviços Essenciais (Casas Abrigo)',
    fonte: 'TERCEIRIZADOS SECMULHER - ELEIÇÃO.xlsx',
    ultimaAtualizacao: new Date().toISOString().slice(0, 10),
  },
  kpis: {
    totalFuncionarios: pessoas.length,
    totalUnidades: unidades.length,
    cargosDistintos: cargosDistintos.size,
  },
  unidades,
}

const header = `// ============================================================================
// SERVICOS_ESSENCIAIS_DATA — SecMulher-PE · Militância Serv. Essenciais
// ----------------------------------------------------------------------------
// Gerado por scripts/build-servicos-essenciais-data.mjs — não editar manualmente.
// Fonte: src/data/TERCEIRIZADOS SECMULHER - ELEIÇÃO.xlsx — todas as linhas
// cuja LOTAÇÃO é uma unidade de acolhimento/abrigo externo (Casa Abrigo,
// Casa Passagem, Abrigamento, Adalgisa, Marici). Algumas unidades usam nome
// de código em vez do município real (endereço de casa abrigo é sigiloso).
//
// Para atualizar: substitua o arquivo-fonte e rode
//   node scripts/build-servicos-essenciais-data.mjs
// ============================================================================

export const SERVICOS_ESSENCIAIS_DATA = `

fs.writeFileSync(OUT_FILE, header + JSON.stringify(SERVICOS_ESSENCIAIS_DATA, null, 2) + '\n')

console.log(`Funcionários: ${pessoas.length}`)
console.log(`Unidades (${unidades.length}):`)
for (const u of unidades) console.log(`  ${u.nome}: ${u.totalFuncionarios}`)
console.log(`Escrito em ${OUT_FILE}`)
