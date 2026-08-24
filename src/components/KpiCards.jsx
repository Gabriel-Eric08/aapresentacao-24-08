import { Users, MapPinCheck, Briefcase, MapPin } from 'lucide-react'
import { formatarNumero } from '../utils/helpers'

function KpiCard({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-institucional-border shadow-card hover:shadow-cardHover transition-shadow p-4 flex items-start gap-3 min-w-0">
      <div className={`shrink-0 rounded-xl p-2.5 ${accent.bg}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
        <p className="text-xl sm:text-2xl font-extrabold text-institucional-deep truncate">{value}</p>
        {sub && <p className={`text-xs font-semibold mt-0.5 ${accent.text}`}>{sub}</p>}
      </div>
    </div>
  )
}

export default function KpiCards({ kpis }) {
  const cobertura = Math.round((kpis.coberturaMunicipal.atual / kpis.coberturaMunicipal.total) * 100)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <KpiCard
        icon={<Users size={20} className="text-institucional-vibrant" />}
        label="Total de Militantes"
        value={formatarNumero(kpis.totalMilitantes)}
        sub="Contatos + listagem de voluntárias"
        accent={{ bg: 'bg-institucional-soft', text: 'text-institucional-text' }}
      />
      <KpiCard
        icon={<MapPinCheck size={20} className="text-emerald-600" />}
        label="Cobertura Municipal"
        value={`${kpis.coberturaMunicipal.atual}/${kpis.coberturaMunicipal.total}`}
        sub={`${cobertura}% dos municípios de PE`}
        accent={{ bg: 'bg-emerald-50', text: 'text-emerald-700' }}
      />
      <KpiCard
        icon={<Briefcase size={20} className="text-institucional-vibrant" />}
        label="Setores / Cargos Mapeados"
        value={formatarNumero(kpis.setoresMapeados)}
        sub="Valores distintos identificados"
        accent={{ bg: 'bg-institucional-soft', text: 'text-institucional-text' }}
      />
      <KpiCard
        icon={<MapPin size={20} className="text-institucional-amber" />}
        label="Bairros Mapeados"
        value={formatarNumero(kpis.bairrosMapeados)}
        sub="Bairros distintos identificados"
        accent={{ bg: 'bg-amber-50', text: 'text-amber-700' }}
      />
    </div>
  )
}
