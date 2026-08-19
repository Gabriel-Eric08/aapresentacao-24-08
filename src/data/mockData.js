// ============================================================================
// MOCK_DATA — SecMulher-PE · Painel de Mapeamento de Militância
// ----------------------------------------------------------------------------
// ⚠️ SUBSTITUIÇÃO PARA DADOS REAIS
// Este arquivo é a ÚNICA fonte de dados de toda a aplicação. Para carregar os
// dados reais, basta substituir o objeto exportado `MOCK_DATA` (ao final do
// arquivo) por um JSON com a mesma estrutura (mesmas chaves/tipos). Nenhum
// componente precisa ser alterado — todos consomem exclusivamente este objeto.
//
// Estrutura esperada:
// MOCK_DATA = {
//   metadata:  { ...informações de contexto da carga de dados }
//   kpis:      { ...métricas agregadas do topo do painel }
//   mesorregioes: string[]
//   setores:      string[]  (setores/órgãos usados nos filtros)
//   municipios: [{
//     id, nome, mesorregiao, populacaoEstimada, coordX, coordY,
//     percentualMilitantes, totalMilitantes,
//     estruturas: [{ nome, tipo, endereco }],
//     projetosAtivos: [{ nome, descricao, status }],
//     topBairros: [{ bairro, militantes }],
//     pessoas: [{
//       id, nome, setor, bairro, engajamento, contato,
//       historico: string[], projetosVinculados: string[], anotacoes
//     }]
//   }]
// }
// ============================================================================

// ---------------------------------------------------------------------------
// Geração determinística de pessoas simuladas (mesma saída a cada execução)
// Isso mantém o arquivo enxuto sem abrir mão de dados variados e plausíveis.
// Ao integrar com a base real, esta seção inteira pode ser removida.
// ---------------------------------------------------------------------------

const NOMES_FEMININOS = [
  'Maria', 'Ana', 'Francisca', 'Antônia', 'Adriana', 'Juliana', 'Márcia',
  'Fernanda', 'Patrícia', 'Aline', 'Sandra', 'Camila', 'Amanda', 'Bruna',
  'Jéssica', 'Letícia', 'Vanessa', 'Simone', 'Rosana', 'Cristiane', 'Débora',
  'Larissa', 'Gabriela', 'Rita', 'Josefa', 'Verônica', 'Eliane', 'Luciana',
  'Tatiane', 'Vera', 'Ivonete', 'Solange', 'Rosineide', 'Edilene', 'Cícera',
]

const SOBRENOMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa',
  'Ferreira', 'Rodrigues', 'Almeida', 'Nascimento', 'Carvalho', 'Gomes',
  'Martins', 'Araújo', 'Melo', 'Barbosa', 'Ribeiro', 'Alves', 'Monteiro',
  'Cavalcanti', 'Barros', 'Freitas', 'Correia', 'Andrade', 'Xavier',
]

const ANOTACOES_ARTICULADOR = [
  'Liderança comunitária forte, indicada para articulação regional.',
  'Participação constante em mobilizações territoriais.',
  'Nova integrante, em processo de capacitação.',
  'Ponto focal do bairro para escuta ativa e acolhimento.',
  'Referência em empreendedorismo feminino no território.',
  'Acompanhamento próximo recomendado para ampliar engajamento.',
  'Atua também como multiplicadora em rodas de conversa.',
  'Boa articulação com equipamentos de saúde e assistência social.',
]

const EVENTOS_HISTORICO = [
  (c) => `Feira de Empreendedorismo Feminino — ${c}`,
  () => 'Estande Qualifica PE Mulher',
  () => 'Mutirão Patrulha Maria da Penha',
  () => 'Roda de Conversa Mulher Segura em Todo Lugar',
  () => 'Capacitação Selo Emprega Mulher PE',
  (c) => `Caravana da Cidadania — ${c}`,
]

