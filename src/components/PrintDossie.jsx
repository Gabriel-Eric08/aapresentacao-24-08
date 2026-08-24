import { formatarNumero } from '../utils/helpers'

// Dossiê de impressão de página única — visível somente no fluxo de
// impressão (ver regras `print:` e `data-print-dossie` em src/index.css).
export default function PrintDossie({ municipio, kpis }) {
  const dataEmissao = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div data-print-dossie className="hidden print:block text-black">
      <div className="flex items-center justify-between border-b-4 border-institucional-deep pb-3 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            Governo de Pernambuco · Secretaria da Mulher (SecMulher-PE)
          </p>
          <h1 className="text-xl font-extrabold text-institucional-deep">
            Dossiê Resumido — Mapeamento de Militância
          </h1>
        </div>
        <p className="text-xs text-gray-500">Emitido em {dataEmissao}</p>
      </div>

      {municipio ? (
        <>
          <h2 className="text-lg font-bold text-institucional-deep mb-1">{municipio.nome} — {municipio.mesorregiao}</h2>
          <p className="text-sm text-gray-600 mb-4">
            {municipio.percentualMilitantes}% de concentração relativa de militância (vs. município com mais militantes mapeados)
          </p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="border border-gray-300 rounded-lg p-2 text-center">
              <p className="text-lg font-extrabold text-institucional-deep">{formatarNumero(municipio.totalMilitantes)}</p>
              <p className="text-[10px] text-gray-500">Militantes</p>
            </div>
            <div className="border border-gray-300 rounded-lg p-2 text-center">
              <p className="text-lg font-extrabold text-institucional-deep">{municipio.topBairros.length}</p>
              <p className="text-[10px] text-gray-500">Bairros Mapeados</p>
            </div>
            <div className="border border-gray-300 rounded-lg p-2 text-center">
              <p className="text-lg font-extrabold text-institucional-deep">{new Set(municipio.pessoas.map((p) => p.setor)).size}</p>
              <p className="text-[10px] text-gray-500">Setores / Cargos</p>
            </div>
          </div>

          <div className="mt-5">
            <h3 className="font-bold text-institucional-deep mb-1.5 text-sm">Top Bairros com Maior Presença</h3>
            {municipio.topBairros.length > 0 ? (
              <ul className="grid grid-cols-3 gap-2 text-sm text-gray-700">
                {municipio.topBairros.map((b) => (
                  <li key={b.bairro} className="border border-gray-300 rounded-lg px-2 py-1">
                    {b.bairro} — {formatarNumero(b.militantes)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">Bairro não informado para os militantes deste município.</p>
            )}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-lg font-bold text-institucional-deep mb-4">Panorama Estadual Consolidado</h2>
          <div className="grid grid-cols-4 gap-3">
            <div className="border border-gray-300 rounded-lg p-2 text-center">
              <p className="text-lg font-extrabold text-institucional-deep">{formatarNumero(kpis.totalMilitantes)}</p>
              <p className="text-[10px] text-gray-500">Militantes Mapeados</p>
            </div>
            <div className="border border-gray-300 rounded-lg p-2 text-center">
              <p className="text-lg font-extrabold text-institucional-deep">{kpis.coberturaMunicipal.atual}/{kpis.coberturaMunicipal.total}</p>
              <p className="text-[10px] text-gray-500">Municípios</p>
            </div>
            <div className="border border-gray-300 rounded-lg p-2 text-center">
              <p className="text-lg font-extrabold text-institucional-deep">{kpis.setoresMapeados}</p>
              <p className="text-[10px] text-gray-500">Setores / Cargos</p>
            </div>
            <div className="border border-gray-300 rounded-lg p-2 text-center">
              <p className="text-lg font-extrabold text-institucional-deep">{kpis.bairrosMapeados}</p>
              <p className="text-[10px] text-gray-500">Bairros</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Selecione um município no painel para gerar um dossiê individual detalhado.
          </p>
        </>
      )}

      <p className="text-[10px] text-gray-400 mt-8 border-t border-gray-300 pt-2">
        Documento gerado automaticamente pelo Painel de Mapeamento de Militância — SecMulher-PE.
      </p>
    </div>
  )
}
