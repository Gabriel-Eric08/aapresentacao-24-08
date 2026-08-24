// Exporta SERVICOS_ESSENCIAIS_DATA (aba Militância Serv. Essenciais) pra um
// .xlsx editável — usado quando alguém do time precisa revisar/corrigir os
// dados fora do app e devolver um arquivo pra reimportar.
//
// Uso: node scripts/export-servicos-essenciais-xlsx.mjs [caminho-saida.xlsx]

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { SERVICOS_ESSENCIAIS_DATA } from '../src/data/servicosEssenciaisData.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT_FILE = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(ROOT, 'Casas Abrigo - Militancia Serv Essenciais.xlsx')

const linhas = []
for (const u of SERVICOS_ESSENCIAIS_DATA.unidades) {
  for (const p of u.pessoas) {
    linhas.push({
      'Unidade (Casa Abrigo)': p.unidade,
      'Nome': p.nome,
      'Cargo': p.cargo || '',
      'Empresa Contratada': p.empresaContratada || '',
      'Admissão': p.admissao || '',
      'Jornada': p.jornada || '',
      'Turno': p.turno || '',
    })
  }
}

const ws = XLSX.utils.json_to_sheet(linhas)
ws['!cols'] = [
  { wch: 22 }, // Unidade
  { wch: 32 }, // Nome
  { wch: 26 }, // Cargo
  { wch: 42 }, // Empresa
  { wch: 12 }, // Admissão
  { wch: 10 }, // Jornada
  { wch: 10 }, // Turno
]

const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'Serv Essenciais')
XLSX.writeFile(wb, OUT_FILE)

console.log(`${linhas.length} linhas exportadas para ${OUT_FILE}`)
