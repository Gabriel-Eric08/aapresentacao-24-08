// Script de build (executado manualmente, não faz parte do runtime da app).
// Gera src/data/militanciaData.js a partir das planilhas reais em
// src/data/militancia/:
//  - contatos.csv .................................... nome + número (WhatsApp)
//  - LISTAGEM SECMULHER VOLUNTÁRIOS.xlsx .............. setor + bairro/município
//  - Planilha_Relacao_de_Pessoal_20_08_2026_AMANDA_02.xlsx  fallback de
//    bairro/município (endereço completo) e cargo, usado apenas quando a
//    pessoa não é encontrada na LISTAGEM.
//  - ../TERCEIRIZADOS SECMULHER - ELEIÇÃO.xlsx ......... nomes completos +
//    Cargo + Cidade/Município, sem telefone. Usado pra 1) completar
//    apelidos/primeiros nomes que sobraram sem nome completo nas outras
//    fontes (ver resolverNomeCompleto) e 2) preencher Setor/Cargo e
//    Município de quem não tem essa informação em nenhuma outra fonte (ver
//    localizacaoPorTerceirizados) — só usado como último recurso, depois de
//    LISTAGEM e Planilha_Relacao_de_Pessoal já terem sido tentadas.
//
// O cruzamento entre as fontes com telefone é feito pelos 8 últimos dígitos
// do telefone (chave robusta a variações de DDD/9º dígito/formatação). A
// TERCEIRIZADOS não tem telefone — o cruzamento aí é por nome: nome completo
// exato quando possível, senão por primeiro nome, e só quando é uma
// correspondência única (ver TERCEIRIZADOS_EXCLUIR para casos de match único
// que outra fonte contradiz).
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
  // "CABO" sozinho (ex.: TERCEIRIZADOS) — único município de PE com esse nome.
  // Lookahead evita duplicar quando já é "cabo de/do santo agostinho".
  [/\bcabo\b(?!\s+d[eo]\s+santo\s+agostinho)/g, 'cabo de santo agostinho'],
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

// Contatos que não são militantes (espaços, empresas etc.), ou que são
// duplicata de outra pessoa já no roster — não devem entrar no roster.
// Chave = telefone (8 últimos dígitos).
const CONTATOS_EXCLUIR_POR_TELEFONE = new Set([
  '84098289', // "Espaço Reluz" — não é pessoa
  '99288111', // "Wanildo Pinto" — mesma pessoa que "Wanildo Neto" (tel. 8105-7308, ver CORRECAO_FINAL_POR_TELEFONE)
  '85796953', // "Amor Só De Deus." — mesma pessoa que "Eduardo Florêncio" (tel. 9674-0834, ver CORRECAO_FINAL_POR_TELEFONE)
  '81676432', // "Eletrica Express" — não é pessoa
])

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
  .filter((c) => !(c.key && CONTATOS_EXCLUIR_POR_TELEFONE.has(c.key)))

// ---------------------------------------------------------------------------
// 2) LISTAGEM SECMULHER VOLUNTÁRIOS.xlsx — setor + endereço curto
// ---------------------------------------------------------------------------

// Linhas da LISTAGEM (sem telefone pra cruzar) que são a MESMA pessoa já
// representada por outra fonte com telefone — evita duplicar no roster.
// Chave = nome normalizado.
const LISTAGEM_EXCLUIR_POR_NOME = new Set([
  'anielle souza', // mesma pessoa que "Anniele Souza" (contatos.csv, tel. 8224-7054) — setor CAJ trazido pra lá
])

