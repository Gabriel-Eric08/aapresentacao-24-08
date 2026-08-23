import { useRef, useState } from 'react'
import { PE_MAP_VIEWBOX, PE_MUNICIPIOS_GEO } from '../data/pernambucoMunicipiosGeo.js'
import { escalaRoxo, formatarNumero } from '../utils/helpers'

const COR_SEM_DADOS = '#EDE9FE'

// Mapa real de Pernambuco: contorno de cada um dos 184 municípios (dados
// públicos do IBGE), coloridos em escala coroplética de roxo para os
// municípios com ficha detalhada nesta amostra. Os demais aparecem em
// cinza-roxo neutro — cobertura territorial confirmada, mas sem
// detalhamento nesta base demonstrativa.
export default function PernambucoMap({
  dadosPorId,
  idsVisiveis,
  selectedId,
  onSelect,
  compareMode,
  compareIds,
}) {
  const [hover, setHover] = useState(null) // { municipio, dados, x, y }
  const svgRef = useRef(null)

  function handleEnter(e, municipio, dados) {
    const rect = svgRef.current.getBoundingClientRect()
    setHover({
      municipio,
      dados,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  function handleMove(e) {
    if (!hover) return
    const rect = svgRef.current.getBoundingClientRect()
    setHover((h) => (h ? { ...h, x: e.clientX - rect.left, y: e.clientY - rect.top } : h))
  }

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${PE_MAP_VIEWBOX.width} ${PE_MAP_VIEWBOX.height}`}
        className="w-full h-auto select-none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        {PE_MUNICIPIOS_GEO.map((g) => {
          const dados = dadosPorId.get(g.id)
          const visivel = idsVisiveis.has(g.id)
          const isSelected = selectedId === g.id
          const isComparing = compareIds?.includes(g.id)
          const destacado = isSelected || isComparing
          const fill = dados ? escalaRoxo(dados.percentualMilitantes) : COR_SEM_DADOS

          return (
            <path
              key={g.id}
              d={g.path}
              fill={fill}
              stroke={destacado ? (isComparing ? '#10B981' : '#F59E0B') : '#FFFFFF'}
              strokeWidth={destacado ? 2.2 : 0.6}
              opacity={visivel ? 1 : 0.28}
              className="cursor-pointer transition-opacity"
              onMouseEnter={(e) => handleEnter(e, g, dados)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect(g.id)}
            />
          )
        })}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-20 w-56 rounded-xl bg-white border border-institucional-border shadow-cardHover p-3 text-sm"
          style={{
            left: Math.min(hover.x + 14, 9999),
            top: Math.max(hover.y - 12, 0),
            transform: hover.x > PE_MAP_VIEWBOX.width * 0.62 ? 'translateX(-105%)' : 'none',
          }}
        >
          <p className="font-bold text-institucional-deep">{hover.municipio.nome}</p>
          <p className="text-xs text-gray-500 mb-1.5">{hover.municipio.mesorregiao}</p>
          {hover.dados ? (
            <>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">% Militantes</span>
                <span className="font-semibold text-institucional-textAlt">{hover.dados.percentualMilitantes}%</span>
              </div>
              <div className="flex justify-between text-xs mt-0.5">
                <span className="text-gray-500">Estruturas SecMulher</span>
                <span className="font-semibold text-institucional-textAlt">{hover.dados.estruturas.length}</span>
              </div>
              <div className="flex justify-between text-xs mt-0.5">
                <span className="text-gray-500">Militantes</span>
                <span className="font-semibold text-institucional-textAlt">{formatarNumero(hover.dados.totalMilitantes)}</span>
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-500">Cobertura territorial confirmada — sem ficha detalhada nesta amostra.</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mt-3 px-1">
        <span className="text-xs text-gray-500">Menor militância</span>
        <div className="h-2.5 flex-1 rounded-full" style={{ background: 'linear-gradient(90deg, #EDE9FE, #D8B4FE, #9333EA, #5B21B6)' }} />
        <span className="text-xs text-gray-500">Maior militância</span>
      </div>
      <p className="text-[11px] text-gray-400 mt-1.5 px-1">
        Municípios em cinza-roxo neutro: cobertura territorial confirmada, ficha ainda não detalhada nesta amostra demonstrativa.
      </p>
    </div>
  )
}
