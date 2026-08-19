import { MapPin, Building2, Rocket, Users2, ListChecks } from 'lucide-react'
import DonutChart from './DonutChart.jsx'
import { formatarNumero } from '../utils/helpers'

export default function MunicipalityPanel({ municipio }) {
  if (!municipio) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-institucional-border bg-white/60 p-8">
        <MapPin size={32} className="text-institucional-textAlt mb-2" />
        <p className="font-semibold text-institucional-deep">Selecione um município no mapa</p>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">
          Clique em qualquer ponto do mapa de Pernambuco para visualizar os detalhes de militância e estruturas territoriais.
        </p>
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
          {formatarNumero(municipio.populacaoEstimada)} habitantes (estimativa)
        </p>
      </div>

      <div className="p-4 space-y-5 max-h-[560px] overflow-y-auto">
        <div className="flex items-center justify-center">
          <DonutChart
            percentual={municipio.percentualMilitantes}
            label="Militância no município"
            sublabel={`${formatarNumero(municipio.totalMilitantes)} pessoas mapeadas`}
          />
        </div>

        <section>
          <h4 className="flex items-center gap-1.5 text-sm font-bold text-institucional-deep mb-2">
            <Building2 size={16} /> Estruturas Presentes ({municipio.estruturas.length})
          </h4>
          <ul className="space-y-1.5">
            {municipio.estruturas.map((e) => (
              <li key={e.nome} className="text-xs bg-institucional-soft border border-institucional-border rounded-lg px-2.5 py-1.5">
                <p className="font-semibold text-institucional-text">{e.nome}</p>
                <p className="text-gray-500">{e.tipo} · {e.endereco}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="flex items-center gap-1.5 text-sm font-bold text-institucional-deep mb-2">
            <Rocket size={16} /> Projetos Ativos ({municipio.projetosAtivos.length})
          </h4>
          <ul className="space-y-1.5">
            {municipio.projetosAtivos.map((p) => (
              <li key={p.nome} className="text-xs border border-institucional-border rounded-lg px-2.5 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-800">{p.nome}</p>
                  <span className="shrink-0 text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5">
                    {p.status}
                  </span>
                </div>
                <p className="text-gray-500 mt-0.5">{p.descricao}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="flex items-center gap-1.5 text-sm font-bold text-institucional-deep mb-2">
            <Users2 size={16} /> Top Bairros com Maior Presença
          </h4>
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
        </section>

        <section>
          <h4 className="flex items-center gap-1.5 text-sm font-bold text-institucional-deep mb-2">
            <ListChecks size={16} /> Registros Individuais no Painel
          </h4>
          <p className="text-xs text-gray-500">
            {municipio.pessoas.length} militantes com ficha detalhada nesta amostra — veja a tabela abaixo, já filtrada para {municipio.nome}.
          </p>
        </section>
      </div>
    </div>
  )
}
