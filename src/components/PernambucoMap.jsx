import { useState } from 'react'
import { escalaRoxo, raioPorMilitantes, formatarNumero } from '../utils/helpers'

// Mapa esquemático e interativo de Pernambuco: os municípios são posicionados
// por coordenadas relativas (aproximadas) dentro de faixas que representam as
// 4 mesorregiões, permitindo interação (hover/click) sem depender de um
// arquivo de contorno geográfico real (GeoJSON).
const FAIXAS_MESORREGIAO = [
  { nome: 'Sertão', x: 0, largura: 260, cor: '#FAF5FF' },
  { nome: 'Agreste', x: 260, largura: 250, cor: '#F3E8FF' },
  { nome: 'Zona da Mata', x: 510, largura: 140, cor: '#EDE4FB' },
  { nome: 'RMR', x: 650, largura: 150, cor: '#E9D5FF' },
]

const VIEWBOX_W = 800
const VIEWBOX_H = 460

export default function PernambucoMap({
  municipios,
  idsVisiveis,
  selectedId,
  onSelect,
  compareMode,
  compareIds,
}) {
  const [hover, setHover] = useState(null) // { municipio, x, y }

  function handleEnter(e, municipio) {
    const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect()
    setHover({
      municipio,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  function handleMove(e) {
    if (!hover) return
    const rect = e.currentTarget.getBoundingClientRect()
    setHover((h) => (h ? { ...h, x: e.clientX - rect.left, y: e.clientY - rect.top } : h))
  }

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        className="w-full h-auto select-none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        {/* Faixas de mesorregião (fundo esquemático) */}
        {FAIXAS_MESORREGIAO.map((f) => (
          <g key={f.nome}>
            <rect
              x={f.x}
              y={0}
              width={f.largura}
              height={VIEWBOX_H}
              rx={28}
              fill={f.cor}
              stroke="#E9D5FF"
              strokeWidth={1.5}
            />
            <text
              x={f.x + f.largura / 2}
              y={26}
              textAnchor="middle"
              className="fill-institucional-text/70 font-semibold"
              style={{ fontSize: 13, letterSpacing: 0.5 }}
            >
              {f.nome.toUpperCase()}
            </text>
          </g>
        ))}

        {/* Municípios */}
        {municipios.map((m) => {
          const visivel = idsVisiveis.has(m.id)
          const isSelected = selectedId === m.id
          const isComparing = compareIds?.includes(m.id)
          const raio = raioPorMilitantes(m.totalMilitantes)
          const cor = escalaRoxo(m.percentualMilitantes)

          return (
            <g
              key={m.id}
              transform={`translate(${m.coordX}, ${m.coordY})`}
              opacity={visivel ? 1 : 0.22}
              className="cursor-pointer transition-opacity"
              onMouseEnter={(e) => handleEnter(e, m)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect(m.id)}
            >
              {(isSelected || isComparing) && (
                <circle
                  r={raio + 6}
                  fill="none"
                  stroke={isComparing ? '#10B981' : '#F59E0B'}
                  strokeWidth={3}
                  className="animate-pulse"
                />
              )}
              <circle r={raio} fill={cor} stroke="#5B21B6" strokeWidth={1} />
              {raio > 14 && (
                <text
                  y={raio + 13}
                  textAnchor="middle"
                  className="fill-institucional-deep font-semibold pointer-events-none"
                  style={{ fontSize: 10 }}
                >
                  {m.nome.length > 14 ? `${m.nome.slice(0, 13)}…` : m.nome}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-20 w-56 rounded-xl bg-white border border-institucional-border shadow-cardHover p-3 text-sm"
          style={{
            left: Math.min(hover.x + 14, 9999),
            top: Math.max(hover.y - 12, 0),
            transform: hover.x > VIEWBOX_W * 0.62 ? 'translateX(-105%)' : 'none',
          }}
        >
          <p className="font-bold text-institucional-deep">{hover.municipio.nome}</p>
          <p className="text-xs text-gray-500 mb-1.5">{hover.municipio.mesorregiao}</p>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">% Militantes</span>
            <span className="font-semibold text-institucional-textAlt">{hover.municipio.percentualMilitantes}%</span>
          </div>
          <div className="flex justify-between text-xs mt-0.5">
            <span className="text-gray-500">Estruturas SecMulher</span>
            <span className="font-semibold text-institucional-textAlt">{hover.municipio.estruturas.length}</span>
          </div>
          <div className="flex justify-between text-xs mt-0.5">
            <span className="text-gray-500">Militantes</span>
            <span className="font-semibold text-institucional-textAlt">{formatarNumero(hover.municipio.totalMilitantes)}</span>
          </div>
        </div>
      )}

      {/* Legenda de escala de calor */}
      <div className="flex items-center gap-2 mt-3 px-1">
        <span className="text-xs text-gray-500">Menor militância</span>
        <div className="h-2.5 flex-1 rounded-full" style={{ background: 'linear-gradient(90deg, #EDE9FE, #D8B4FE, #9333EA, #5B21B6)' }} />
        <span className="text-xs text-gray-500">Maior militância</span>
      </div>
    </div>
  )
}
