import { useMemo, useState } from 'react'
import { Store, Search, MapPin, Phone, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatarNumero, formatarData, mascararNome, mascararContato } from '../utils/helpers'

const POR_PAGINA = 25

export default function ProgramasPanel({ empreendeMulher, lgpdOn }) {
  const { totalCadastradas, porMunicipio, segmentos, cadastradas } = empreendeMulher

  const [busca, setBusca] = useState('')
  const [municipioId, setMunicipioId] = useState('Todos')
  const [segmento, setSegmento] = useState('Todos')
  const [pagina, setPagina] = useState(1)

  const cadastradasFiltradas = useMemo(() => {
    const buscaLower = busca.trim().toLowerCase()
    return cadastradas.filter((c) => {
      if (municipioId !== 'Todos' && c.municipioId !== municipioId) return false
      if (segmento !== 'Todos' && c.segmento !== segmento) return false
      if (buscaLower) {
        const alvo = [c.nome, c.municipioNome, c.segmento].filter(Boolean).join(' ').toLowerCase()
        if (!alvo.includes(buscaLower)) return false
      }
      return true
    })
  }, [cadastradas, busca, municipioId, segmento])

  const totalPaginas = Math.max(1, Math.ceil(cadastradasFiltradas.length / POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const cadastradasPagina = cadastradasFiltradas.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA)

  function atualizarFiltro(fn) {
    fn()
    setPagina(1)
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-institucional-border shadow-card p-4 flex items-center gap-3.5">
        <div className="shrink-0 rounded-xl p-3 bg-amber-50">
          <Store size={24} className="text-institucional-amber" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Empreende Mulher — Total de Cadastradas</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-institucional-deep">{formatarNumero(totalCadastradas)}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {porMunicipio.length} município(s) identificados · {segmentos.length} segmento(s) informados
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-institucional-border bg-white shadow-card overflow-hidden">
        <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-institucional-border">
          <h3 className="text-base font-extrabold text-institucional-deep">Cadastros do Programa Empreende Mulher</h3>
          <p className="text-xs text-gray-500 mt-0.5">{formatarNumero(cadastradasFiltradas.length)} registro(s) encontrados</p>

          <div className="flex flex-wrap gap-2 mt-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={busca}
                onChange={(e) => atualizarFiltro(() => setBusca(e.target.value))}
                placeholder="Buscar por nome, município ou segmento..."
                className="w-full text-sm rounded-lg border border-institucional-border pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-institucional-vibrant"
              />
            </div>
            <select
              value={municipioId}
              onChange={(e) => atualizarFiltro(() => setMunicipioId(e.target.value))}
              className="text-sm rounded-lg border border-institucional-border px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-institucional-vibrant"
            >
              <option value="Todos">Todos os Municípios</option>
              {porMunicipio.map((m) => (
                <option key={m.municipioId} value={m.municipioId}>
                  {m.municipioNome} ({m.total})
                </option>
              ))}
            </select>
            <select
              value={segmento}
              onChange={(e) => atualizarFiltro(() => setSegmento(e.target.value))}
              className="text-sm rounded-lg border border-institucional-border px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-institucional-vibrant"
            >
              <option value="Todos">Todos os Segmentos</option>
              {segmentos.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-institucional-soft text-institucional-text text-xs uppercase tracking-wide">
                <th className="text-left px-3 py-2.5 font-bold">Nome</th>
                <th className="text-left px-3 py-2.5 font-bold">Município</th>
                <th className="text-left px-3 py-2.5 font-bold">Segmento</th>
                <th className="text-left px-3 py-2.5 font-bold">Contato</th>
                <th className="text-left px-3 py-2.5 font-bold">Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-institucional-border">
              {cadastradasPagina.map((c) => (
                <tr key={c.id} className="hover:bg-institucional-bg transition-colors">
                  <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">
                    {lgpdOn ? mascararNome(c.nome) : c.nome}
                  </td>
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                    {c.municipioNome && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} className="text-institucional-textAlt" /> {c.municipioNome}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{c.segmento}</td>
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                    {c.contato && (
                      <span className="inline-flex items-center gap-1">
                        <Phone size={12} className="text-institucional-textAlt" />
                        {lgpdOn ? mascararContato(c.contato) : c.contato}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{formatarData(c.dataCadastro)}</td>
                </tr>
              ))}
              {cadastradasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-sm text-gray-400 py-10">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-institucional-border">
            <p className="text-xs text-gray-500">Página {paginaAtual} de {totalPaginas}</p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-institucional-border text-institucional-text disabled:opacity-30 hover:bg-institucional-soft transition"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-institucional-border text-institucional-text disabled:opacity-30 hover:bg-institucional-soft transition"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
