import { X, Building2, Rocket, Users } from 'lucide-react'
import DonutChart from './DonutChart.jsx'
import { formatarNumero } from '../utils/helpers'

function Coluna({ municipio }) {
  if (!municipio) {
    return (
      <div className="flex-1 min-w-[220px] rounded-xl border border-dashed border-institucional-border p-6 flex items-center justify-center text-sm text-gray-400 text-center">
        Selecione um município para comparar
      </div>
    )
  }
  return (
    <div className="flex-1 min-w-[220px] rounded-xl border border-institucional-border overflow-hidden">
      <div className="bg-gradient-to-br from-institucional-deep to-institucional-vibrant text-white px-4 py-3">
        <p className="text-[11px] uppercase tracking-wide text-purple-200 font-semibold">{municipio.mesorregiao}</p>
        <h4 className="font-extrabold">{municipio.nome}</h4>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex justify-center"><DonutChart percentual={municipio.percentualMilitantes} size={128} strokeWidth={14} /></div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-institucional-soft py-2">
            <p className="text-lg font-extrabold text-institucional-deep">{formatarNumero(municipio.totalMilitantes)}</p>
            <p className="text-[11px] text-gray-500">Militantes</p>
          </div>
          <div className="rounded-lg bg-emerald-50 py-2">
            <p className="text-lg font-extrabold text-emerald-700">{municipio.estruturas.length}</p>
            <p className="text-[11px] text-gray-500">Estruturas</p>
          </div>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold text-institucional-deep mb-1.5"><Building2 size={13} /> Estruturas</p>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            {municipio.estruturas.map((e) => <li key={e.nome}>{e.nome}</li>)}
          </ul>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold text-institucional-deep mb-1.5"><Rocket size={13} /> Projetos Ativos</p>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            {municipio.projetosAtivos.map((p) => <li key={p.nome}>{p.nome}</li>)}
          </ul>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold text-institucional-deep mb-1.5"><Users size={13} /> População Estimada</p>
          <p className="text-xs text-gray-600">{formatarNumero(municipio.populacaoEstimada)} habitantes</p>
        </div>
      </div>
    </div>
  )
}

export default function ComparisonPanel({ municipios, municipioA, municipioB, idA, idB, setIdA, setIdB, onClose }) {
  return (
    <div data-no-print className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-institucional-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-institucional-border">
          <h3 className="text-base font-extrabold text-institucional-deep">Comparativo de Municípios</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-institucional-soft flex items-center justify-center text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-4 flex flex-wrap gap-3">
          <select
            value={idA ?? ''}
            onChange={(e) => setIdA(e.target.value || null)}
            className="flex-1 min-w-[220px] text-sm rounded-lg border border-institucional-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-institucional-vibrant"
          >
            <option value="">Município A — selecione...</option>
            {municipios.map((m) => <option key={m.id} value={m.id}>{m.nome} ({m.mesorregiao})</option>)}
          </select>
          <select
            value={idB ?? ''}
            onChange={(e) => setIdB(e.target.value || null)}
            className="flex-1 min-w-[220px] text-sm rounded-lg border border-institucional-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-institucional-vibrant"
          >
            <option value="">Município B — selecione...</option>
            {municipios.map((m) => <option key={m.id} value={m.id}>{m.nome} ({m.mesorregiao})</option>)}
          </select>
        </div>

        <div className="p-5 flex flex-wrap gap-4">
          <Coluna municipio={municipioA} />
          <Coluna municipio={municipioB} />
        </div>
      </div>
    </div>
  )
}
