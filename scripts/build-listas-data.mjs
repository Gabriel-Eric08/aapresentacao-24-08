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

// Setor de cada dono de lista, cruzado manualmente com a aba de Militância
// (nomes na aba de Listas às vezes divergem do nome completo em Militância).
// Deixados de fora (sem correspondência confirmada): Giovanna Tenorio, Jane, Larissa.
const SETOR_POR_DONO = {
  'Aline Roberta': 'CAJ',
  'Aline Venancio': 'CAJ',
  'Amadeu': 'DIPLAG',
  'Ana Paula': 'Assessora Especial de Controle Interno',
  'Andreza': 'Técnico Admnistrativo',
  'Anielle': 'CAJ',
  'Anna Clara': 'GERAI',
  'Ari': 'DIPLAG',
  'Betania Soares': 'GEFSP E GEFV',
  'Cadidja': 'Gestora dos Serviços de Acolhimento',
  'Darling Lima': 'Assessora de Gerência',
  'Debora Eloy': 'Assessor Administrativo',
  'Diógenes Tavares': 'GERAI',
  'Eduardo Lopes': 'Manutenção Predial',
  'Elaine': 'Estagiária',
  'Elimarcos': 'Supervisão -1',
  'Ericka Tatiana': 'CAJ',
  'Erisson': 'DIPLAG',
  'Ewelin': 'Diretora de Enfrentamento a Violência de Gênero',
  'Gabriel Eric': 'DIPLAG',
  'Gabriela Amazonas': 'GEFSP E GEFV',
  'GILVAN': 'Gestor de Frota',
  'Gisele Ramos': 'Assessor Administrativo',
  'HELIANA CARVALHO': 'GERAI',
  'Ianne': 'DIPLAG',
  'INÊS TENÓRIO': 'Gerente de Articulação e Interiorização das Ações de Gênero',
  'Ingrid': 'GEFSP E GEFV',
  'Iris': 'Assessora de Gerência',
  'Jady Santos': 'Assessor Administrativo',
  'Janaína Ribeiro': 'GEFSP E GEFV',
  'jemarryr': 'GEFSP E GEFV',
  'Josilene Marins': 'Assessora Técnica de Comunicação Social e Imprensa',
  'Juliene': 'Assessor Administrativo',
  'Luciane': 'DIPLAG',
  'Manuela Leal Rodrigues': 'DIPLAG',
  'Marcelino': 'DIPLAG',
  'Margot': 'Assessora de Política da Saúde da Mulher',
  'Maria Luyza Maciel': 'CAJ',
  'Marinalva': 'Técnico Admnistrativo',
  'Monica': 'Assessor Administrativo',
  'Nathália': 'GERAI',
  'Paloma': 'Assessor Administrativo',
  'Rafael': 'DIPLAG',
  'Raquel Rizoto': 'DIPLAG',
  'Rayssa Nascimento': 'Assessor Administrativo',
  'Roberta Peregrino': 'GERAI',
  'SAMARA DIAS': 'GEFSP E GEFV',
  'Samara Gomes': 'GERAI',
  'SAMARA KÉZIA RAMOS': 'GERAI',
  'Thais': 'Gestora de Justiça e Segurança',
  'Victoria Silva': 'DIPLAG',
  'Wilza Ribeiro': 'DIPLAG',
  'Patricia de Paula': 'DIPLAG',
  'Samuel Santos': 'DIPLAG',
  'Patricia Dyase': 'Assistente Social',
  'Gleyci Santos': 'DIPLAG',
  'Aurora': 'DIPLAG',
}

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
    const setor = SETOR_POR_DONO[dono] || null
    return {
      id: slug(dono),
      dono,
      setor,
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
