import { useMemo, useState } from 'react'
import { MOCK_DATA } from './data/mockData.js'
import Header from './components/Header.jsx'
import KpiCards from './components/KpiCards.jsx'
import PernambucoMap from './components/PernambucoMap.jsx'
import MunicipalityPanel from './components/MunicipalityPanel.jsx'
import MilitantsTable from './components/MilitantsTable.jsx'
import ComparisonPanel from './components/ComparisonPanel.jsx'
import PrintDossie from './components/PrintDossie.jsx'

export default function App() {
  const [filtroMesorregiao, setFiltroMesorregiao] = useState('Todas')
  const [filtroSetor, setFiltroSetor] = useState('Todos')
  const [busca, setBusca] = useState('')
  const [lgpdOn, setLgpdOn] = useState(false)
  const [selectedMunicipioId, setSelectedMunicipioId] = useState(null)

  const [compareMode, setCompareMode] = useState(false)
  const [compareIdA, setCompareIdA] = useState(null)
  const [compareIdB, setCompareIdB] = useState(null)

  const { municipios, mesorregioes, setores, kpis } = MOCK_DATA

  // Municípios que atendem aos filtros globais (mesorregião, setor, busca).
  // Usado para "esmaecer" no mapa e para restringir a tabela.
  const idsVisiveis = useMemo(() => {
    const buscaLower = busca.trim().toLowerCase()
    const set = new Set()
    for (const m of municipios) {
      if (filtroMesorregiao !== 'Todas' && m.mesorregiao !== filtroMesorregiao) continue
      if (filtroSetor !== 'Todos' && !m.pessoas.some((p) => p.setor === filtroSetor)) continue
      if (buscaLower) {
        const nomeBate = m.nome.toLowerCase().includes(buscaLower)
        const bairroBate = m.topBairros.some((b) => b.bairro.toLowerCase().includes(buscaLower))
        const pessoaBate = m.pessoas.some((p) => p.nome.toLowerCase().includes(buscaLower))
        if (!nomeBate && !bairroBate && !pessoaBate) continue
      }
      set.add(m.id)
    }
    return set
  }, [municipios, filtroMesorregiao, filtroSetor, busca])

  const municipioSelecionado = useMemo(
    () => municipios.find((m) => m.id === selectedMunicipioId) ?? null,
    [municipios, selectedMunicipioId]
  )

  // Linhas da tabela: todas as pessoas dos municípios visíveis, respeitando
  // também o filtro de setor global e o município selecionado no mapa.
  const linhasTabela = useMemo(() => {
    const base = selectedMunicipioId
      ? municipios.filter((m) => m.id === selectedMunicipioId)
      : municipios.filter((m) => idsVisiveis.has(m.id))

    return base.flatMap((m) =>
      m.pessoas
        .filter((p) => filtroSetor === 'Todos' || p.setor === filtroSetor)
        .map((p) => ({ ...p, municipio: m.nome, municipioId: m.id, mesorregiao: m.mesorregiao }))
    )
  }, [municipios, idsVisiveis, selectedMunicipioId, filtroSetor])

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
        />

        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-5">
          <KpiCards kpis={kpis} />

          <div className="grid lg:grid-cols-[65%_35%] gap-5 items-start">
            <div className="rounded-2xl border border-institucional-border bg-white shadow-card p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-extrabold text-institucional-deep">
                  Mapa Interativo de Pernambuco — Presença Territorial
                </h2>
                {compareMode && (
                  <span className="text-xs font-semibold text-institucional-amber bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                    Modo comparação: clique em 2 municípios
                  </span>
                )}
              </div>
              <PernambucoMap
                municipios={municipios}
                idsVisiveis={idsVisiveis}
                selectedId={selectedMunicipioId}
                onSelect={handleSelecionarMunicipio}
                compareMode={compareMode}
                compareIds={[compareIdA, compareIdB].filter(Boolean)}
              />
            </div>

            <MunicipalityPanel municipio={municipioSelecionado} />
          </div>

          <MilitantsTable
            linhas={linhasTabela}
            lgpdOn={lgpdOn}
            municipioAtivo={municipioSelecionado?.nome ?? null}
            onLimparMunicipio={() => setSelectedMunicipioId(null)}
            onFocarMunicipio={(id) => setSelectedMunicipioId(id)}
          />
        </main>

        <footer className="text-center text-xs text-gray-400 py-6">
          SecMulher-PE · Painel de Mapeamento de Militância — {MOCK_DATA.metadata.modo === 'demonstrativo' ? 'Base de dados demonstrativa' : 'Base de dados oficial'} · Atualizado em {MOCK_DATA.metadata.ultimaAtualizacao.split('-').reverse().join('/')}
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