const wbListagem = XLSX.readFile(path.join(SRC_DIR, 'LISTAGEM SECMULHER VOLUNTÁRIOS.xlsx'))
const listagemRows = XLSX.utils.sheet_to_json(wbListagem.Sheets['Plan1'], { header: 1, defval: '' })
listagemRows.shift()
const listagem = listagemRows
  .filter((r) => String(r[1] || '').trim())
  .filter((r) => !LISTAGEM_EXCLUIR_POR_NOME.has(normalize(limparNome(r[1]))))
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
// nome-completo-normalizado -> { nomeOriginal, cargo, municipio } — usado também
// pra preencher Setor/Cargo + Município de quem não tem essa info em nenhuma
// outra fonte (ver localizacaoPorTerceirizados).
const terceirizadosPorNome = new Map()
for (const r of terceirizadosRows) {
  const nome = limparNome(r[4])
  if (!nome || nome.length <= 2) continue
  nomesTerceirizados.add(nome)
  const norm = normalize(nome)
  const cargo = titleCase(String(r[6] || '').trim())
  const municipio = String(r[8] || '').trim()
  if (cargo || municipio) {
    terceirizadosPorNome.set(norm, { nomeOriginal: nome, cargo: cargo || null, municipio: municipio || null })
  }
}
const candidatosPorPrimeiroNome = new Map() // primeiro-nome-normalizado -> Set(nome-completo-normalizado)
// "primeiro-nome|ultimo-nome" -> Set(nome-completo-normalizado) — pega quem
// tem nome do meio faltando de um lado ou de outro (ex.: pendência "Amaro
// Santos" vs. terceirizado "Amaro Lino Dos Santos").
const candidatosPorPrimeiroEUltimoNome = new Map()
const nomeNormalizadoParaOriginal = new Map()
for (const nome of nomesTerceirizados) {
  const norm = normalize(nome)
  nomeNormalizadoParaOriginal.set(norm, nome)
  const partes = norm.split(' ')
  const primeiro = partes[0]
  if (!candidatosPorPrimeiroNome.has(primeiro)) candidatosPorPrimeiroNome.set(primeiro, new Set())
  candidatosPorPrimeiroNome.get(primeiro).add(norm)
  if (partes.length > 1) {
    const chave = `${primeiro}|${partes[partes.length - 1]}`
    if (!candidatosPorPrimeiroEUltimoNome.has(chave)) candidatosPorPrimeiroEUltimoNome.set(chave, new Set())
    candidatosPorPrimeiroEUltimoNome.get(chave).add(norm)
  }
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
  // Confirmado com quem conhece a militância, entre os 2 candidatos
  // ambíguos de mesmo primeiro nome na planilha de TERCEIRIZADOS:
  '99786344': 'Janaina Ribeiro da Costa', // Janaina, +55 81 9978-6344
  '91663433': 'Marinalva Alves de Azevedo', // Marinalva, +55 81 9166-3433
  '85948914': 'Severino dos Ramos de Souza', // Severino, +55 81 8594-8914
  // '88771051': 'Nome completo aqui', // Elaine, +55 81 8877-1051 (São Lourenço da Mata) — já resolvida via LISTAGEM ("Elaine Leima")
}
const NOME_OVERRIDES_POR_NOME = {
  // Use esta quando a pessoa não tem telefone cadastrado no painel:
  // 'Fabi': 'Fabiana Xxxxx da Silva',
}

