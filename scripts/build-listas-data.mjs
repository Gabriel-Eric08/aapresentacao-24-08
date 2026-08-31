// Script de build (executado manualmente, não faz parte do runtime da app).
// Gera src/data/listasData.js a partir dos arquivos em src/listas/*.csv —
// cada arquivo é a lista de contatos de uma pessoa (militante/coordenadora),
// nomeado como "Nome_Da_Pessoa.csv" ou "Nome Da Pessoa.csv", com uma coluna
// única "Nome" (uma linha por contato listado).
//
// Esse arquivo é a fonte de verdade da aba "Listas". Pra atualizar, adicione,
// remova ou edite os .csv em src/listas/ e rode:
//   node scripts/build-listas-data.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SRC_DIR = path.join(ROOT, 'src/listas')
const OUT_FILE = path.join(ROOT, 'src/data/listasData.js')

function slug(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function parseNomes(conteudo) {
  const linhas = conteudo.split(/\r\n|\n/)
  const nomes = []
  for (let i = 1; i < linhas.length; i++) {
    let linha = (linhas[i] ?? '').trim()
    if (!linha) continue
    if (linha.startsWith('"') && linha.endsWith('"')) linha = linha.slice(1, -1).trim()
    linha = linha.replace(/,+$/, '').trim()
    if (linha) nomes.push(linha)
  }
  return nomes
}

const arquivos = fs.readdirSync(SRC_DIR).filter((f) => f.toLowerCase().endsWith('.csv'))

const listas = arquivos
  .map((arquivo) => {
    const conteudo = fs.readFileSync(path.join(SRC_DIR, arquivo), 'utf8')
    const nomes = parseNomes(conteudo)
    const dono = path.basename(arquivo, '.csv').replace(/_/g, ' ').trim()
    return {
      id: slug(dono),
      dono,
      arquivo,
      total: nomes.length,
      nomes,
    }
  })
  .sort((a, b) => a.dono.localeCompare(b.dono, 'pt-BR'))

const totalPessoas = listas.reduce((soma, l) => soma + l.total, 0)

const LISTAS_DATA = {
  metadata: {
    orgao: 'Secretaria da Mulher de Pernambuco (SecMulher-PE)',
    painel: 'Listas de Contatos por Militante',
    fonte: 'src/listas/*.csv (um arquivo por pessoa)',
    ultimaAtualizacao: new Date().toISOString().slice(0, 10),
  },
  totalPessoas,
  totalListas: listas.length,
  listas,
}

const header = `// ============================================================================
// LISTAS_DATA — SecMulher-PE · Listas de Contatos por Militante
// ----------------------------------------------------------------------------
// Gerado por scripts/build-listas-data.mjs — não editar manualmente.
// Fonte: src/listas/*.csv — um arquivo de lista por pessoa. Para atualizar,
// adicione/edite os .csv em src/listas/ e rode
//   node scripts/build-listas-data.mjs
// ============================================================================

export const LISTAS_DATA = `

fs.writeFileSync(OUT_FILE, header + JSON.stringify(LISTAS_DATA, null, 2) + '\n')

console.log(`Listas: ${listas.length}`)
console.log(`Total de pessoas: ${totalPessoas}`)
console.log(`Escrito em ${OUT_FILE}`)