// PRNG determinístico (mulberry32) — mesma semente = mesma saída sempre.
function criarGerador(semente) {
  let s = semente >>> 0
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function semear(texto) {
  let h = 0
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0
  return h
}

function escolher(rng, lista) {
  return lista[Math.floor(rng() * lista.length)]
}

function gerarPessoas({ cidadeId, cidadeNome, bairros, setoresLocais, projetos, quantidade }) {
  const rng = criarGerador(semear(cidadeId))
  const pessoas = []
  for (let i = 0; i < quantidade; i++) {
    const nome = `${escolher(rng, NOMES_FEMININOS)} ${escolher(rng, SOBRENOMES)} ${escolher(rng, SOBRENOMES)}`
    const engajamento = Math.round(35 + rng() * 63)
    const qtdHistorico = 1 + Math.floor(rng() * 3)
    const historico = Array.from({ length: qtdHistorico }, () => escolher(rng, EVENTOS_HISTORICO)(cidadeNome))
    const qtdProjetos = 1 + Math.floor(rng() * Math.min(2, projetos.length))
    const projetosVinculados = Array.from(
      new Set(Array.from({ length: qtdProjetos }, () => escolher(rng, projetos).nome))
    )
    const ddd = 81 + (cidadeId.length % 5 === 0 ? 6 : 0) // variação simples e plausível
    const telefone = `(${87 - (i % 6)}) 9${8000 + Math.floor(rng() * 1999)}-${1000 + Math.floor(rng() * 8999)}`

    pessoas.push({
      id: `${cidadeId}-${i + 1}`,
      nome,
      setor: escolher(rng, setoresLocais),
      bairro: escolher(rng, bairros),
      engajamento,
      contato: telefone,
      historico,
      projetosVinculados,
      anotacoes: escolher(rng, ANOTACOES_ARTICULADOR),
    })
  }
  return pessoas.sort((a, b) => b.engajamento - a.engajamento)
}

const SETORES = [
  'Coordenadoria Municipal da Mulher',
  'Centro de Referência da Mulher (CRM)',
  'Delegacia Especializada de Atendimento à Mulher (DEAM)',
  'Patrulha Maria da Penha',
  'Casa da Mulher Pernambucana',
  'Articulação de Base / Militância Comunitária',
  'Casa Abrigo',
  'Núcleo de Empreendedorismo Feminino',
]

const PROJETOS_POOL = {
  feira: { nome: 'Feira de Empreendedorismo Feminino', descricao: 'Estandes de comercialização e capacitação para empreendedoras locais.', status: 'Ativo' },
  qualifica: { nome: 'Qualifica PE Mulher', descricao: 'Trilhas de qualificação profissional e inserção no mercado de trabalho.', status: 'Ativo' },
  patrulha: { nome: 'Patrulha Maria da Penha', descricao: 'Rondas preventivas e acompanhamento de mulheres em situação de risco.', status: 'Ativo' },
  segura: { nome: 'Mulher Segura em Todo Lugar', descricao: 'Ações integradas de segurança pública com foco territorial.', status: 'Ativo' },
  selo: { nome: 'Selo Emprega Mulher PE', descricao: 'Certificação de empresas parceiras que priorizam contratação feminina.', status: 'Ativo' },
  rede: { nome: 'Rede de Enfrentamento à Violência', descricao: 'Articulação intersetorial entre saúde, assistência social e segurança.', status: 'Ativo' },
  roca: { nome: 'Bora Pra Roça — Mulheres Rurais', descricao: 'Apoio a mulheres agricultoras e associações rurais produtivas.', status: 'Ativo' },
  digital: { nome: 'Empodera Mulher Digital', descricao: 'Letramento digital e inclusão em plataformas de renda.', status: 'Piloto' },
}

function estrutura(nome, tipo, endereco) {
  return { nome, tipo, endereco }
}

// ---------------------------------------------------------------------------
// Base de municípios (amostra representativa das 4 mesorregiões de PE).
// Cobertura operacional total informada no KPI é de 184/184 municípios;
// os registros abaixo trazem o detalhamento completo para os municípios
// de maior relevância estratégica, prontos para expansão às demais.
// ---------------------------------------------------------------------------

const MUNICIPIOS_BASE = [
  // ---------------- RMR — Região Metropolitana do Recife ----------------
  {
    id: 'recife', nome: 'Recife', mesorregiao: 'RMR', populacaoEstimada: 1653461,
    coordX: 745, coordY: 230, percentualMilitantes: 92, totalMilitantes: 2450,
    bairros: ['Boa Viagem', 'Casa Amarela', 'Várzea', 'Ibura', 'Afogados', 'Boa Vista', 'Torre', 'Imbiribeira', 'Cordeiro', 'Cohab'],
    topBairrosBase: [{ bairro: 'Boa Viagem', militantes: 412 }, { bairro: 'Casa Amarela', militantes: 358 }, { bairro: 'Ibura', militantes: 296 }],
    estruturas: [
      estrutura('Casa da Mulher Pernambucana — Recife', 'Casa da Mulher Pernambucana', 'Av. Cruz Cabugá, Santo Amaro'),
      estrutura('CRM Central Recife', 'Centro de Referência da Mulher', 'Rua da Aurora, Boa Vista'),
      estrutura('DEAM Recife', 'Delegacia Especializada', 'Rua do Hospício, Boa Vista'),
      estrutura('Núcleo Patrulha Maria da Penha — Recife', 'Patrulha Maria da Penha', 'Sede AISP Recife'),
      estrutura('Casa Abrigo Metropolitana', 'Casa Abrigo', 'Endereço sigiloso'),
    ],
    projetos: [PROJETOS_POOL.feira, PROJETOS_POOL.qualifica, PROJETOS_POOL.patrulha, PROJETOS_POOL.selo, PROJETOS_POOL.digital],
    qtdPessoas: 9,
  },
  {
    id: 'olinda', nome: 'Olinda', mesorregiao: 'RMR', populacaoEstimada: 393115,
    coordX: 710, coordY: 190, percentualMilitantes: 81, totalMilitantes: 640,
    bairros: ['Rio Doce', 'Bairro Novo', 'Casa Caiada', 'Amaro Branco', 'Peixinhos', 'Sítio Novo', 'Jardim Brasil'],
    topBairrosBase: [{ bairro: 'Rio Doce', militantes: 121 }, { bairro: 'Peixinhos', militantes: 98 }, { bairro: 'Casa Caiada', militantes: 74 }],
    estruturas: [
      estrutura('CRM Olinda', 'Centro de Referência da Mulher', 'Rua de São Bento, Carmo'),
      estrutura('Coordenadoria Municipal da Mulher — Olinda', 'Coordenadoria Municipal', 'Praça do Carmo'),
      estrutura('Núcleo Patrulha Maria da Penha — Olinda', 'Patrulha Maria da Penha', 'Sede AISP Olinda'),
    ],
    projetos: [PROJETOS_POOL.feira, PROJETOS_POOL.patrulha, PROJETOS_POOL.rede],
    qtdPessoas: 6,
  },
  {
    id: 'jaboatao-dos-guararapes', nome: 'Jaboatão dos Guararapes', mesorregiao: 'RMR', populacaoEstimada: 702621,
    coordX: 715, coordY: 270, percentualMilitantes: 74, totalMilitantes: 890,
    bairros: ['Piedade', 'Candeias', 'Prazeres', 'Cavaleiro', 'Curado', 'Jaboatão Centro'],
    topBairrosBase: [{ bairro: 'Piedade', militantes: 210 }, { bairro: 'Candeias', militantes: 176 }, { bairro: 'Cavaleiro', militantes: 133 }],
    estruturas: [
      estrutura('CRM Jaboatão dos Guararapes', 'Centro de Referência da Mulher', 'Av. Barreto de Menezes, Piedade'),
      estrutura('DEAM Jaboatão', 'Delegacia Especializada', 'Centro'),
      estrutura('Casa da Mulher Pernambucana — Jaboatão', 'Casa da Mulher Pernambucana', 'Cavaleiro'),
    ],
    projetos: [PROJETOS_POOL.qualifica, PROJETOS_POOL.patrulha, PROJETOS_POOL.selo],
    qtdPessoas: 7,
  },
  {
    id: 'cabo-de-santo-agostinho', nome: 'Cabo de Santo Agostinho', mesorregiao: 'RMR', populacaoEstimada: 206241,
    coordX: 700, coordY: 315, percentualMilitantes: 68, totalMilitantes: 410,
    bairros: ['Cabo Centro', 'Charneca', 'Ponte dos Carvalhos', 'Gaibu'],
    topBairrosBase: [{ bairro: 'Charneca', militantes: 96 }, { bairro: 'Cabo Centro', militantes: 88 }, { bairro: 'Ponte dos Carvalhos', militantes: 61 }],
    estruturas: [
      estrutura('CRM Cabo de Santo Agostinho', 'Centro de Referência da Mulher', 'Centro'),
      estrutura('Coordenadoria Municipal da Mulher — Cabo', 'Coordenadoria Municipal', 'Paço Municipal'),
    ],
    projetos: [PROJETOS_POOL.feira, PROJETOS_POOL.rede],
    qtdPessoas: 5,
  },
  {
    id: 'ipojuca', nome: 'Ipojuca', mesorregiao: 'RMR', populacaoEstimada: 99724,
    coordX: 680, coordY: 355, percentualMilitantes: 63, totalMilitantes: 265,
    bairros: ['Porto de Suape', 'Nossa Senhora do Ó', 'Camela', 'Ipojuca Centro', 'Praia do Cupe'],
    topBairrosBase: [{ bairro: 'Ipojuca Centro', militantes: 71 }, { bairro: 'Nossa Senhora do Ó', militantes: 54 }, { bairro: 'Camela', militantes: 39 }],
    estruturas: [
      estrutura('CRM Ipojuca', 'Centro de Referência da Mulher', 'Centro'),
      estrutura('Núcleo de Empreendedorismo Feminino — Suape', 'Núcleo de Empreendedorismo', 'Complexo Industrial de Suape'),
    ],
    projetos: [PROJETOS_POOL.feira, PROJETOS_POOL.digital, PROJETOS_POOL.selo],
    qtdPessoas: 5,
  },
  {
    id: 'igarassu', nome: 'Igarassu', mesorregiao: 'RMR', populacaoEstimada: 126519,
    coordX: 730, coordY: 150, percentualMilitantes: 58, totalMilitantes: 198,
    bairros: ['Igarassu Centro', 'Ilha de Itapessoca', 'Janga'],
    topBairrosBase: [{ bairro: 'Igarassu Centro', militantes: 62 }, { bairro: 'Janga', militantes: 41 }, { bairro: 'Ilha de Itapessoca', militantes: 24 }],
    estruturas: [estrutura('CRM Igarassu', 'Centro de Referência da Mulher', 'Centro')],
    projetos: [PROJETOS_POOL.feira, PROJETOS_POOL.rede],
    qtdPessoas: 4,
  },
  {
    id: 'camaragibe', nome: 'Camaragibe', mesorregiao: 'RMR', populacaoEstimada: 156500,
    coordX: 670, coordY: 220, percentualMilitantes: 65, totalMilitantes: 231,
    bairros: ['Tabatinga', 'Aldeia', 'Vera Cruz'],
    topBairrosBase: [{ bairro: 'Tabatinga', militantes: 78 }, { bairro: 'Vera Cruz', militantes: 55 }, { bairro: 'Aldeia', militantes: 33 }],
    estruturas: [estrutura('CRM Camaragibe', 'Centro de Referência da Mulher', 'Centro')],
    projetos: [PROJETOS_POOL.qualifica, PROJETOS_POOL.patrulha],
    qtdPessoas: 4,
  },
  {
    id: 'paulista', nome: 'Paulista', mesorregiao: 'RMR', populacaoEstimada: 343226,
    coordX: 760, coordY: 110, percentualMilitantes: 71, totalMilitantes: 470,
    bairros: ['Maranguape', 'Janga', 'Paratibe', 'Arthur Lundgren'],
    topBairrosBase: [{ bairro: 'Maranguape', militantes: 132 }, { bairro: 'Janga', militantes: 97 }, { bairro: 'Paratibe', militantes: 68 }],
    estruturas: [
      estrutura('CRM Paulista', 'Centro de Referência da Mulher', 'Maranguape'),
      estrutura('DEAM Paulista', 'Delegacia Especializada', 'Centro'),
    ],
    projetos: [PROJETOS_POOL.feira, PROJETOS_POOL.patrulha, PROJETOS_POOL.qualifica],
    qtdPessoas: 6,
  },

  // ---------------------- Zona da Mata ----------------------
  {
    id: 'vitoria-de-santo-antao', nome: 'Vitória de Santo Antão', mesorregiao: 'Zona da Mata', populacaoEstimada: 140137,
    coordX: 560, coordY: 230, percentualMilitantes: 60, totalMilitantes: 224,
    bairros: ['Centro', 'Bela Vista', 'Alto Bonito'],
    topBairrosBase: [{ bairro: 'Centro', militantes: 74 }, { bairro: 'Bela Vista', militantes: 51 }, { bairro: 'Alto Bonito', militantes: 33 }],
    estruturas: [
      estrutura('CRM Vitória de Santo Antão', 'Centro de Referência da Mulher', 'Centro'),
      estrutura('Coordenadoria Municipal da Mulher', 'Coordenadoria Municipal', 'Paço Municipal'),
    ],
    projetos: [PROJETOS_POOL.roca, PROJETOS_POOL.feira, PROJETOS_POOL.rede],
    qtdPessoas: 5,
  },
  {
    id: 'palmares', nome: 'Palmares', mesorregiao: 'Zona da Mata', populacaoEstimada: 60381,
    coordX: 580, coordY: 370, percentualMilitantes: 52, totalMilitantes: 118,
    bairros: ['Centro', 'Bom Jesus', 'Boa Vista'],
    topBairrosBase: [{ bairro: 'Centro', militantes: 41 }, { bairro: 'Bom Jesus', militantes: 27 }, { bairro: 'Boa Vista', militantes: 19 }],
    estruturas: [estrutura('CRM Palmares', 'Centro de Referência da Mulher', 'Centro')],
    projetos: [PROJETOS_POOL.roca, PROJETOS_POOL.rede],
    qtdPessoas: 4,
  },
  {
    id: 'goiana', nome: 'Goiana', mesorregiao: 'Zona da Mata', populacaoEstimada: 80638,
    coordX: 600, coordY: 70, percentualMilitantes: 55, totalMilitantes: 143,
    bairros: ['Centro', 'Tejucupapo', 'Ponta de Pedras'],
    topBairrosBase: [{ bairro: 'Centro', militantes: 52 }, { bairro: 'Ponta de Pedras', militantes: 34 }, { bairro: 'Tejucupapo', militantes: 21 }],
    estruturas: [estrutura('CRM Goiana', 'Centro de Referência da Mulher', 'Centro'), estrutura('Núcleo de Empreendedorismo Feminino — Goiana', 'Núcleo de Empreendedorismo', 'Distrito Industrial')],
    projetos: [PROJETOS_POOL.feira, PROJETOS_POOL.selo],
    qtdPessoas: 4,
  },
  {
    id: 'timbauba', nome: 'Timbaúba', mesorregiao: 'Zona da Mata', populacaoEstimada: 55492,
    coordX: 560, coordY: 100, percentualMilitantes: 49, totalMilitantes: 96,
    bairros: ['Centro', 'Cana Brava'],
    topBairrosBase: [{ bairro: 'Centro', militantes: 39 }, { bairro: 'Cana Brava', militantes: 22 }],
    estruturas: [estrutura('CRM Timbaúba', 'Centro de Referência da Mulher', 'Centro')],
    projetos: [PROJETOS_POOL.roca, PROJETOS_POOL.qualifica],
    qtdPessoas: 3,
  },
  {
    id: 'nazare-da-mata', nome: 'Nazaré da Mata', mesorregiao: 'Zona da Mata', populacaoEstimada: 30271,
    coordX: 580, coordY: 140, percentualMilitantes: 44, totalMilitantes: 62,
    bairros: ['Centro', 'Boa Vista'],
    topBairrosBase: [{ bairro: 'Centro', militantes: 28 }, { bairro: 'Boa Vista', militantes: 14 }],
    estruturas: [estrutura('CRM Nazaré da Mata', 'Centro de Referência da Mulher', 'Centro')],
    projetos: [PROJETOS_POOL.roca],
    qtdPessoas: 3,
  },

  // ------------------------- Agreste -------------------------
  {
    id: 'caruaru', nome: 'Caruaru', mesorregiao: 'Agreste', populacaoEstimada: 365278,
    coordX: 400, coordY: 250, percentualMilitantes: 84, totalMilitantes: 980,
    bairros: ['Petrópolis', 'Indianópolis', 'Maurício de Nassau', 'Kennedy', 'Salgado', 'Alto do Moura', 'Centro'],
    topBairrosBase: [{ bairro: 'Indianópolis', militantes: 231 }, { bairro: 'Petrópolis', militantes: 198 }, { bairro: 'Kennedy', militantes: 154 }],
    estruturas: [
      estrutura('CRM Caruaru', 'Centro de Referência da Mulher', 'Centro'),
      estrutura('DEAM Caruaru', 'Delegacia Especializada', 'Petrópolis'),
      estrutura('Casa da Mulher Pernambucana — Agreste', 'Casa da Mulher Pernambucana', 'Indianópolis'),
      estrutura('Núcleo Patrulha Maria da Penha — Caruaru', 'Patrulha Maria da Penha', 'Sede AISP Caruaru'),
    ],
    projetos: [PROJETOS_POOL.feira, PROJETOS_POOL.qualifica, PROJETOS_POOL.patrulha, PROJETOS_POOL.selo],
    qtdPessoas: 7,
  },
  {
    id: 'garanhuns', nome: 'Garanhuns', mesorregiao: 'Agreste', populacaoEstimada: 140577,
    coordX: 350, coordY: 390, percentualMilitantes: 70, totalMilitantes: 340,
    bairros: ['Heliópolis', 'Boa Vista', 'Santo Antônio', 'Manoel Firmino'],
    topBairrosBase: [{ bairro: 'Heliópolis', militantes: 92 }, { bairro: 'Boa Vista', militantes: 71 }, { bairro: 'Santo Antônio', militantes: 54 }],
    estruturas: [
      estrutura('CRM Garanhuns', 'Centro de Referência da Mulher', 'Centro'),
      estrutura('DEAM Garanhuns', 'Delegacia Especializada', 'Heliópolis'),
    ],
    projetos: [PROJETOS_POOL.feira, PROJETOS_POOL.qualifica, PROJETOS_POOL.rede],
    qtdPessoas: 5,
  },
  {
    id: 'gravata', nome: 'Gravatá', mesorregiao: 'Agreste', populacaoEstimada: 89664,
    coordX: 480, coordY: 210, percentualMilitantes: 61, totalMilitantes: 178,
    bairros: ['Centro', 'Brejão', 'Jardim'],
    topBairrosBase: [{ bairro: 'Centro', militantes: 61 }, { bairro: 'Jardim', militantes: 39 }, { bairro: 'Brejão', militantes: 22 }],
    estruturas: [estrutura('CRM Gravatá', 'Centro de Referência da Mulher', 'Centro')],
    projetos: [PROJETOS_POOL.feira, PROJETOS_POOL.roca],
    qtdPessoas: 4,
  },
  {
    id: 'belo-jardim', nome: 'Belo Jardim', mesorregiao: 'Agreste', populacaoEstimada: 78192,
    coordX: 340, coordY: 270, percentualMilitantes: 54, totalMilitantes: 132,
    bairros: ['Centro', 'Bom Jesus'],
    topBairrosBase: [{ bairro: 'Centro', militantes: 47 }, { bairro: 'Bom Jesus', militantes: 28 }],
    estruturas: [estrutura('CRM Belo Jardim', 'Centro de Referência da Mulher', 'Centro')],
    projetos: [PROJETOS_POOL.qualifica, PROJETOS_POOL.rede],
    qtdPessoas: 4,
  },
  {
    id: 'bezerros', nome: 'Bezerros', mesorregiao: 'Agreste', populacaoEstimada: 65961,
    coordX: 440, coordY: 230, percentualMilitantes: 57, totalMilitantes: 121,
    bairros: ['Centro', 'Salgadinho'],
    topBairrosBase: [{ bairro: 'Centro', militantes: 44 }, { bairro: 'Salgadinho', militantes: 25 }],
    estruturas: [estrutura('CRM Bezerros', 'Centro de Referência da Mulher', 'Centro')],
    projetos: [PROJETOS_POOL.feira],
    qtdPessoas: 3,
  },
  {
    id: 'pesqueira', nome: 'Pesqueira', mesorregiao: 'Agreste', populacaoEstimada: 66782,
    coordX: 290, coordY: 330, percentualMilitantes: 50, totalMilitantes: 109,
    bairros: ['Centro', 'Xucuru', 'Cohab'],
    topBairrosBase: [{ bairro: 'Centro', militantes: 42 }, { bairro: 'Cohab', militantes: 24 }, { bairro: 'Xucuru', militantes: 18 }],
    estruturas: [estrutura('CRM Pesqueira', 'Centro de Referência da Mulher', 'Centro')],
    projetos: [PROJETOS_POOL.roca, PROJETOS_POOL.rede],
    qtdPessoas: 4,
  },
  {
    id: 'surubim', nome: 'Surubim', mesorregiao: 'Agreste', populacaoEstimada: 62603,
    coordX: 300, coordY: 130, percentualMilitantes: 48, totalMilitantes: 101,
    bairros: ['Centro', 'Cidade Nova'],
    topBairrosBase: [{ bairro: 'Centro', militantes: 39 }, { bairro: 'Cidade Nova', militantes: 21 }],
    estruturas: [estrutura('CRM Surubim', 'Centro de Referência da Mulher', 'Centro')],
    projetos: [PROJETOS_POOL.feira, PROJETOS_POOL.roca],
    qtdPessoas: 3,
  },

  // -------------------------- Sertão --------------------------
  {
    id: 'petrolina', nome: 'Petrolina', mesorregiao: 'Sertão', populacaoEstimada: 354317,
    coordX: 90, coordY: 400, percentualMilitantes: 79, totalMilitantes: 720,
    bairros: ['Centro', 'Vila Eduardo', 'Dom Avelar', 'José e Maria', 'Jardim São Paulo', 'Areia Branca'],
    topBairrosBase: [{ bairro: 'Vila Eduardo', militantes: 168 }, { bairro: 'Centro', militantes: 141 }, { bairro: 'Dom Avelar', militantes: 109 }],
    estruturas: [
      estrutura('CRM Petrolina', 'Centro de Referência da Mulher', 'Centro'),
      estrutura('DEAM Petrolina', 'Delegacia Especializada', 'Centro'),
      estrutura('Casa da Mulher Pernambucana — Sertão', 'Casa da Mulher Pernambucana', 'Vila Eduardo'),
    ],
    projetos: [PROJETOS_POOL.feira, PROJETOS_POOL.qualifica, PROJETOS_POOL.roca, PROJETOS_POOL.selo],
    qtdPessoas: 6,
  },
  {
    id: 'serra-talhada', nome: 'Serra Talhada', mesorregiao: 'Sertão', populacaoEstimada: 83291,
    coordX: 190, coordY: 110, percentualMilitantes: 62, totalMilitantes: 187,
    bairros: ['Centro', 'São Cristóvão', 'Nova Floresta'],
    topBairrosBase: [{ bairro: 'Centro', militantes: 68 }, { bairro: 'São Cristóvão', militantes: 51 }, { bairro: 'Nova Floresta', militantes: 33 }],
    estruturas: [
      estrutura('CRM Serra Talhada', 'Centro de Referência da Mulher', 'Centro'),
      estrutura('DEAM Serra Talhada', 'Delegacia Especializada', 'Centro'),
    ],
    projetos: [PROJETOS_POOL.feira, PROJETOS_POOL.roca, PROJETOS_POOL.rede],
    qtdPessoas: 4,
  },
  {
    id: 'araripina', nome: 'Araripina', mesorregiao: 'Sertão', populacaoEstimada: 85274,
    coordX: 50, coordY: 250, percentualMilitantes: 46, totalMilitantes: 99,
    bairros: ['Centro', 'Bela Vista'],
    topBairrosBase: [{ bairro: 'Centro', militantes: 38 }, { bairro: 'Bela Vista', militantes: 20 }],
    estruturas: [estrutura('CRM Araripina', 'Centro de Referência da Mulher', 'Centro')],
    projetos: [PROJETOS_POOL.roca, PROJETOS_POOL.digital],
    qtdPessoas: 3,
  },
  {
    id: 'salgueiro', nome: 'Salgueiro', mesorregiao: 'Sertão', populacaoEstimada: 60122,
    coordX: 170, coordY: 260, percentualMilitantes: 51, totalMilitantes: 107,
    bairros: ['Centro', 'Alto do Cruzeiro'],
    topBairrosBase: [{ bairro: 'Centro', militantes: 43 }, { bairro: 'Alto do Cruzeiro', militantes: 24 }],
    estruturas: [estrutura('CRM Salgueiro', 'Centro de Referência da Mulher', 'Centro')],
    projetos: [PROJETOS_POOL.feira, PROJETOS_POOL.roca],
    qtdPessoas: 3,
  },
  {
    id: 'arcoverde', nome: 'Arcoverde', mesorregiao: 'Sertão', populacaoEstimada: 75634,
    coordX: 220, coordY: 340, percentualMilitantes: 55, totalMilitantes: 128,
    bairros: ['Centro', 'Bela Vista', 'Bom Jesus'],
    topBairrosBase: [{ bairro: 'Centro', militantes: 49 }, { bairro: 'Bom Jesus', militantes: 30 }, { bairro: 'Bela Vista', militantes: 21 }],
    estruturas: [estrutura('CRM Arcoverde', 'Centro de Referência da Mulher', 'Centro'), estrutura('DEAM Arcoverde', 'Delegacia Especializada', 'Centro')],
    projetos: [PROJETOS_POOL.feira, PROJETOS_POOL.rede],
    qtdPessoas: 4,
  },
  {
    id: 'ouricuri', nome: 'Ouricuri', mesorregiao: 'Sertão', populacaoEstimada: 72004,
    coordX: 110, coordY: 190, percentualMilitantes: 41, totalMilitantes: 84,
    bairros: ['Centro', 'Cágado'],
    topBairrosBase: [{ bairro: 'Centro', militantes: 33 }, { bairro: 'Cágado', militantes: 17 }],
    estruturas: [estrutura('CRM Ouricuri', 'Centro de Referência da Mulher', 'Centro')],
    projetos: [PROJETOS_POOL.roca],
    qtdPessoas: 3,
  },
]

const municipios = MUNICIPIOS_BASE.map((m) => ({
  id: m.id,
  nome: m.nome,
  mesorregiao: m.mesorregiao,
  populacaoEstimada: m.populacaoEstimada,
  coordX: m.coordX,
  coordY: m.coordY,
  percentualMilitantes: m.percentualMilitantes,
  totalMilitantes: m.totalMilitantes,
  estruturas: m.estruturas,
  projetosAtivos: m.projetos,
  topBairros: m.topBairrosBase,
  pessoas: gerarPessoas({
    cidadeId: m.id,
    cidadeNome: m.nome,
    bairros: m.bairros,
    setoresLocais: SETORES,
    projetos: m.projetos,
    quantidade: m.qtdPessoas,
  }),
}))

const totalEstruturas = municipios.reduce((acc, m) => acc + m.estruturas.length, 0)

export const MOCK_DATA = {
  metadata: {
    orgao: 'Secretaria da Mulher de Pernambuco (SecMulher-PE)',
    painel: 'Mapeamento Estratégico de Militância e Presença Territorial',
    ultimaAtualizacao: '2026-08-15',
    modo: 'demonstrativo', // 'demonstrativo' | 'producao'
  },
  kpis: {
    totalMilitantes: 12450,
    coberturaMunicipal: { atual: 184, total: 184 },
    estruturasSecMulher: 142,
    eventosEmpreendedorismo: 89,
    engajamentoMedio: 78.5,
  },
  mesorregioes: ['RMR', 'Zona da Mata', 'Agreste', 'Sertão'],
  setores: SETORES,
  municipios,
}

export { totalEstruturas }