// Correção final de nome + cargo/setor/bairro/município — roda depois de
// tudo (inclusive resolverNomeCompleto), então funciona mesmo pra apelidos
// com espaço ("Ewelin SecMulher", "Família Cruz Pessoa" etc.), que
// resolverNomeCompleto ignora. Chave = telefone (8 últimos dígitos). Campos
// omitidos deixam o que já foi resolvido pelas outras fontes. `municipio` é
// o nome do município (vira objeto via detectarMunicipio); `bairro` é texto
// livre.
const CORRECAO_FINAL_POR_TELEFONE = {
  '91898472': { nome: 'Ewelin Cardoso' }, // era "Ewelin SecMulher"
  '98529225': { nome: 'Selence Correia' }, // era "Selene sec mulher"
  '94716607': { nome: 'Elyziana Machado', setor: 'Chefe de Gabinete' }, // era "Eli secmulher"
  // "Eduardo Florêncio" (era "Eduardo Lopes") e a antiga "Amor Só De Deus."
  // (tel. 8579-6953) são a mesma pessoa — telefone excluído em
  // CONTATOS_EXCLUIR_POR_TELEFONE e trazido aqui como 2º contato.
  '96740834': { nome: 'Eduardo Florêncio', setor: 'Manutenção Predial', municipio: 'Recife', contatoExtra: '+55 81 8579-6953' }, // era "Eduardo Lopes" — TERCEIRIZADOS: Eduardo Florêncio de Andrade
  '85117883': { nome: 'Ana Paula', setor: 'Vigilante' }, // era "Deus é bom o tempo todo"
  '89690804': { nome: 'Jana Cruz', setor: 'Governanta', municipio: 'Recife' }, // era "Família Cruz Pessoa" — TERCEIRIZADOS: Janaina Ferreira da Cruz, Técnico Admnistrativo (setor Governanta mantido, já confirmado antes)
  '93269320': { nome: 'Vitotia Silva', setor: 'Diplag UPL' }, // era "Vi"
  '94883535': { nome: 'Daniele Souza', setor: 'DEVG 190', municipio: 'Recife' }, // era "Dani" — TERCEIRIZADOS: Danielle Souza Albuquerque 190 (setor DEVG 190 mantido, já confirmado antes)
  '85493417': { nome: 'Wilma de Assis Neres', setor: 'Copeira', bairro: 'Ibura', municipio: 'Recife' }, // era "renanwilma80@gmail.com" / "Renan Wilma" — TERCEIRIZADOS: SERCOSERV
  '96958563': { nome: 'Ana Nery', setor: 'Auxiliar Serviços Gerais', municipio: 'Recife' }, // era "Ana Nery Jesus Minha Luz" — TERCEIRIZADOS: Ana Nery de Araujo
  '95590311': { setor: 'Comunicação', bairro: 'Piedade', municipio: 'Jaboatão dos Guararapes' }, // Emony
  '89405198': { nome: 'Gilvan Araújo', setor: 'Assessor Administrativo', municipio: 'Recife' }, // era "Gil SecMulher" — TERCEIRIZADOS: Gilvan de Araujo Pereira Filho
  '83558902': { nome: 'Geny Dione', setor: 'Vigilante', municipio: 'Recife' }, // era "Geny Dione maior é Deus" — TERCEIRIZADOS: Geni Dione Silva dos Santos
  '82247054': { nome: 'Anielle Souza', setor: 'CAJ', municipio: 'Recife' }, // era "Anniele Souza" — mesma pessoa da LISTAGEM (CAJ, sem telefone, ver LISTAGEM_EXCLUIR_POR_NOME); setor CAJ prevalece sobre o cargo formal da terceirização (Assessor Administrativo)
  '83088430': { setor: 'Técnico Admnistrativo', municipio: 'Recife' }, // Andreza K. Passos — TERCEIRIZADOS: Andreza Karolinne Lima
  '85728401': { setor: 'Motorista', municipio: 'Jaqueira' }, // carlos Vital — TERCEIRIZADOS: Carlos Antônio Vital da Silva (Lotação "Mata Sul" não é bairro)
  '91795353': { setor: 'Assessor Administrativo', municipio: 'Recife' }, // Carol — TERCEIRIZADOS: Caroline Lira
  '97744196': { setor: 'Motorista', municipio: 'Recife' }, // Cristóvão Fernandes — TERCEIRIZADOS: Cristovão Fernandes de Freitas
  '96281697': { setor: 'Manutenção Predial', municipio: 'Recife' }, // David Augusto — TERCEIRIZADOS: David Augusto da Silva
  '97553936': { setor: 'Assessor Administrativo', municipio: 'Recife' }, // Débora Eloy — TERCEIRIZADOS: Débora Eloy Falcão
  '86844553': { setor: 'Técnico Admnistrativo', municipio: 'Recife' }, // Girleide Maia — TERCEIRIZADOS: Girleide Maia da Cruz
  '88618011': { setor: 'Motorista', municipio: 'Recife' }, // Jamerson Gomes — TERCEIRIZADOS: Jamerson Gomes de Santana (Lotação "Executiva" não é bairro)
  '86127325': { setor: 'Motorista', municipio: 'Recife' }, // Jefferson Ferreira — TERCEIRIZADOS: Jefferson José Ferreira da Silva
  '96415285': { setor: 'Motorista', municipio: 'Recife' }, // Jucelio Felix — TERCEIRIZADOS: Jucelio Felix da Silva
  '88258774': { setor: 'Assessor Administrativo', municipio: 'Recife' }, // Juliene Henrique — TERCEIRIZADOS: Juliene Henrique Silva
  '86058559': { setor: 'Técnico Admnistrativo', municipio: 'Recife' }, // Kerollen Virginia — TERCEIRIZADOS: Kerollen Virginia de França
  '99187119': { setor: 'Assessor Administrativo', municipio: 'Recife' }, // Marie — TERCEIRIZADOS: Marielse Fortes
  '88386532': { setor: 'Motorista', municipio: 'Recife' }, // Paulo Tadeu — TERCEIRIZADOS: Paulo Tadeu Salviano Prado
  '88770734': { nome: 'Maria Rosineide da Silva', setor: 'Coordenadora Regional do Sertão do Pajeú', bairro: 'AABB', municipio: 'Serra Talhada' }, // era "Rose Silva" — Planilha_Relacao_de_Pessoal
  '84228338': { nome: 'Ana Paula', bairro: 'Jardim Fragoso', municipio: 'Olinda' }, // era "Paola"
  // "Wanildo Neto" (era "Neto SecMul") e "Wanildo Pinto" são a mesma pessoa
  // (confirmado) — telefone de "Wanildo Pinto" excluído em
  // CONTATOS_EXCLUIR_POR_TELEFONE e trazido aqui como 2º contato.
  '81057308': { nome: 'Wanildo Neto', contatoExtra: '+55 81 9928-8111' }, // era "Neto SecMul"
  '85211341': { nome: 'Fabiana da Silva Santos', setor: 'Cozinheira', municipio: 'Petrolina' }, // era "Fabi" — TERCEIRIZADOS: Fabiana da Silva Santos
  '87953819': { setor: 'Vigilante', municipio: 'Recife' }, // valmir nestor — TERCEIRIZADOS: Valmir Nestor dos Santos
  '84157185': { setor: 'Auxiliar Serviços Gerais', municipio: 'Recife' }, // Verônica Pereira — TERCEIRIZADOS: Veronica Pereira do Amaral
  '88027393': { setor: 'Motorista', municipio: 'Recife' }, // Vinicius Ricardo — TERCEIRIZADOS: Vinicius Ricardo dos Santos Nascimento
}

