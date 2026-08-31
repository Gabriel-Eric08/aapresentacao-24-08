import { Search, FileDown, ShieldCheck, ShieldOff, GitCompare, Sparkles, Users2, ClipboardList, Store, Home, ListChecks } from 'lucide-react'

// Abas ocultas temporariamente a pedido — troque pra true quando precisar
// mostrar de novo.
const MOSTRAR_ABA_DADOS = true
const MOSTRAR_ABA_PROGRAMAS = true

export default function Header({
  mesorregioes,
  setores,
  filtroMesorregiao,
  setFiltroMesorregiao,
  filtroSetor,
  setFiltroSetor,
  busca,
  setBusca,
  lgpdOn,
  setLgpdOn,
  compareMode,
  setCompareMode,
  onExportar,
  abaAtiva,
  setAbaAtiva,
  coordenadorasRegionais,
  filtroRd,
  setFiltroRd,
}) {
  return (
    <header data-no-print className="sticky top-0 z-30 bg-gradient-to-r from-institucional-deep to-institucional-vibrant text-white shadow-lg">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-purple-200 font-semibold">
              Governo de Pernambuco · Secretaria da Mulher (SecMulher-PE)
            </p>
            <h1 className="text-lg sm:text-2xl font-extrabold leading-tight">
              Painel de Mapeamento de Militância e Ações Territoriais
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold bg-institucional-amber/20 text-amber-100 border border-amber-300/40 rounded-full px-3 py-1.5">
              <Sparkles size={13} />
              Base de Dados Real — SecMulher-PE
            </span>
            {abaAtiva === 'militancia' && (
              <button
                onClick={() => setCompareMode((v) => !v)}
                className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold rounded-lg px-3 py-2 border transition ${
                  compareMode
                    ? 'bg-institucional-amber text-white border-institucional-amber'
                    : 'bg-white/10 text-white border-white/25 hover:bg-white/20'
                }`}
              >
                <GitCompare size={16} />
                Comparar Municípios
              </button>
            )}
            <button
              onClick={() => setLgpdOn((v) => !v)}
              className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold rounded-lg px-3 py-2 border transition ${
                lgpdOn
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : 'bg-white/10 text-white border-white/25 hover:bg-white/20'
              }`}
              title="Alternar visão LGPD (oculta nomes completos)"
            >
              {lgpdOn ? <ShieldCheck size={16} /> : <ShieldOff size={16} />}
              {lgpdOn ? 'LGPD: Nomes Ocultos' : 'Visão LGPD'}
            </button>
            <button
              onClick={onExportar}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold rounded-lg px-3 py-2 bg-institucional-amber hover:bg-amber-500 text-white shadow transition"
            >
              <FileDown size={16} />
              Exportar Relatório (PDF)
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <button
            onClick={() => setAbaAtiva('militancia')}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3.5 py-1.5 transition ${
              abaAtiva === 'militancia'
                ? 'bg-white text-institucional-deep'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Users2 size={15} /> Militância
          </button>
          <button
            onClick={() => setAbaAtiva('servicos-essenciais')}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3.5 py-1.5 transition ${
              abaAtiva === 'servicos-essenciais'
                ? 'bg-white text-institucional-deep'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Home size={15} /> Militância Serv. Essenciais
          </button>
          <button
            onClick={() => setAbaAtiva('listas')}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3.5 py-1.5 transition ${
              abaAtiva === 'listas'
                ? 'bg-white text-institucional-deep'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <ListChecks size={15} /> Listas
          </button>
          {MOSTRAR_ABA_DADOS && (
          <button
            onClick={() => setAbaAtiva('dados')}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3.5 py-1.5 transition ${
              abaAtiva === 'dados'
                ? 'bg-white text-institucional-deep'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <ClipboardList size={15} /> Dados
          </button>
          )}
          {MOSTRAR_ABA_PROGRAMAS && (
          <button
            onClick={() => setAbaAtiva('programas')}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3.5 py-1.5 transition ${
              abaAtiva === 'programas'
                ? 'bg-white text-institucional-deep'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Store size={15} /> Programas
          </button>
          )}
        </div>

        {abaAtiva === 'militancia' && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={filtroMesorregiao}
            onChange={(e) => setFiltroMesorregiao(e.target.value)}
            className="text-sm rounded-lg border border-white/25 bg-white/10 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-institucional-amber [&>option]:text-gray-900"
          >
            <option value="Todas">Todas as Mesorregiões</option>
            {mesorregioes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {coordenadorasRegionais?.length > 0 && (
            <select
              value={filtroRd ?? ''}
              onChange={(e) => setFiltroRd(e.target.value || null)}
              className="text-sm rounded-lg border border-white/25 bg-white/10 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-institucional-amber [&>option]:text-gray-900"
            >
              <option value="">Todas as RDs (Região de Desenvolvimento)</option>
              {coordenadorasRegionais.map((c) => (
                <option key={c.municipioId} value={c.municipioId}>
                  {c.regiao.replace('Coordenadora Regional ', '')} — {c.nome}
                </option>
              ))}
            </select>
          )}

          <select
            value={filtroSetor}
            onChange={(e) => setFiltroSetor(e.target.value)}
            className="text-sm rounded-lg border border-white/25 bg-white/10 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-institucional-amber [&>option]:text-gray-900"
          >
            <option value="Todos">Todos os Setores / Secretarias</option>
            {setores.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-200" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Busca global: município, bairro ou militante..."
              className="w-full text-sm rounded-lg border border-white/25 bg-white/10 placeholder:text-purple-200 text-white pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-institucional-amber"
            />
          </div>
        </div>
        )}
      </div>
    </header>
  )
}
