// Script de build (executado manualmente, não faz parte do runtime da app).
// Gera src/data/militanciaData.js a partir de
// src/data/militancia/militancia-corrigido.xlsx — planilha final, curada
// manualmente por quem conhece a militância (colunas: NOME, CARGO,
// MUNICIPIO, BAIRRO, TELEFONE), uma linha por pessoa, já com município e
// bairro reais — não há mais pendências.
//
// Esse arquivo é a fonte de verdade da aba "Militância" (mapa). Pra
// atualizar os dados, substitua militancia-corrigido.xlsx por uma versão
// nova (mesmas colunas) e rode:
//   node scripts/build-militancia-data.mjs
//
// Histórico: até esta versão, os dados eram montados automaticamente
// cruzando contatos.csv + LISTAGEM SECMULHER VOLUNTÁRIOS.xlsx +
// Planilha_Relacao_de_Pessoal + TERCEIRIZADOS por telefone/nome, com dezenas
// de correções manuais acumuladas no próprio script. Esse processo foi
// substituído por uma planilha única já revisada e corrigida.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { PE_MUNICIPIOS_GEO } from '../src/data/pernambucoMunicipiosGeo.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SRC_FILE = path.join(ROOT, 'src/data/militancia/militancia-corrigido.xlsx')
const OUT_FILE = path.join(ROOT, 'src/data/militanciaData.js')

function stripAccents(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
}
function normalize(s) {
  return stripAccents(s).toLowerCase().trim().replace(/\s+/g, ' ')
}

const geoPorNomeNormalizado = new Map(PE_MUNICIPIOS_GEO.map((g) => [normalize(g.nome), g]))

const wb = XLSX.readFile(SRC_FILE)
const linhas = XLSX.utils
  .sheet_to_json(wb.Sheets['Plan1'], { defval: '' })
  .filter((r) => String(r['NOME'] || '').trim())

const semMunicipioReconhecido = []
const porMunicipio = new Map()

for (const [i, r] of linhas.entries()) {
  const nomeMunicipio = String(r['MUNICIPIO'] || '').trim()
  const geo = geoPorNomeNormalizado.get(normalize(nomeMunicipio))
  const pessoa = {
    id: null, // preenchido depois, por município
    nome: String(r['NOME']).trim(),
    setor: String(r['CARGO'] || '').trim() || null,
    bairro: String(r['BAIRRO'] || '').trim() || null,
    contato: String(r['TELEFONE'] || '').trim() || null,
  }
  if (!geo) {
    semMunicipioReconhecido.push({ linha: i + 2, nome: pessoa.nome, municipio: nomeMunicipio })
    continue
  }
  if (!porMunicipio.has(geo.id)) porMunicipio.set(geo.id, { id: geo.id, nome: geo.nome, mesorregiao: geo.mesorregiao, pessoas: [] })
  porMunicipio.get(geo.id).pessoas.push(pessoa)
}

const municipiosBrutos = Array.from(porMunicipio.values())
const maiorTotal = Math.max(...municipiosBrutos.map((m) => m.pessoas.length))

const municipios = municipiosBrutos
  .map((m) => {
    const pessoasOrdenadas = m.pessoas
      .map((p, i) => ({ ...p, id: `${m.id}-${i + 1}` }))
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

const setores = Array.from(new Set(linhas.map((r) => String(r['CARGO'] || '').trim()).filter(Boolean))).sort(
  (a, b) => a.localeCompare(b, 'pt-BR')
)

const bairrosUnicos = new Set(linhas.map((r) => String(r['BAIRRO'] || '').trim()).filter(Boolean))

const mesorregioes = Array.from(new Set(PE_MUNICIPIOS_GEO.map((g) => g.mesorregiao)))

const kpis = {
  totalMilitantes: linhas.length,
  coberturaMunicipal: { atual: municipios.length, total: PE_MUNICIPIOS_GEO.length },
  setoresMapeados: setores.length,
  bairrosMapeados: bairrosUnicos.size,
}

const output = {
  metadata: {
    orgao: 'Secretaria da Mulher de Pernambuco (SecMulher-PE)',
    painel: 'Mapeamento de Militância e Presença Territorial',
    ultimaAtualizacao: new Date().toISOString().slice(0, 10),
    modo: 'producao',
  },
  kpis,
  mesorregioes,
  setores,
  municipios,
  pendencias: [],
}

const header = `// ============================================================================
// MILITANCIA_DATA — SecMulher-PE · Painel de Mapeamento de Militância
// ----------------------------------------------------------------------------
// Gerado por scripts/build-militancia-data.mjs — não editar manualmente.
// Fonte: src/data/militancia/militancia-corrigido.xlsx — planilha final
// curada manualmente (NOME, CARGO, MUNICIPIO, BAIRRO, TELEFONE), já sem
// pendências.
//
// Para atualizar: substitua o arquivo-fonte (mesmas colunas) e rode
//   node scripts/build-militancia-data.mjs
// ============================================================================

export const MILITANCIA_DATA = `

fs.writeFileSync(OUT_FILE, header + JSON.stringify(output, null, 2) + '\n')

console.log('Total de militantes:', linhas.length)
console.log('Municípios:', municipios.length)
console.log('Setores:', setores.length)
if (semMunicipioReconhecido.length) {
  console.log(`\n⚠ ${semMunicipioReconhecido.length} linha(s) com município não reconhecido (verifique grafia):`)
  for (const s of semMunicipioReconhecido) console.log(`  linha ${s.linha}: "${s.nome}" — município "${s.municipio}"`)
}
console.log('\nEscrito em', path.relative(ROOT, OUT_FILE))