// Igual a CORRECAO_FINAL_POR_TELEFONE, mas pra quem não tem telefone
// cadastrado no painel (ex.: as pendências CAJ que só vêm da LISTAGEM).
// Chave = nome normalizado.
const CORRECAO_FINAL_POR_NOME = {
  'ericka tatiane': { municipio: 'Recife' }, // TERCEIRIZADOS: Ericka Tatiana de Souza Barbosa, Apoio Administrativo (setor CAJ mantido, já confirmado antes)
}

function aplicarCorrecaoFinal(pessoa, key) {
  const correcao = (key && CORRECAO_FINAL_POR_TELEFONE[key]) || CORRECAO_FINAL_POR_NOME[normalize(pessoa.nome)]
  if (!correcao) return pessoa
  return {
    ...pessoa,
    nome: correcao.nome ?? pessoa.nome,
    setor: correcao.setor ?? pessoa.setor,
    bairro: correcao.bairro ?? pessoa.bairro,
    municipio: correcao.municipio ? detectarMunicipio(correcao.municipio) : pessoa.municipio,
    contato: correcao.contatoExtra
      ? pessoa.contato
        ? `${pessoa.contato} / ${correcao.contatoExtra}`
        : correcao.contatoExtra
      : pessoa.contato,
  }
}

// Resolve o nome completo de uma pessoa cujo nome atual é uma palavra só
// (apelido/primeiro nome). Prioridade: 1) correção manual acima 2) telefone
// batendo com a Planilha_Relacao_de_Pessoal (nome completo oficial) 3)
// telefone batendo com a LISTAGEM (mesma fonte já usada pra setor/bairro,
// usada só quando a Planilha não tem esse telefone) 4) match único por
// primeiro nome nos terceirizados.
const nomesCompletados = []

