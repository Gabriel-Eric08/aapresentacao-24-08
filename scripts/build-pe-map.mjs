// Script de build (executado manualmente, não faz parte do runtime da app).
// Gera src/data/pernambucoMunicipiosGeo.js a partir de duas fontes públicas:
//  - Contorno dos municípios de PE: geodata-br (github.com/tbrugz/geodata-br)
//  - Divisão em mesorregiões: API de Localidades do IBGE
//
// Uso: node scripts/build-pe-map.mjs
//
// As 5 mesorregiões oficiais do IBGE são agrupadas nas 4 categorias usadas
// pelo painel (São Francisco Pernambucano é incorporado a "Sertão").

import fs from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TMP = fs.mkdtempSync('/tmp/pe-map-build-')

const GEOJSON_URL = 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-26-mun.json'
const IBGE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/26/municipios'

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Falha ao buscar ${url}: ${res.status}`)
  return res.json()
}

function stripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}
function slugify(nome) {
  return stripAccents(nome).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
function normalize(nome) {
  return stripAccents(nome).toLowerCase().trim()
}

const MESO_MAP = {
  'Metropolitana de Recife': 'RMR',
  'Mata Pernambucana': 'Zona da Mata',
  'Agreste Pernambucano': 'Agreste',
  'Sertão Pernambucano': 'Sertão',
  'São Francisco Pernambucano': 'Sertão',
}

// Pequenas divergências de grafia entre a base de contornos e a API do IBGE.
const ALIASES = {
  'belem de sao francisco': 'belem do sao francisco',
  iguaraci: 'iguaracy',
  'lagoa do itaenga': 'lagoa de itaenga',
}

async function main() {
  console.log('Baixando contornos municipais e mesorregiões...')
  const geoOriginal = await fetchJson(GEOJSON_URL)
  const ibge = await fetchJson(IBGE_URL)

  const rawPath = path.join(TMP, 'pe-mun.json')
  fs.writeFileSync(rawPath, JSON.stringify(geoOriginal))

  const simplifiedPath = path.join(TMP, 'pe-mun-simplified.json')
  execSync(
    `npx --yes mapshaper "${rawPath}" -simplify 30% keep-shapes -o format=geojson precision=0.0001 "${simplifiedPath}"`,
    { stdio: 'inherit' }
  )
  const geo = JSON.parse(fs.readFileSync(simplifiedPath, 'utf-8'))

  const mesoByName = new Map(
    ibge.map((m) => [normalize(m.nome), MESO_MAP[m.microrregiao.mesorregiao.nome]])
  )
  for (const [de, para] of Object.entries(ALIASES)) {
    if (mesoByName.has(para)) mesoByName.set(de, mesoByName.get(para))
  }

  const originalByName = new Map(geoOriginal.features.map((f) => [f.properties.name, f]))
  function isEmptyGeometry(geometry) {
    return !geometry || geometry.coordinates.length === 0
  }
  // Algumas geometrias pequenas/irregulares colapsam sob simplificação —
  // usa a geometria original (sem simplificar) só para essas, para o
  // contorno do estado não ficar com buracos.
  const geoFixed = geo.features.map((f) =>
    isEmptyGeometry(f.geometry) ? originalByName.get(f.properties.name) ?? f : f
  )
  // Remove Fernando de Noronha (distrito estadual insular, não é um dos 184
  // municípios) — sua distância do continente distorceria a projeção.
  const features = geoFixed.filter((f) => f.properties.name !== 'Fernando de Noronha')

  let lonMin = Infinity, lonMax = -Infinity, latMin = Infinity, latMax = -Infinity
  function visitCoords(geometry, fn) {
    const { type, coordinates } = geometry
    if (type === 'Polygon') coordinates.forEach((ring) => ring.forEach(fn))
    else if (type === 'MultiPolygon') coordinates.forEach((poly) => poly.forEach((ring) => ring.forEach(fn)))
  }
  for (const f of features) {
    visitCoords(f.geometry, ([lon, lat]) => {
      if (lon < lonMin) lonMin = lon
      if (lon > lonMax) lonMax = lon
      if (lat < latMin) latMin = lat
      if (lat > latMax) latMax = lat
    })
  }
  const PADDING = 0.15
  lonMin -= PADDING; lonMax += PADDING; latMin -= PADDING; latMax += PADDING
  const latMid = (latMin + latMax) / 2
  const cosLat = Math.cos((latMid * Math.PI) / 180)
  const WIDTH = 900
  const scale = WIDTH / ((lonMax - lonMin) * cosLat)
  const HEIGHT = (latMax - latMin) * scale

  function project([lon, lat]) {
    return [
      Math.round((lon - lonMin) * cosLat * scale * 10) / 10,
      Math.round((latMax - lat) * scale * 10) / 10,
    ]
  }
  function ringToPath(ring) {
    return ring.map(project).map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ') + ' Z'
  }
  function geometryToPath(geometry) {
    const { type, coordinates } = geometry
    if (type === 'Polygon') return coordinates.map(ringToPath).join(' ')
    if (type === 'MultiPolygon') return coordinates.map((poly) => poly.map(ringToPath).join(' ')).join(' ')
    return ''
  }
  function ringArea(ring) {
    let a = 0
    for (let i = 0; i < ring.length - 1; i++) a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
    return a / 2
  }
  function ringCentroid(ring) {
    let cx = 0, cy = 0, a = 0
    for (let i = 0; i < ring.length - 1; i++) {
      const [x0, y0] = ring[i], [x1, y1] = ring[i + 1]
      const cross = x0 * y1 - x1 * y0
      a += cross; cx += (x0 + x1) * cross; cy += (y0 + y1) * cross
    }
    a *= 0.5
    if (a === 0) return ring[0]
    return [cx / (6 * a), cy / (6 * a)]
  }
  function largestRing(geometry) {
    const { type, coordinates } = geometry
    const rings = type === 'Polygon' ? coordinates : coordinates.flat()
    let best = rings[0], bestArea = -Infinity
    for (const r of rings) {
      const projected = r.map(project)
      const a = Math.abs(ringArea(projected))
      if (a > bestArea) { bestArea = a; best = projected }
    }
    return best
  }

  const municipios = features
    .map((f) => {
      const nome = f.properties.name
      const ring = largestRing(f.geometry)
      const [cx, cy] = ringCentroid([...ring, ring[0]])
      const mesorregiao = mesoByName.get(normalize(nome)) ?? 'Agreste'
      return {
        id: slugify(nome),
        nome,
        mesorregiao,
        path: geometryToPath(f.geometry),
        cx: Math.round(cx * 10) / 10,
        cy: Math.round(cy * 10) / 10,
      }
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  const jsHeader = `// Malha de municípios de Pernambuco (geometria real, simplificada) usada
// pelo mapa coroplético do painel. Gerado a partir de dados públicos do
// IBGE (contorno municipal + divisão em mesorregiões) — projeção
// equirretangular corrigida por latitude, recortada para o viewBox abaixo.
// As 5 mesorregiões oficiais do IBGE foram agrupadas nas 4 categorias
// usadas pelo painel (São Francisco Pernambucano foi incorporado a "Sertão").
// Gerado por scripts/build-pe-map.mjs — não editar manualmente.
`
  const body = `${jsHeader}
export const PE_MAP_VIEWBOX = ${JSON.stringify({ width: Math.round(WIDTH), height: Math.round(HEIGHT) })}

export const PE_MUNICIPIOS_GEO = ${JSON.stringify(municipios)}
`

  const outPath = path.join(__dirname, '..', 'src', 'data', 'pernambucoMunicipiosGeo.js')
  fs.writeFileSync(outPath, body)
  console.log('Escrito em', outPath)
  console.log('Municípios:', municipios.length)
  console.log('Tamanho (KB):', Math.round(Buffer.byteLength(body) / 1024))
}

main()
