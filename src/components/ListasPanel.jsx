import { useMemo, useState } from 'react'
import { Users, ListChecks, Eye, X, Search } from 'lucide-react'
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

function ListaModal({ lista, lgpdOn, onClose }) {
  const [busca, setBusca] = useState('')

  const nomesFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return lista.nomes
    return lista.nomes.filter((nome) => nome.toLowerCase().includes(q))
  }, [lista.nomes, busca])

  return (
    <div data-no-print className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-institucional-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-institucional-border">
          <div>
            <h3 className="text-base font-extrabold text-institucional-deep">
              Lista de {lgpdOn ? mascararNome(lista.dono) : capitalizarNome(lista.dono)}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{formatarNumero(lista.total)} pessoa(s) nesta lista</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-institucional-soft flex items-center justify-center text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="relative">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar nome nesta lista..."
              className="w-full text-sm rounded-lg border border-institucional-border pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-institucional-vibrant"
            />
          </div>
        </div>

        <div className="p-5 pt-3 max-h-[60vh] overflow-y-auto">
          <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {nomesFiltrados.map((nome, i) => (
              <li key={i} className="text-gray-700 truncate" title={nome}>
                {lgpdOn ? mascararNome(nome) : capitalizarNome(nome)}
              </li>
            ))}
          </ul>
          {nomesFiltrados.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-6">Nenhum nome encontrado.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ListasPanel({ listasData, lgpdOn }) {
  const { totalPessoas, totalListas, listas } = listasData
  const [listaAberta, setListaAberta] = useState(null)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <KpiCard
          icon={<Users size={20} className="text-institucional-vibrant" />}
          label="Total de Pessoas nas Listas"
          value={formatarNumero(totalPessoas)}
          sub="Somando todas as listas"
          accent={{ bg: 'bg-institucional-soft', text: 'text-institucional-text' }}
        />
        <KpiCard
          icon={<ListChecks size={20} className="text-emerald-600" />}
          label="Listas Cadastradas"
          value={formatarNumero(totalListas)}
          sub="Uma lista por pessoa"
          accent={{ bg: 'bg-emerald-50', text: 'text-emerald-700' }}
        />
      </div>

      <div className="rounded-2xl border border-institucional-border bg-white shadow-card overflow-hidden">
        <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-institucional-border">
          <h3 className="text-base font-extrabold text-institucional-deep">Listas por Pessoa</h3>
          <p className="text-xs text-gray-500 mt-0.5">{formatarNumero(listas.length)} lista(s) encontradas</p>
        </div>

        <ul className="divide-y divide-institucional-border">
          {listas.map((lista) => (
            <li key={lista.id} className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3">
              <p className="font-semibold text-gray-800 truncate min-w-0">
                {lgpdOn ? mascararNome(lista.dono) : capitalizarNome(lista.dono)}
              </p>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-bold text-institucional-deep bg-institucional-soft rounded-full px-3 py-1">
                  {formatarNumero(lista.total)} pessoa{lista.total === 1 ? '' : 's'}
                </span>
                <button
                  onClick={() => setListaAberta(lista)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3 py-1.5 bg-institucional-deep text-white hover:bg-institucional-vibrant transition"
                >
                  <Eye size={14} /> Ver lista
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {listaAberta && <ListaModal lista={listaAberta} lgpdOn={lgpdOn} onClose={() => setListaAberta(null)} />}
    </>
  )
}
