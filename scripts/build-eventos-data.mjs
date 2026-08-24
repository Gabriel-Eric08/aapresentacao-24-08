// Script de build (executado manualmente, não faz parte do runtime da app).
// Gera src/data/eventosData.js a partir de duas fontes:
//  - src/data/atas/*.docx ................... atas de presença de oficinas.
//    Um .docx pode ter mais de uma tabela de presença (ex.: a ata das
//    Caravanas das Mulheres tem 12 seções DATA/LOCAL/ATIVIDADE + tabela,
//    uma por atividade/parada) — cada tabela vira um evento separado.
//  - src/data/corrida-caminhada/*.xlsx ...... inscrições do 1º Circuito
//    Pernambucano de Corrida e Caminhada das Mulheres (exportação de
//    formulário, uma planilha por parada/município).
//
// Um .docx é um zip contendo word/document.xml (WordprocessingML). Não há
// parser XML aqui — o texto de cada parágrafo/célula é extraído concatenando
// todos os elementos <w:t> dentro do trecho (robusto a runs quebrados pelo
// Word). Parágrafos e tabelas são varridos em UMA passada, na ordem em que
// aparecem no documento (via regex de alternância `<w:tbl>|<w:p>` com `g`),
// para associar corretamente cada tabela aos campos DATA/LOCAL/ATIVIDADE que
// vieram antes dela — essencial quando há múltiplas seções no mesmo arquivo.
//
// O bairro/município de cada evento não é um campo estruturado nas fontes —
// é texto livre (campo LOCAL da ata, ou a frase de confirmação do formulário
// de corrida). Para os 16 arquivos originais (um evento por arquivo, local
// muitas vezes um bairro do Recife como "Imbiribeira" ou "Ibura", que não dá
// pra achar automaticamente numa lista de município) o bairro/município
// continua curado à mão em LOCAL_OVERRIDES. Para tudo que não está nessa
// tabela (arquivos novos, seções extras dentro de um arquivo já existente),
// o município é resolvido automaticamente por correspondência de texto
// contra os 184 municípios reais de PE — sem tentar adivinhar bairro nesse
// caso. Quando nada é identificável com confiança, o campo fica nulo.
//
// Deduplicação: só é tratado como duplicata de verdade quando a lista de
// presença (conjunto de nomes) é idêntica à de outro evento já lido — sinal
// de que é o mesmo arquivo reprocessado/renomeado. Evento+data+local iguais
// SEM a mesma lista de presença não é descartado (já aconteceu de duas atas
// da mesma oficina/data/local terem listas de assinatura diferentes — turmas
// separadas) — nesse caso o evento só é numerado "(2)", "(3)"... pra
// diferenciar os cards, sem perder ninguém.
//
// Uso: node scripts/build-eventos-data.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'
import XLSX from 'xlsx'
import { PE_MUNICIPIOS_GEO } from '../src/data/pernambucoMunicipiosGeo.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const ATAS_DIR = path.join(ROOT, 'src/data/atas')
const CORRIDA_DIR = path.join(ROOT, 'src/data/corrida-caminhada')
const OUT_FILE = path.join(ROOT, 'src/data/eventosData.js')

// ---------------------------------------------------------------------------
// Curadoria manual de bairro/município — só para os 16 arquivos originais
// (um evento por arquivo). Ver nota no topo do arquivo.
// ---------------------------------------------------------------------------

