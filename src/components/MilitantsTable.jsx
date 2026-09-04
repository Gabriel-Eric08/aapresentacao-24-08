import { useMemo, useState } from 'react'
import { Search, X, Phone, MapPin } from 'lucide-react'
import { mascararNome, mascararContato, capitalizarNome } from '../utils/helpers'

export default function MilitantsTable({ linhas, lgpdOn, municipioAtivo, onLimparMunicipio, onFocarMunicipio }) {
  const [busca, setBusca] = useState('')
  const [bairro, setBairro] = useState('Todos')

  const bairros = useMemo(() => {
    const unicos = new Set(linhas.map((l) => l.bairro).filter(Boolean))
    return ['Todos', ...Array.from(unicos).sort()]
  }, [linhas])

  const linhasFiltradas = useMemo(() => {
    const buscaLower = busca.trim().toLowerCase()
    return linhas.filter((l) => {
      if (bairro !== 'Todos' && l.bairro !== bairro) return false
      if (buscaLower) {
        const alvo = [l.nome, l.setor, l.municipio, l.bairro].filter(Boolean).join(' ').toLowerCase()
        if (!alvo.includes(buscaLower)) return false
      }
      return true
    })
  }, [linhas, busca, bairro])

  return (
    <div data-no-print className="rounded-2xl border border-institucional-border bg-white shadow-card overflow-hidden">
      <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-institucional-border">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-institucional-deep">
              Detalhamento Individual por Município, Setor e Bairro
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {linhasFiltradas.length} registro(s) encontrados
              {municipioAtivo && (
                <>
                  {' '}· filtrado por <span className="font-semibold text-institucional-text">{municipioAtivo}</span>
                </>
              )}
            </p>
          </div>
          {municipioAtivo && (
            <button
              onClick={onLimparMunicipio}
              className="inline-flex items-center gap-1 text-xs font-semibold text-institucional-text bg-institucional-soft hover:bg-institucional-border rounded-full px-3 py-1.5 transition"
            >
              <X size={13} /> Limpar filtro de município
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, setor ou bairro..."
              className="w-full text-sm rounded-lg border border-institucional-border pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-institucional-vibrant"
            />
          </div>
          <select
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            className="text-sm rounded-lg border border-institucional-border px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-institucional-vibrant"
          >
            {bairros.map((b) => (
              <option key={b} value={b}>{b === 'Todos' ? 'Todos os Bairros' : b}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-institucional-soft text-institucional-text text-xs uppercase tracking-wide">
              <th className="text-left px-3 py-2.5 font-bold">Nome do Militante</th>
              <th className="text-left px-3 py-2.5 font-bold">Setor / Cargo</th>
              <th className="text-left px-3 py-2.5 font-bold">Município</th>
              <th className="text-left px-3 py-2.5 font-bold">Bairro</th>
              <th className="text-left px-3 py-2.5 font-bold">Contato</th>
              <th className="text-left px-3 py-2.5 font-bold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-institucional-border">
            {linhasFiltradas.map((l) => (
              <tr key={l.id} className="hover:bg-institucional-bg transition-colors">
                <td className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap">
                  {lgpdOn ? mascararNome(l.nome) : capitalizarNome(l.nome)}
                </td>
                <td className="px-3 py-2.5 text-gray-600">{l.setor}</td>
                <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{l.municipio}</td>
                <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{l.bairro}</td>
                <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                  {l.contato && (
                    <span className="inline-flex items-center gap-1">
                      <Phone size={12} className="text-institucional-textAlt" />
                      {lgpdOn ? mascararContato(l.contato) : l.contato}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {l.municipioId && (
                    <button
                      onClick={() => onFocarMunicipio(l.municipioId)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-institucional-vibrant hover:text-institucional-deep hover:underline"
                    >
                      <MapPin size={13} /> Ver no mapa
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {linhasFiltradas.length === 0 && (
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
  )
}
