import { MapPin, Users2, ListChecks, MapPinned } from 'lucide-react'
import DonutChart from './DonutChart.jsx'
import { formatarNumero } from '../utils/helpers'

export default function MunicipalityPanel({ municipio, municipioGeo }) {
  if (!municipioGeo) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-institucional-border bg-white/60 p-8">
        <MapPin size={32} className="text-institucional-textAlt mb-2" />
        <p className="font-semibold text-institucional-deep">Selecione um município no mapa</p>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">
          Clique em qualquer ponto do mapa de Pernambuco para visualizar os militantes mapeados no município.
        </p>
      </div>
    )
  }

  if (!municipio) {
    return (
      <div className="rounded-2xl border border-institucional-border bg-white shadow-card overflow-hidden">
        <div className="bg-gradient-to-br from-institucional-deep to-institucional-vibrant text-white px-4 py-3.5">
          <p className="text-[11px] uppercase tracking-wide text-purple-200 font-semibold">{municipioGeo.mesorregiao}</p>
          <h3 className="text-lg font-extrabold leading-tight">{municipioGeo.nome}</h3>
        </div>
        <div className="p-6 flex flex-col items-center text-center gap-2">
          <MapPinned size={28} className="text-institucional-textAlt" />
          <p className="text-sm font-semibold text-institucional-deep">Nenhum militante identificado</p>
          <p className="text-xs text-gray-500 max-w-[15rem]">
            Nenhuma pessoa com bairro e setor identificados neste município nas planilhas de militância carregadas.
          </p>
        </div>
      </div>
    )
  }

  const maiorBairro = municipio.topBairros[0]

  return (
    <div className="rounded-2xl border border-institucional-border bg-white shadow-card overflow-hidden">
      <div className="bg-gradient-to-br from-institucional-deep to-institucional-vibrant text-white px-4 py-3.5">
        <p className="text-[11px] uppercase tracking-wide text-purple-200 font-semibold">{municipio.mesorregiao}</p>
        <h3 className="text-lg font-extrabold leading-tight">{municipio.nome}</h3>
        <p className="text-xs text-purple-100 mt-0.5">
          {formatarNumero(municipio.totalMilitantes)} militante(s) mapeado(s)
        </p>
      </div>

      <div className="p-4 space-y-5 max-h-[560px] overflow-y-auto">
        <div className="flex items-center justify-center">
          <DonutChart
            percentual={municipio.percentualMilitantes}
            label="Concentração de militância"
            sublabel={`Relativo ao município com mais militantes mapeados`}
          />
        </div>

        <section>
          <h4 className="flex items-center gap-1.5 text-sm font-bold text-institucional-deep mb-2">
            <Users2 size={16} /> Top Bairros com Maior Presença
          </h4>
          {municipio.topBairros.length > 0 ? (
            <ul className="space-y-2">
              {municipio.topBairros.map((b) => (
                <li key={b.bairro}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{b.bairro}</span>
                    <span className="text-gray-500">{formatarNumero(b.militantes)} militantes</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-institucional-soft overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-institucional-vibrant to-institucional-deep"
                      style={{ width: `${maiorBairro ? (b.militantes / maiorBairro.militantes) * 100 : 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500">Bairro não informado para os militantes deste município.</p>
          )}
        </section>

        <section>
          <h4 className="flex items-center gap-1.5 text-sm font-bold text-institucional-deep mb-2">
            <ListChecks size={16} /> Registros Individuais no Painel
          </h4>
          <p className="text-xs text-gray-500">
            {municipio.pessoas.length} militante(s) mapeado(s) — veja a tabela abaixo, já filtrada para {municipio.nome}.
          </p>
        </section>
      </div>
    </div>
  )
}