const LOCAL_OVERRIDES = {
  'ATA DE PRESENÇA - artesanato - 08_05_26 imbiribeira.docx': { bairro: 'Imbiribeira', municipioId: 'recife' },
  'ATA DE PRESENÇA - artesanato - imbiribeira.docx': { bairro: 'Imbiribeira', municipioId: 'recife' },
  'ATA DE PRESENÇA - igreja - customização de roupas e abadás.docx': { bairro: 'Passarinho', municipioId: 'recife' },
  'ATA DE PRESENÇA - laços - 23_05_26.docx': { bairro: null, municipioId: 'gloria-do-goita' },
  'ATA DE PRESENÇA - laços - cabo.docx': { bairro: null, municipioId: 'cabo-de-santo-agostinho' },
  'ATA DE PRESENÇA - laços - chã grande.docx': { bairro: null, municipioId: 'cha-grande' },
  'ATA DE PRESENÇA - laços - compaz.docx': { bairro: null, municipioId: 'recife' },
  'ATA DE PRESENÇA - laços - ibura.docx': { bairro: 'Ibura', municipioId: 'recife' },
  'ATA DE PRESENÇA - laços - Vertentes do Lério.docx': { bairro: null, municipioId: 'vertente-do-lerio' },
  'ATA DE PRESENÇA - laços glória do goitá.docx': { bairro: null, municipioId: 'gloria-do-goita' },
  'ATA DE PRESENÇA - laços imbiribeira - 08_05.docx': { bairro: 'Imbiribeira', municipioId: 'recife' },
  'ATA DE PRESENÇA - palestra - imbiribeira.docx': { bairro: 'Imbiribeira', municipioId: 'recife' },
  'ATA DE PRESENÇA - rio doce - customização.docx': { bairro: 'Rio Doce', municipioId: 'olinda' },
  'ATA DE PRESENÇA - roda de fogo - LAÇOS.docx': { bairro: 'Torrões', municipioId: 'recife' },
  'ATA DE PRESENÇA - roupas - comunidade do bode.docx': { bairro: 'Pina', municipioId: 'recife' },
  // "Júlia Santiago" é citado em vários arquivos ("Centro da Mulher
  // Pernambucana/Metropolitana Júlia Santiago", "Júlia Santiago" sozinho) —
  // dois arquivos novos localizam explicitamente "Júlia Santiago - Brasília
  // Teimosa", então aplicamos o mesmo bairro/município aos demais que citam
  // o mesmo centro.
  'ATA DE PRESENÇA - trufas - júlia santiago agosto.docx': { bairro: 'Brasília Teimosa', municipioId: 'recife' },
  'ATA DE PRESENÇA - Trufas - 01_07_26.docx': { bairro: 'Brasília Teimosa', municipioId: 'recife' },
  'ATA DE PRESENÇA - bolos e doces - 12_06.docx': { bairro: 'Brasília Teimosa', municipioId: 'recife' },
  'ata de presença - ação para emissão de carteira de artesão.docx': { bairro: 'Brasília Teimosa', municipioId: 'recife' },
  'ATA DE PRESENÇA - roupas e abadás - julia santiago_.docx': { bairro: 'Brasília Teimosa', municipioId: 'recife' },
  'ATA DE PRESENÇA - ARTESANATO - 21_05_26.docx': { bairro: 'Brasília Teimosa', municipioId: 'recife' },
  'ATA DE PRESENÇA - igreja passarinho - 20_06_26.docx': { bairro: 'Passarinho', municipioId: 'recife' },
  'ATA DE PRESENÇA - artesanato - 25_05_26.docx': { bairro: 'Peixinhos', municipioId: 'olinda' },
  'ATA DE PRESENÇA - FIBROMIALGIA - 22_05_26.docx': { bairro: null, municipioId: 'cabo-de-santo-agostinho' },
  'ATA DE PRESENÇA - cidadania delas - 09_06_26.docx': { bairro: 'Santana', municipioId: 'camaragibe' },
  'ATA DE PRESENÇA - laços para cabelos - monte verde.docx': { bairro: 'Monte Verde', municipioId: 'jaboatao-dos-guararapes' },
  'ATA DE PRESENÇA - roupa e abadá - caranguejo_.docx': { bairro: 'Caranguejo Tabaiares', municipioId: 'recife' },
}

// ---------------------------------------------------------------------------
// Utilidades de texto / município (mesma técnica de build-militancia-data.mjs
// e build-programas-data.mjs)
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

