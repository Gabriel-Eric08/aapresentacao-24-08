// Script de build (executado manualmente, não faz parte do runtime da app).
// Gera src/data/servicosEssenciaisData.js a partir de
// src/data/servicos-essenciais/casas-abrigo.xlsx — planilha curada
// manualmente (revisada e corrigida por quem conhece a operação real das
// unidades), com uma linha por funcionário e as colunas:
//   Unidade (Casa Abrigo) | Nome | Cargo | Empresa Contratada | Admissão | Jornada | Turno
//
// Esse arquivo é a fonte de verdade da aba "Militância Serv. Essenciais" —
// pra atualizar os dados, substitua casas-abrigo.xlsx por uma versão nova
// (mesmas colunas) e rode:
//   node scripts/build-servicos-essenciais-data.mjs
//
// Histórico: a primeira versão desses dados foi gerada automaticamente a
// partir de TERCEIRIZADOS SECMULHER - ELEIÇÃO.xlsx (linhas com LOTAÇÃO de
// unidade de acolhimento), exportada pra xlsx via
// scripts/export-servicos-essenciais-xlsx.mjs, revisada manualmente e
// devolvida — a unidade de várias pessoas mudou nessa revisão (a
// atribuição automática por "município"/nome de código nem sempre batia
// com a unidade real).

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SRC_FILE = path.join(ROOT, 'src/data/servicos-essenciais/casas-abrigo.xlsx')
const OUT_FILE = path.join(ROOT, 'src/data/servicosEssenciaisData.js')

function slug(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const wb = XLSX.readFile(SRC_FILE)
const rows = XLSX.utils.sheet_to_json(wb.Sheets['Serv Essenciais'], { defval: '' })

const pessoas = rows
  .filter((r) => String(r['Nome'] || '').trim())
  .map((r) => ({
    nome: String(r['Nome']).trim(),
    cargo: String(r['Cargo'] || '').trim() || null,
    unidade: String(r['Unidade (Casa Abrigo)'] || '').trim() || 'Não Identificada',
    empresaContratada: String(r['Empresa Contratada'] || '').trim() || null,
    admissao: String(r['Admissão'] || '').trim() || null,
    jornada: String(r['Jornada'] || '').trim() || null,
    turno: String(r['Turno'] || '').trim() || null,
  }))

pessoas.sort((a, b) => a.unidade.localeCompare(b.unidade, 'pt-BR') || a.nome.localeCompare(b.nome, 'pt-BR'))

const porUnidade = new Map()
for (const p of pessoas) {
  if (!porUnidade.has(p.unidade)) porUnidade.set(p.unidade, [])
  porUnidade.get(p.unidade).push(p)
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
    fonte: 'src/data/servicos-essenciais/casas-abrigo.xlsx (planilha revisada manualmente)',
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
// Fonte: src/data/servicos-essenciais/casas-abrigo.xlsx — planilha curada
// manualmente com a unidade real de cada funcionário. Para atualizar,
// substitua esse arquivo (mesmas colunas) e rode
//   node scripts/build-servicos-essenciais-data.mjs
// ============================================================================

export const SERVICOS_ESSENCIAIS_DATA = `

fs.writeFileSync(OUT_FILE, header + JSON.stringify(SERVICOS_ESSENCIAIS_DATA, null, 2) + '\n')

console.log(`Funcionários: ${pessoas.length}`)
console.log(`Unidades (${unidades.length}):`)
for (const u of unidades) console.log(`  ${u.nome}: ${u.totalFuncionarios}`)
console.log(`Escrito em ${OUT_FILE}`)