function resolverNomeCompleto(nomeAtual, key, nomeListagem) {
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
  if (
    nomeListagem &&
    nomeListagem.trim().includes(' ') &&
    normalize(nomeListagem).split(' ')[0] === normalize(nomeAtual)
  ) {
    const completo = titleCase(nomeListagem)
    nomesCompletados.push({ de: nomeAtual, para: completo, fonte: 'telefone (LISTAGEM)' })
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

// Fallback de última instância: cruza pelo nome (já resolvido/completo) com
// TERCEIRIZADOS SECMULHER - ELEIÇÃO.xlsx, que tem Cargo + Cidade/Município
// pra cada terceirizado. Só usado quando nenhuma outra fonte achou
// localização (resolverLocalizacao acima retornou null). Prioridade:
// 1) match exato pelo nome completo; 2) se o nome tem 2+ palavras mas não
// bateu exato (ex.: falta um nome do meio de um lado ou de outro — "Amaro
// Santos" vs. "Amaro Lino Dos Santos"), match único por primeiro+último
// nome; 3) se o nome é um apelido de uma palavra só, match único por
// primeiro nome (mesmo critério de nomeCompletoPorTerceirizados). Em
// qualquer um dos casos 2 e 3, só aplica se existir EXATAMENTE UM candidato
// (e não estiver em TERCEIRIZADOS_EXCLUIR) — ambíguo fica sem match.
function localizacaoPorTerceirizados(nomeResolvido) {
  if (!nomeResolvido) return null
  const norm = normalize(nomeResolvido)
  let dados = terceirizadosPorNome.get(norm)
  if (!dados && !TERCEIRIZADOS_EXCLUIR.has(norm)) {
    const partes = norm.split(' ')
    if (partes.length > 1) {
      const chave = `${partes[0]}|${partes[partes.length - 1]}`
      const candidatos = candidatosPorPrimeiroEUltimoNome.get(chave)
      if (candidatos && candidatos.size === 1) {
        const [unico] = candidatos
        dados = terceirizadosPorNome.get(unico)
      }
    } else {
      const candidatos = candidatosPorPrimeiroNome.get(norm)
      if (candidatos && candidatos.size === 1) {
        const [unico] = candidatos
        dados = terceirizadosPorNome.get(unico)
      }
    }
  }
  if (!dados) return null
  // Município nem sempre bate com um município real de PE (às vezes o campo
  // Cidade/Município da planilha traz um bairro, tipo "JERUSA"). Mesmo sem
  // reconhecer o município, o Cargo ainda é aproveitado — melhor a pessoa
  // ficar em pendências com Setor preenchido do que sem nada.
  const municipio = dados.municipio ? detectarMunicipio(dados.municipio) : null
  return { setor: dados.cargo, bairro: null, municipio, origem: 'terceirizados' }
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
  const nome = resolverNomeCompleto(c.nome, c.key, listagemMatch?.nome)
  // Nome "de verdade" pra buscar localização nos terceirizados: se há uma
  // correção manual (nome bruto era errado/apelido), usa o nome corrigido —
  // nunca o nome bruto, que pode coincidir por acaso com OUTRA pessoa na
  // planilha de terceirizados (ver comentário de localizacaoPorTerceirizados).
  const correcaoFinal = c.key && CORRECAO_FINAL_POR_TELEFONE[c.key]
  const nomeParaBusca = correcaoFinal?.nome ?? nome
  const loc = resolverLocalizacao({
    key: c.key,
    enderecoDireto: listagemMatch?.endereco,
    setorDireto: listagemMatch?.setor,
  })
  const locTerceirizados = loc ? null : localizacaoPorTerceirizados(nomeParaBusca)
  roster.push(aplicarCorrecaoFinal({
    nome,
    contato: c.numero ? c.numero.replace(/\s+/g, ' ').trim() : null,
    setor: loc?.setor || listagemMatch?.setor || locTerceirizados?.setor || null,
    bairro: loc?.bairro || locTerceirizados?.bairro || null,
    municipio: loc?.municipio || locTerceirizados?.municipio || null,
  }, c.key))
  if (c.key) chavesUsadas.add(c.key)
}

for (const l of listagem) {
  if (l.key && chavesUsadas.has(l.key)) continue
  const nome = resolverNomeCompleto(titleCase(l.nome), l.key)
  const correcaoFinal = l.key && CORRECAO_FINAL_POR_TELEFONE[l.key]
  const nomeParaBusca = correcaoFinal?.nome ?? nome
  const loc = resolverLocalizacao({ key: l.key, enderecoDireto: l.endereco, setorDireto: l.setor })
  const locTerceirizados = loc ? null : localizacaoPorTerceirizados(nomeParaBusca)
  roster.push(aplicarCorrecaoFinal({
    nome,
    contato: l.telefone ? formatarTelefone(l.telefone) : null,
    setor: loc?.setor || l.setor || locTerceirizados?.setor || null,
    bairro: loc?.bairro || locTerceirizados?.bairro || null,
    municipio: loc?.municipio || locTerceirizados?.municipio || null,
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