function slugify(s) {
  return normalize(s).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const MUNICIPIOS_INDEX = PE_MUNICIPIOS_GEO.map((g) => ({
  id: g.id,
  nome: g.nome,
  norm: normalize(g.nome),
})).sort((a, b) => b.norm.length - a.norm.length)

const MUNICIPIOS_POR_ID = new Map(PE_MUNICIPIOS_GEO.map((g) => [g.id, g.nome]))

function detectarMunicipio(texto) {
  const norm = normalize(texto)
  for (const m of MUNICIPIOS_INDEX) {
    if (new RegExp(`\\b${m.norm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(norm)) {
      return m
    }
  }
  return null
}

function resolverLocal(arquivo, local, totalEventosNoArquivo) {
  if (totalEventosNoArquivo === 1 && LOCAL_OVERRIDES[arquivo]) {
    const o = LOCAL_OVERRIDES[arquivo]
    return { bairro: o.bairro, municipioId: o.municipioId, municipioNome: o.municipioId ? MUNICIPIOS_POR_ID.get(o.municipioId) : null }
  }
  const m = local ? detectarMunicipio(local) : null
  return { bairro: null, municipioId: m?.id || null, municipioNome: m?.nome || null }
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
// Extração de texto de trechos de WordprocessingML
// ---------------------------------------------------------------------------

function decodeXmlEntities(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

function extractText(fragment) {
  const partes = []
  const re = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\s*\/>|<w:br\s*\/>/g
  let m
  while ((m = re.exec(fragment))) {
    if (m[0].startsWith('<w:tab')) partes.push('\t')
    else if (m[0].startsWith('<w:br')) partes.push(' ')
    else partes.push(decodeXmlEntities(m[1]))
  }
  return partes.join('').replace(/\s+/g, ' ').trim()
}

function extractLinhasTabela(tblXml) {
  const linhas = []
  const trRe = /<w:tr(?:\s[^>]*)?>[\s\S]*?<\/w:tr>/g
  let rm
  while ((rm = trRe.exec(tblXml))) {
    const celulas = []
    const tcRe = /<w:tc(?:\s[^>]*)?>[\s\S]*?<\/w:tc>/g
    let cm
    while ((cm = tcRe.exec(rm[0]))) {
      celulas.push(extractText(cm[0]))
    }
    linhas.push(celulas)
  }
  return linhas
}

// Varre o corpo do documento numa passada só, preservando a ordem entre
// parágrafos e tabelas (essencial para associar DATA/LOCAL/ATIVIDADE à
// tabela correta quando há várias seções no mesmo arquivo).
function extractSequencia(xml) {
  const seq = []
  const re = /<w:tbl>[\s\S]*?<\/w:tbl>|<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g
  let m
  while ((m = re.exec(xml))) {
    if (m[0].startsWith('<w:tbl')) {
      seq.push({ tipo: 'tbl', linhas: extractLinhasTabela(m[0]) })
    } else {
      const txt = extractText(m[0])
      if (txt) seq.push({ tipo: 'p', texto: txt })
    }
  }
  return seq
}

const ROTULOS_CAMPO = [
  ['atividade', /^ATIVIDADE\s*:\s*(.+)$/i],
  ['evento', /^EVENTO\s*:\s*(.+)$/i],
  ['local', /^LOCAL\s*:\s*(.+)$/i],
  ['dataRaw', /^DATA\s*:\s*(.+)$/i],
  ['responsaveis', /^RESPONS[ÁA]VEIS\s*:\s*(.+)$/i],
]

// Extrai a lista de presença de uma tabela, tolerando dois formatos vistos
// nos arquivos reais: com cabeçalho "Nº/NOME COMPLETO/FONE" (3 colunas) ou
// "NOME COMPLETO/TELEFONE" (2 colunas) — e também tabelas sem nenhuma linha
// de cabeçalho (a última seção da ata das Caravanas não tem uma).
function participantesDaTabela(linhas) {
  if (linhas.length === 0) return []
  const primeira = linhas[0].map((c) => normalize(c))
  const temCabecalho = primeira.some((c) => c.includes('nome'))
  const dados = temCabecalho ? linhas.slice(1) : linhas
  const numColunas = linhas[0].length

  return dados
    .map((linha, i) => {
      if (numColunas >= 3) {
        return {
          numero: linha[0]?.trim() || String(i + 1),
          nome: (linha[1] || '').trim(),
          telefone: linha[2]?.trim() || null,
        }
      }
      return {
        numero: String(i + 1),
        nome: (linha[0] || '').trim(),
        telefone: linha[1]?.trim() || null,
      }
    })
    .filter((p) => p.nome)
}

function parseDataBarras(dataStr) {
  const m = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/.exec(dataStr || '')
  if (!m) return null
  const [, dd, mm, yyRaw] = m
  const yy = yyRaw.length === 2 ? 2000 + Number(yyRaw) : Number(yyRaw)
  return `${yy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}

const MESES_EXTENSO = {
  janeiro: '01', fevereiro: '02', março: '03', abril: '04', maio: '05', junho: '06',
  julho: '07', agosto: '08', setembro: '09', outubro: '10', novembro: '11', dezembro: '12',
}

function parseDataExtenso(dataStr) {
  const m = /(\d{1,2})\s+de\s+([a-zà-ú]+)\s+de\s+(\d{4})/i.exec(normalize(dataStr || ''))
  if (!m) return null
  const [, dd, mesNome, yy] = m
  const mm = MESES_EXTENSO[mesNome]
  if (!mm) return null
  return `${yy}-${mm}-${dd.padStart(2, '0')}`
}

function parseData(dataStr) {
  return parseDataBarras(dataStr) || parseDataExtenso(dataStr)
}

// ---------------------------------------------------------------------------
// Processa um .docx — pode gerar 1 ou vários eventos (uma por tabela)
// ---------------------------------------------------------------------------

async function eventosDeDocx(arquivo) {
  const buffer = fs.readFileSync(path.join(ATAS_DIR, arquivo))
  const zip = await JSZip.loadAsync(buffer)
  const documentXml = await zip.file('word/document.xml').async('string')
  const seq = extractSequencia(documentXml)

  const campos = {}
  const brutos = []
  for (const item of seq) {
    if (item.tipo === 'p') {
      for (const [chave, re] of ROTULOS_CAMPO) {
        const m = re.exec(item.texto)
        if (m) campos[chave] = m[1].trim()
      }
    } else {
      brutos.push({ ...campos, participantes: participantesDaTabela(item.linhas) })
    }
  }

  return brutos.map((b, i) => {
    const { bairro, municipioId, municipioNome } = resolverLocal(arquivo, b.local, brutos.length)
    const evento = b.evento || b.atividade || arquivo.replace(/\.docx$/, '')
    return {
      id: brutos.length > 1 ? slugify(`${arquivo.replace(/\.docx$/, '')}-${i + 1}`) : slugify(arquivo.replace(/\.docx$/, '')),
      arquivo: brutos.length > 1 ? `${arquivo} (seção ${i + 1})` : arquivo,
      evento,
      atividade: b.atividade || null,
      local: b.local || null,
      bairro,
      municipioId,
      municipioNome,
      data: parseData(b.dataRaw),
      dataDisplay: b.dataRaw || null,
      responsaveis: b.responsaveis || null,
      totalParticipantes: b.participantes.length,
      participantes: b.participantes,
    }
  })
}

// ---------------------------------------------------------------------------
// Processa um .xlsx de inscrição do Circuito de Corrida e Caminhada — uma
// planilha por parada/município, exportação de formulário.
// ---------------------------------------------------------------------------

function eventoDeCorridaXlsx(arquivo) {
  const wb = XLSX.readFile(path.join(CORRIDA_DIR, arquivo))
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' })
  const header = rows[0].map((h) => String(h || ''))
  const dados = rows.slice(1)

  const idxNome = header.findIndex((h) => normalize(h).includes('nome e sobrenome'))
  const idxTelefone = header.findIndex((h) => normalize(h).includes('telefone'))
  const idxConfirmacao = header.findIndex((h) => normalize(h).includes('municipio de'))

  const textoConfirmacao = idxConfirmacao >= 0 ? header[idxConfirmacao] : ''
  const mMunicipio = /Munic[ií]pio de\s+([^\-]+?)\s*-\s*PE/i.exec(textoConfirmacao)
  const municipioTexto = mMunicipio ? mMunicipio[1].trim() : arquivo
  const municipio = detectarMunicipio(municipioTexto)

  const participantes = dados
    .map((linha, i) => ({
      numero: String(i + 1),
      nome: titleCase((linha[idxNome] || '').toString().trim()),
      telefone: linha[idxTelefone] ? formatarTelefone(linha[idxTelefone]) : null,
    }))
    .filter((p) => p.nome)

  return {
    id: slugify(arquivo.replace(/\.xlsx$/, '')),
    arquivo,
    evento: `1º Circuito Pernambucano de Corrida e Caminhada das Mulheres — ${municipio?.nome || municipioTexto}`,
    atividade: 'Corrida e caminhada (5km) — inscrições',
    local: municipio?.nome || municipioTexto,
    bairro: null,
    municipioId: municipio?.id || null,
    municipioNome: municipio?.nome || null,
    data: null, // não há uma data única de evento no formulário, só carimbos de inscrição individuais
    dataDisplay: null,
    responsaveis: null,
    totalParticipantes: participantes.length,
    participantes,
  }
}

// ---------------------------------------------------------------------------
// Coleta tudo, dedup e escreve o arquivo final
// ---------------------------------------------------------------------------

const arquivosDocx = fs.existsSync(ATAS_DIR)
  ? fs.readdirSync(ATAS_DIR).filter((f) => f.endsWith('.docx') && !f.startsWith('~$'))
  : []
const arquivosCorrida = fs.existsSync(CORRIDA_DIR)
  ? fs.readdirSync(CORRIDA_DIR).filter((f) => f.endsWith('.xlsx') && !f.startsWith('~$'))
  : []

const eventosBrutos = []
for (const arquivo of arquivosDocx) {
  eventosBrutos.push(...(await eventosDeDocx(arquivo)))
}
for (const arquivo of arquivosCorrida) {
  eventosBrutos.push(eventoDeCorridaXlsx(arquivo))
}

// Duplicidade real = mesma lista de presença (mesmo conjunto de nomes),
// não só metadado batendo: dois arquivos diferentes com o mesmo evento,
// data e local podem legitimamente ser duas listas de assinatura distintas
// (turmas diferentes) — descartar por metadado sozinho já apagou pessoas
// reais numa primeira tentativa aqui. Metadado colidindo sem a mesma lista
// de presença só numera o evento (2), (3)... pra diferenciar os cards.
const porAssinatura = new Map()
const porChaveMeta = new Map()
const eventos = []
for (const e of eventosBrutos) {
  const assinatura = e.participantes.map((p) => normalize(p.nome)).sort().join('|')
  if (assinatura && porAssinatura.has(assinatura)) {
    console.warn(`Duplicado ignorado (mesma lista de presença): "${e.arquivo}" repete "${porAssinatura.get(assinatura)}"`)
    continue
  }
  if (assinatura) porAssinatura.set(assinatura, e.arquivo)

  const chaveMeta = `${normalize(e.evento)}|${e.data || ''}|${normalize(e.local || '')}`
  const ocorrencia = (porChaveMeta.get(chaveMeta) || 0) + 1
  porChaveMeta.set(chaveMeta, ocorrencia)
  if (ocorrencia > 1) {
    console.warn(`Metadado repetido (evento/data/local iguais, presença diferente): "${e.arquivo}" — numerado como "${e.evento} (${ocorrencia})"`)
  }

  eventos.push(ocorrencia > 1 ? { ...e, evento: `${e.evento} (${ocorrencia})` } : e)
}

eventos.sort((a, b) => (b.data || '').localeCompare(a.data || ''))

const totalParticipacoes = eventos.reduce((acc, e) => acc + e.totalParticipantes, 0)

const output = {
  metadata: {
    fonte: 'Atas de presença (src/data/atas/*.docx) + inscrições de corrida/caminhada (src/data/corrida-caminhada/*.xlsx)',
    totalEventos: eventos.length,
  },
  totalParticipacoes,
  eventos,
}

const header = `// ============================================================================
// EVENTOS_DATA — SecMulher-PE · Atas de Presença em Eventos
// ----------------------------------------------------------------------------
// Gerado por scripts/build-eventos-data.mjs — não editar manualmente.
// Fontes: atas de presença (.docx) em src/data/atas/ (uma ou mais seções
// DATA/LOCAL/ATIVIDADE + tabela por arquivo) e inscrições do Circuito de
// Corrida e Caminhada das Mulheres (.xlsx) em src/data/corrida-caminhada/.
// Bairro/município: os 16 arquivos originais têm bairro curado à mão (ver
// LOCAL_OVERRIDES no script); os demais são resolvidos automaticamente por
// correspondência de texto contra os 184 municípios reais de PE, sem bairro.
// Quando não dá pra identificar com confiança, o campo fica nulo.
// Eventos com a mesma lista de presença de outro já lido (mesmo arquivo
// reprocessado/renomeado) são descartados automaticamente. Evento+data+local
// repetidos com listas de presença diferentes viram cards "(2)", "(3)"...
// — ver avisos no console ao rodar o script.
//
// Para atualizar: adicione/substitua os arquivos-fonte e rode
//   node scripts/build-eventos-data.mjs
// ============================================================================

export const EVENTOS_DATA = `

fs.writeFileSync(OUT_FILE, header + JSON.stringify(output, null, 2) + '\n')

console.log('Eventos processados:', eventos.length, '(brutos antes da dedup:', eventosBrutos.length, ')')
console.log('Total de participações:', totalParticipacoes)
console.log('Escrito em', path.relative(ROOT, OUT_FILE))
