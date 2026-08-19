import { Fragment, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Search, X, Phone, StickyNote, CalendarClock, Rocket, MapPin } from 'lucide-react'
import { mascararNome, mascararContato, nivelEngajamento, CORES_ENGAJAMENTO } from '../utils/helpers'

export default function MilitantsTable({ linhas, lgpdOn, municipioAtivo, onLimparMunicipio, onFocarMunicipio }) {
  const [busca, setBusca] = useState('')
  const [bairro, setBairro] = useState('Todos')
  const [engajamento, setEngajamento] = useState('Todos')
  const [expandidos, setExpandidos] = useState(new Set())

  const bairros = useMemo(() => {
    const unicos = new Set(linhas.map((l) => l.bairro))
    return ['Todos', ...Array.from(unicos).sort()]
  }, [linhas])

  const linhasFiltradas = useMemo(() => {
    const buscaLower = busca.trim().toLowerCase()
    return linhas.filter((l) => {
      const nivel = nivelEngajamento(l.engajamento)
      if (bairro !== 'Todos' && l.bairro !== bairro) return false
      if (engajamento !== 'Todos' && nivel !== engajamento) return false
      if (buscaLower) {
        const alvo = `${l.nome} ${l.setor} ${l.municipio} ${l.bairro}`.toLowerCase()
        if (!alvo.includes(buscaLower)) return false
      }
      return true
    })
  }, [linhas, busca, bairro, engajamento])

  function alternarExpandido(id) {
    setExpandidos((prev) => {
      const novo = new Set(prev)
      novo.has(id) ? novo.delete(id) : novo.add(id)
      return novo
    })
  }

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
          <select
            value={engajamento}
            onChange={(e) => setEngajamento(e.target.value)}
            className="text-sm rounded-lg border border-institucional-border px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-institucional-vibrant"
          >
            <option value="Todos">Todo Engajamento</option>
            <option value="Alto">Alto</option>
            <option value="Médio">Médio</option>
            <option value="Baixo">Baixo</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-institucional-soft text-institucional-text text-xs uppercase tracking-wide">
              <th className="w-10 px-3 py-2.5"></th>
              <th className="text-left px-3 py-2.5 font-bold">Nome do Militante</th>
              <th className="text-left px-3 py-2.5 font-bold">Setor / Órgão</th>
              <th className="text-left px-3 py-2.5 font-bold">Município</th>
              <th className="text-left px-3 py-2.5 font-bold">Bairro</th>
              <th className="text-left px-3 py-2.5 font-bold">Engajamento</th>
              <th className="text-left px-3 py-2.5 font-bold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-institucional-border">
            {linhasFiltradas.map((l) => {
              const aberto = expandidos.has(l.id)
              const nivel = nivelEngajamento(l.engajamento)
              const cores = CORES_ENGAJAMENTO[nivel]
              return (
                <Fragment key={l.id}>
                  <tr className={`hover:bg-institucional-bg transition-colors ${aberto ? 'bg-institucional-bg' : ''}`}>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => alternarExpandido(l.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-institucional-soft text-institucional-vibrant hover:bg-institucional-border transition"
                        aria-label="Expandir"
                      >
                        {aberto ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap">
                      {lgpdOn ? mascararNome(l.nome) : l.nome}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">{l.setor}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{l.municipio}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{l.bairro}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 border ${cores.texto} ${cores.fundo} ${cores.borda}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cores.ponto}`} />
                        {nivel} · {l.engajamento}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => onFocarMunicipio(l.municipioId)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-institucional-vibrant hover:text-institucional-deep hover:underline"
                      >
                        <MapPin size={13} /> Ver no mapa
                      </button>
                    </td>
                  </tr>
                  {aberto && (
                    <tr>
                      <td colSpan={7} className="px-3 pb-4 pt-1 bg-institucional-bg">
                        <div className="grid sm:grid-cols-3 gap-3 rounded-xl border border-institucional-border bg-white p-4">
                          <div>
                            <p className="flex items-center gap-1.5 text-xs font-bold text-institucional-deep mb-1.5">
                              <CalendarClock size={14} /> Histórico de Participação
                            </p>
                            <ul className="space-y-1 text-xs text-gray-600 list-disc list-inside">
                              {l.historico.map((h, i) => <li key={i}>{h}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="flex items-center gap-1.5 text-xs font-bold text-institucional-deep mb-1.5">
                              <Rocket size={14} /> Projetos de Empreendedorismo
                            </p>
                            <ul className="space-y-1 text-xs text-gray-600 list-disc list-inside">
                              {l.projetosVinculados.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="flex items-center gap-1.5 text-xs font-bold text-institucional-deep mb-1.5">
                              <Phone size={14} /> Contato
                            </p>
                            <p className="text-xs text-gray-600 mb-2">{lgpdOn ? mascararContato(l.contato) : l.contato}</p>
                            <p className="flex items-center gap-1.5 text-xs font-bold text-institucional-deep mb-1.5">
                              <StickyNote size={14} /> Anotações do Articulador
                            </p>
                            <p className="text-xs text-gray-600 italic">"{l.anotacoes}"</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
            {linhasFiltradas.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-sm text-gray-400 py-10">
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
