import { useMemo, useState } from 'react'
import { MILITANCIA_DATA } from './data/militanciaData.js'
import { EVENTOS_DATA } from './data/eventosData.js'
import { EMPREENDE_MULHER_DATA } from './data/empreendeMulherData.js'
import { PE_MUNICIPIOS_GEO } from './data/pernambucoMunicipiosGeo.js'
import { SERVICOS_ESSENCIAIS_DATA } from './data/servicosEssenciaisData.js'
import Header from './components/Header.jsx'
import KpiCards from './components/KpiCards.jsx'
import PernambucoMap from './components/PernambucoMap.jsx'
import MunicipalityPanel from './components/MunicipalityPanel.jsx'
import MilitantsTable from './components/MilitantsTable.jsx'
import EventosPanel from './components/EventosPanel.jsx'
import ProgramasPanel from './components/ProgramasPanel.jsx'
import ServicosEssenciaisPanel from './components/ServicosEssenciaisPanel.jsx'
import ComparisonPanel from './components/ComparisonPanel.jsx'
import PrintDossie from './components/PrintDossie.jsx'

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('militancia')
  const [filtroMesorregiao, setFiltroMesorregiao] = useState('Todas')
  const [filtroSetor, setFiltroSetor] = useState('Todos')
  const [busca, setBusca] = useState('')
  const [lgpdOn, setLgpdOn] = useState(false)
  const [selectedMunicipioId, setSelectedMunicipioId] = useState('recife')

  const [compareMode, setCompareMode] = useState(false)
  const [compareIdA, setCompareIdA] = useState(null)
  const [compareIdB, setCompareIdB] = useState(null)

  const { municipios, mesorregioes, setores, kpis, pendencias } = MILITANCIA_DATA
  const linhasPendentes = useMemo(
    () => pendencias.map((p) => ({ ...p, municipioId: null, mesorregiao: null })),
    [pendencias]
  )

  // O mapa cobre os 184 municípios reais de PE; só os municípios com ao
  // menos um militante identificado aparecem em MILITANCIA_DATA — este
  // índice faz a ponte entre os dois.
  const dadosPorId = useMemo(() => new Map(municipios.map((m) => [m.id, m])), [municipios])

  // Municípios que atendem aos filtros globais (mesorregião, setor, busca).
  // Usado para "esmaecer" no mapa e para restringir a tabela.
  const idsVisiveis = useMemo(() => {
    const buscaLower = busca.trim().toLowerCase()
    const set = new Set()
    for (const g of PE_MUNICIPIOS_GEO) {
      if (filtroMesorregiao !== 'Todas' && g.mesorregiao !== filtroMesorregiao) continue
      const dados = dadosPorId.get(g.id)
      if (filtroSetor !== 'Todos' && !dados?.pessoas.some((p) => p.setor === filtroSetor)) continue
      if (buscaLower) {
        const nomeBate = g.nome.toLowerCase().includes(buscaLower)
        const bairroBate = dados?.topBairros.some((b) => b.bairro.toLowerCase().includes(buscaLower))
        const pessoaBate = dados?.pessoas.some((p) => p.nome.toLowerCase().includes(buscaLower))
        if (!nomeBate && !bairroBate && !pessoaBate) continue
      }
      set.add(g.id)
    }
    return set
  }, [dadosPorId, filtroMesorregiao, filtroSetor, busca])

  const municipioGeoSelecionado = useMemo(
    () => PE_MUNICIPIOS_GEO.find((g) => g.id === selectedMunicipioId) ?? null,
    [selectedMunicipioId]
  )
  const municipioSelecionado = selectedMunicipioId ? dadosPorId.get(selectedMunicipioId) ?? null : null

  // Linhas da tabela: todas as pessoas dos municípios visíveis (e com ficha
  // detalhada), respeitando o filtro de setor global e o município
  // selecionado no mapa.
  const linhasTabela = useMemo(() => {
    const base = selectedMunicipioId
      ? municipios.filter((m) => m.id === selectedMunicipioId)
      : municipios.filter((m) => idsVisiveis.has(m.id))

    const linhasMunicipios = base.flatMap((m) =>
      m.pessoas
        .filter((p) => filtroSetor === 'Todos' || p.setor === filtroSetor)
        .map((p) => ({ ...p, municipio: m.nome, municipioId: m.id, mesorregiao: m.mesorregiao }))
    )

    // Pessoas sem município identificado só entram na listagem geral (sem
    // filtro de município/mesorregião/setor específico) e sempre no final.
    if (selectedMunicipioId || filtroMesorregiao !== 'Todas' || filtroSetor !== 'Todos') {
      return linhasMunicipios
    }
    const buscaLower = busca.trim().toLowerCase()
    const pendentesFiltrados = buscaLower
      ? linhasPendentes.filter((p) => p.nome.toLowerCase().includes(buscaLower))
      : linhasPendentes

    return [...linhasMunicipios, ...pendentesFiltrados]
  }, [municipios, idsVisiveis, selectedMunicipioId, filtroMesorregiao, filtroSetor, busca, linhasPendentes])

  function handleSelecionarMunicipio(id) {
    if (compareMode) {
      if (compareIdA === id) return setCompareIdA(null)
      if (compareIdB === id) return setCompareIdB(null)
      if (!compareIdA) return setCompareIdA(id)
      if (!compareIdB) return setCompareIdB(id)
      setCompareIdA(id)
      setCompareIdB(null)
      return
    }
    setSelectedMunicipioId((atual) => (atual === id ? null : id))
  }

  function handleExportar() {
    window.print()
  }

  const municipioA = useMemo(() => municipios.find((m) => m.id === compareIdA) ?? null, [municipios, compareIdA])
  const municipioB = useMemo(() => municipios.find((m) => m.id === compareIdB) ?? null, [municipios, compareIdB])

  // Regiões de Desenvolvimento (RD) — cada uma tem uma Coordenadora Regional
  // própria. Derivado da própria base (setor "Coordenadora Regional ..."),
  // não de uma lista separada, pra nunca ficar desatualizado.
  const coordenadorasRegionais = useMemo(() => {
    return municipios
      .flatMap((m) =>
        m.pessoas
          .filter((p) => p.setor?.startsWith('Coordenadora Regional'))
          .map((p) => ({ regiao: p.setor, nome: p.nome, municipioId: m.id, municipioNome: m.nome }))
      )
      .sort((a, b) => a.regiao.localeCompare(b.regiao, 'pt-BR'))
  }, [municipios])

  return (
    <div className="min-h-screen bg-institucional-bg">
      <div data-no-print>
        <Header
          mesorregioes={mesorregioes}
          setores={setores}
          filtroMesorregiao={filtroMesorregiao}
          setFiltroMesorregiao={setFiltroMesorregiao}
          filtroSetor={filtroSetor}
          setFiltroSetor={setFiltroSetor}
          busca={busca}
          setBusca={setBusca}
          lgpdOn={lgpdOn}
          setLgpdOn={setLgpdOn}
          compareMode={compareMode}
          setCompareMode={setCompareMode}
          onExportar={handleExportar}
          abaAtiva={abaAtiva}
          setAbaAtiva={setAbaAtiva}
          coordenadorasRegionais={coordenadorasRegionais}
          filtroRd={selectedMunicipioId}
          setFiltroRd={(id) => setSelectedMunicipioId(id)}
        />

        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-5">
          {abaAtiva === 'militancia' ? (
            <>
              <KpiCards kpis={kpis} />

              <div className="grid lg:grid-cols-[65%_35%] gap-5 items-start">
                <div className="rounded-2xl border border-institucional-border bg-white shadow-card p-4">
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <h2 className="text-base font-extrabold text-institucional-deep">
                      Mapa Interativo de Pernambuco — Presença Territorial
                    </h2>
                    <div className="flex items-center gap-2">
                      {compareMode && (
                        <span className="text-xs font-semibold text-institucional-amber bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                          Modo comparação: clique em 2 municípios
                        </span>
                      )}
                      <select
                        value={selectedMunicipioId ?? 'Todos'}
                        onChange={(e) => setSelectedMunicipioId(e.target.value === 'Todos' ? null : e.target.value)}
                        className="text-sm rounded-lg border border-institucional-border px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-institucional-vibrant"
                      >
                        <option value="Todos">Todos os Municípios</option>
                        {municipios.map((m) => (
                          <option key={m.id} value={m.id}>{m.nome} ({m.totalMilitantes})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <PernambucoMap
                    dadosPorId={dadosPorId}
                    idsVisiveis={idsVisiveis}
                    selectedId={selectedMunicipioId}
                    onSelect={handleSelecionarMunicipio}
                    compareMode={compareMode}
                    compareIds={[compareIdA, compareIdB].filter(Boolean)}
                  />
                </div>

                <MunicipalityPanel municipio={municipioSelecionado} municipioGeo={municipioGeoSelecionado} />
              </div>

              <MilitantsTable
                linhas={linhasTabela}
                lgpdOn={lgpdOn}
                municipioAtivo={municipioGeoSelecionado?.nome ?? null}
                onLimparMunicipio={() => setSelectedMunicipioId(null)}
                onFocarMunicipio={(id) => setSelectedMunicipioId(id)}
              />
            </>
          ) : abaAtiva === 'servicos-essenciais' ? (
            <ServicosEssenciaisPanel servicosEssenciais={SERVICOS_ESSENCIAIS_DATA} lgpdOn={lgpdOn} />
          ) : abaAtiva === 'dados' ? (
            <EventosPanel
              eventos={EVENTOS_DATA.eventos}
              totalParticipacoes={EVENTOS_DATA.totalParticipacoes}
              totalEmpreendedoras={EMPREENDE_MULHER_DATA.totalCadastradas}
              lgpdOn={lgpdOn}
            />
          ) : (
            <ProgramasPanel empreendeMulher={EMPREENDE_MULHER_DATA} lgpdOn={lgpdOn} />
          )}
        </main>

        <footer className="text-center text-xs text-gray-400 py-6">
          SecMulher-PE · Painel de Mapeamento de Militância — {MILITANCIA_DATA.metadata.modo === 'demonstrativo' ? 'Base de dados demonstrativa' : 'Base de dados oficial'} · Atualizado em {MILITANCIA_DATA.metadata.ultimaAtualizacao.split('-').reverse().join('/')}
        </footer>
      </div>

      {compareMode && (
        <ComparisonPanel
          municipios={municipios}
          municipioA={municipioA}
          municipioB={municipioB}
          idA={compareIdA}
          idB={compareIdB}
          setIdA={setCompareIdA}
          setIdB={setCompareIdB}
          onClose={() => setCompareMode(false)}
        />
      )}

      <PrintDossie municipio={municipioSelecionado} kpis={kpis} />
    </div>
  )
}
