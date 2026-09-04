import { useMemo, useState } from 'react'
import { Users, Home, Briefcase, Search, Building2 } from 'lucide-react'
import { formatarNumero, mascararNome, capitalizarNome } from '../utils/helpers'

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

export default function ServicosEssenciaisPanel({ servicosEssenciais, lgpdOn }) {
  const { kpis, unidades } = servicosEssenciais

  const [unidadeId, setUnidadeId] = useState('Todas')
  const [cargo, setCargo] = useState('Todos')
  const [busca, setBusca] = useState('')

  const cargos = useMemo(() => {
    const unicos = new Set()
    for (const u of unidades) for (const p of u.pessoas) if (p.cargo) unicos.add(p.cargo)
    return Array.from(unicos).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [unidades])

  const pessoasFiltradas = useMemo(() => {
    const buscaLower = busca.trim().toLowerCase()
    const base = unidadeId === 'Todas' ? unidades : unidades.filter((u) => u.id === unidadeId)
    return base.flatMap((u) =>
      u.pessoas
        .filter((p) => cargo === 'Todos' || p.cargo === cargo)
        .filter((p) => {
          if (!buscaLower) return true
          const alvo = [p.nome, p.cargo, p.unidade, p.empresaContratada].filter(Boolean).join(' ').toLowerCase()
          return alvo.includes(buscaLower)
        })
        .map((p) => ({ ...p, unidadeNome: u.nome }))
    )
  }, [unidades, unidadeId, cargo, busca])

  const unidadeAtiva = unidadeId === 'Todas' ? null : unidades.find((u) => u.id === unidadeId) ?? null

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <KpiCard
          icon={<Users size={20} className="text-institucional-vibrant" />}
          label="Total de Funcionários"
          value={formatarNumero(kpis.totalFuncionarios)}
          sub="Casas Abrigo, Casa Passagem e Abrigamento"
          accent={{ bg: 'bg-institucional-soft', text: 'text-institucional-text' }}
        />
        <KpiCard
          icon={<Home size={20} className="text-emerald-600" />}
          label="Unidades Mapeadas"
          value={formatarNumero(kpis.totalUnidades)}
          sub="Casas Abrigo / unidades distintas"
          accent={{ bg: 'bg-emerald-50', text: 'text-emerald-700' }}
        />
        <KpiCard
          icon={<Briefcase size={20} className="text-institucional-amber" />}
          label="Cargos Distintos"
          value={formatarNumero(kpis.cargosDistintos)}
          sub="Funções identificadas"
          accent={{ bg: 'bg-amber-50', text: 'text-amber-700' }}
        />
      </div>

      <div className="rounded-2xl border border-institucional-border bg-white shadow-card p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-extrabold text-institucional-deep">
            Unidades de Acolhimento — clique para filtrar
          </h2>
          <span className="text-xs text-gray-500">
            Alguns nomes de unidade são código (sigilo de endereço de casa abrigo)
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setUnidadeId('Todas')}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3.5 py-1.5 transition ${
              unidadeId === 'Todas'
                ? 'bg-institucional-deep text-white'
                : 'bg-institucional-soft text-institucional-text hover:bg-institucional-border'
            }`}
          >
            <Building2 size={14} /> Todas as Unidades ({kpis.totalFuncionarios})
          </button>
          {unidades.map((u) => (
            <button
              key={u.id}
              onClick={() => setUnidadeId((atual) => (atual === u.id ? 'Todas' : u.id))}
              className={`inline-flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3.5 py-1.5 transition ${
                unidadeId === u.id
                  ? 'bg-institucional-deep text-white'
                  : 'bg-institucional-soft text-institucional-text hover:bg-institucional-border'
              }`}
            >
              {u.nome} ({u.totalFuncionarios})
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-institucional-border bg-white shadow-card overflow-hidden">
        <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-institucional-border">
          <div>
            <h3 className="text-base font-extrabold text-institucional-deep">
              Detalhamento Individual — Serviços Essenciais
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatarNumero(pessoasFiltradas.length)} registro(s) encontrados
              {unidadeAtiva && (
                <>
                  {' '}· filtrado por <span className="font-semibold text-institucional-text">{unidadeAtiva.nome}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome, cargo ou empresa..."
                className="w-full text-sm rounded-lg border border-institucional-border pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-institucional-vibrant"
              />
            </div>
            <select
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="text-sm rounded-lg border border-institucional-border px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-institucional-vibrant"
            >
              <option value="Todos">Todos os Cargos</option>
              {cargos.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-institucional-soft text-institucional-text text-xs uppercase tracking-wide">
                <th className="text-left px-3 py-2.5 font-bold">Nome</th>
                <th className="text-left px-3 py-2.5 font-bold">Cargo</th>
                <th className="text-left px-3 py-2.5 font-bold">Unidade (Casa Abrigo)</th>
                <th className="text-left px-3 py-2.5 font-bold">Empresa Contratada</th>
                <th className="text-left px-3 py-2.5 font-bold">Admissão</th>
                <th className="text-left px-3 py-2.5 font-bold">Turno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-institucional-border">
              {pessoasFiltradas.map((p) => (
                <tr key={p.id} className="hover:bg-institucional-bg transition-colors">
                  <td className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap">
                    {lgpdOn ? mascararNome(p.nome) : capitalizarNome(p.nome)}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{p.cargo}</td>
                  <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{p.unidadeNome}</td>
                  <td className="px-3 py-2.5 text-gray-600">{p.empresaContratada}</td>
                  <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{p.admissao || '—'}</td>
                  <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{p.turno || '—'}</td>
                </tr>
              ))}
              {pessoasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-sm text-gray-400 py-10">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
