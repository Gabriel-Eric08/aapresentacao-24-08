// ============================================================================
// MILITANCIA_DATA — SecMulher-PE · Painel de Mapeamento de Militância
// ----------------------------------------------------------------------------
// Gerado por scripts/build-militancia-data.mjs — não editar manualmente.
// Fonte: src/data/militancia/militancia-corrigido.xlsx — planilha final
// curada manualmente (NOME, CARGO, MUNICIPIO, BAIRRO, TELEFONE), já sem
// pendências.
//
// Para atualizar: substitua o arquivo-fonte (mesmas colunas) e rode
//   node scripts/build-militancia-data.mjs
// ============================================================================

export const MILITANCIA_DATA = {
  "metadata": {
    "orgao": "Secretaria da Mulher de Pernambuco (SecMulher-PE)",
    "painel": "Mapeamento de Militância e Presença Territorial",
    "ultimaAtualizacao": "2026-08-24",
    "modo": "producao"
  },
  "kpis": {
    "totalMilitantes": 106,
    "coberturaMunicipal": {
      "atual": 19,
      "total": 184
    },
    "setoresMapeados": 42,
    "bairrosMapeados": 76
  },
  "mesorregioes": [
    "RMR",
    "Sertão",
    "Agreste",
    "Zona da Mata"
  ],
  "setores": [
    "Apoio Administrativo",
    "Assessor Administrativo",
    "Assessor Especial",
    "Assessora Administrativa",
    "Assessora de Diretoria",
    "Assessora de Gerência",
    "Assessora de Política da Saúde da Mulher",
    "Assessora Especial de Controle Interno",
    "Assessora Técnica de Comunicação Social e Imprensa",
    "Assistente de Gerência",
    "Auxilar Tecnica",
    "CAJ",
    "Chefe de Gabinete",
    "Comunicação",
    "Cooordenadora Adjunta de Controla Interno",
    "Coordenadora Regional da Mata Sul",
    "Coordenadora Regional do Agreste Central",
    "Coordenadora Regional do Agreste Meridional",
    "Coordenadora Regional do Agreste Setentrional",
    "Coordenadora Regional do Sertão do Moxotó",
    "Coordenadora Regional do Sertão do Pajeú",
    "Coordenadora Regional Metropolitana",
    "DEVG 190",
    "DIPLAG",
    "Diretora de Enfrentamento a Violência de Gênero",
    "GEFSP E GEFV",
    "GERAI",
    "Gerente de Articulação e Interiorização das Ações de Gênero",
    "Gerente de Gestão de Pessoas",
    "Gestora de Justiça e Segurança",
    "Gestora de Trabalho e Renda",
    "Gestora do Serviço de Proteção",
    "Gestora dos Serviços de Acolhimento",
    "Governanta",
    "Manutenção Predial",
    "Motorista",
    "Psicóloga",
    "Recepcionista",
    "Secretária da Mulher",
    "Secretária Executiva de Política para as Mulheres",
    "Supervisão -1",
    "Técnico Admnistrativo"
  ],
  "municipios": [
    {
      "id": "abreu-e-lima",
      "nome": "Abreu e Lima",
      "mesorregiao": "RMR",
      "totalMilitantes": 1,
      "percentualMilitantes": 2.3,
      "topBairros": [
        {
          "bairro": "Caétes 3",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "abreu-e-lima-1",
          "nome": "Alice Ketellen Santos da Rocha",
          "setor": "Apoio Administrativo",
          "bairro": "Caétes 3",
          "contato": "+55 81 8758-1780"
        }
      ]
    },
    {
      "id": "agua-preta",
      "nome": "Água Preta",
      "mesorregiao": "Zona da Mata",
      "totalMilitantes": 1,
      "percentualMilitantes": 2.3,
      "topBairros": [
        {
          "bairro": "Cohab",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "agua-preta-1",
          "nome": "Margarida da Silva",
          "setor": "Coordenadora Regional da Mata Sul",
          "bairro": "Cohab",
          "contato": "+55 81 8904-2538"
        }
      ]
    },
    {
      "id": "cabo-de-santo-agostinho",
      "nome": "Cabo de Santo Agostinho",
      "mesorregiao": "RMR",
      "totalMilitantes": 4,
      "percentualMilitantes": 9.3,
      "topBairros": [
        {
          "bairro": "Cohab",
          "militantes": 1
        },
        {
          "bairro": "Ponte dos Carvalhos",
          "militantes": 1
        },
        {
          "bairro": "Vila Dr. Manoel Clementino",
          "militantes": 1
        },
        {
          "bairro": "Vila Social Conta Mocambo.",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "cabo-de-santo-agostinho-2",
          "nome": "Darling Lima",
          "setor": "Assessora de Gerência",
          "bairro": "Ponte dos Carvalhos",
          "contato": "+55 81 9998-3351"
        },
        {
          "id": "cabo-de-santo-agostinho-1",
          "nome": "Jamerson Gomes",
          "setor": "Motorista",
          "bairro": "Cohab",
          "contato": "+55 81 8861-8011"
        },
        {
          "id": "cabo-de-santo-agostinho-4",
          "nome": "Martha Araújo",
          "setor": "Auxilar Tecnica",
          "bairro": "Vila Social Conta Mocambo.",
          "contato": "+55 81 9837-3326"
        },
        {
          "id": "cabo-de-santo-agostinho-3",
          "nome": "Walkiria Alves",
          "setor": "Secretária Executiva de Política para as Mulheres",
          "bairro": "Vila Dr. Manoel Clementino",
          "contato": "+55 81 9302-7768"
        }
      ]
    },
    {
      "id": "camaragibe",
      "nome": "Camaragibe",
      "mesorregiao": "RMR",
      "totalMilitantes": 2,
      "percentualMilitantes": 4.7,
      "topBairros": [
        {
          "bairro": "Cosme Damião",
          "militantes": 1
        },
        {
          "bairro": "Santana",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "camaragibe-1",
          "nome": "Gilvan Barbara",
          "setor": "Motorista",
          "bairro": "Cosme Damião",
          "contato": "+55 81 9745-1438"
        },
        {
          "id": "camaragibe-2",
          "nome": "Vinicius Ricardo",
          "setor": "Motorista",
          "bairro": "Santana",
          "contato": "+55 81 8802-7393"
        }
      ]
    },
    {
      "id": "carpina",
      "nome": "Carpina",
      "mesorregiao": "Zona da Mata",
      "totalMilitantes": 1,
      "percentualMilitantes": 2.3,
      "topBairros": [
        {
          "bairro": "Lot. Santana",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "carpina-1",
          "nome": "Aline Venancio",
          "setor": "CAJ",
          "bairro": "Lot. Santana",
          "contato": "55 81 9721-2446"
        }
      ]
    },
    {
      "id": "caruaru",
      "nome": "Caruaru",
      "mesorregiao": "Agreste",
      "totalMilitantes": 4,
      "percentualMilitantes": 9.3,
      "topBairros": [
        {
          "bairro": "Idianópolis",
          "militantes": 1
        },
        {
          "bairro": "Indianapolis",
          "militantes": 1
        },
        {
          "bairro": "Nossa Senhora das Graças",
          "militantes": 1
        },
        {
          "bairro": "Universitário",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "caruaru-3",
          "nome": "Amaro Santos",
          "setor": "Motorista",
          "bairro": "Nossa Senhora das Graças",
          "contato": "+55 81 9836-7173"
        },
        {
          "id": "caruaru-2",
          "nome": "Erisson Andrade",
          "setor": "DIPLAG",
          "bairro": "Indianapolis",
          "contato": "+55 81 9653-4040"
        },
        {
          "id": "caruaru-1",
          "nome": "Rafaella Santos",
          "setor": "Coordenadora Regional do Agreste Setentrional",
          "bairro": "Idianópolis",
          "contato": "+55 81 9440-4019"
        },
        {
          "id": "caruaru-4",
          "nome": "Samara Ramos",
          "setor": "GERAI",
          "bairro": "Universitário",
          "contato": "+55 81 8208-5891"
        }
      ]
    },
    {
      "id": "garanhuns",
      "nome": "Garanhuns",
      "mesorregiao": "Agreste",
      "totalMilitantes": 1,
      "percentualMilitantes": 2.3,
      "topBairros": [
        {
          "bairro": "Heliópolis",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "garanhuns-1",
          "nome": "Alexsandra Valença",
          "setor": "Coordenadora Regional do Agreste Meridional",
          "bairro": "Heliópolis",
          "contato": "+55 87 9141-9109"
        }
      ]
    },
    {
      "id": "gravata",
      "nome": "Gravatá",
      "mesorregiao": "Agreste",
      "totalMilitantes": 1,
      "percentualMilitantes": 2.3,
      "topBairros": [
        {
          "bairro": "Prado",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "gravata-1",
          "nome": "Poliana Cristina Soares",
          "setor": "Coordenadora Regional do Agreste Central",
          "bairro": "Prado",
          "contato": "+55 81 9484-7031"
        }
      ]
    },
    {
      "id": "igarassu",
      "nome": "Igarassu",
      "mesorregiao": "RMR",
      "totalMilitantes": 1,
      "percentualMilitantes": 2.3,
      "topBairros": [
        {
          "bairro": "Centro",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "igarassu-1",
          "nome": "Ewelin Cardoso",
          "setor": "Diretora de Enfrentamento a Violência de Gênero",
          "bairro": "Centro",
          "contato": "+55 81 9189-8472"
        }
      ]
    },
    {
      "id": "ipojuca",
      "nome": "Ipojuca",
      "mesorregiao": "RMR",
      "totalMilitantes": 1,
      "percentualMilitantes": 2.3,
      "topBairros": [
        {
          "bairro": "Centro",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "ipojuca-1",
          "nome": "Margot Pedrosa",
          "setor": "Assessora de Política da Saúde da Mulher",
          "bairro": "Centro",
          "contato": "+55 81 8681-1484"
        }
      ]
    },
    {
      "id": "itapissuma",
      "nome": "Itapissuma",
      "mesorregiao": "RMR",
      "totalMilitantes": 1,
      "percentualMilitantes": 2.3,
      "topBairros": [
        {
          "bairro": "Mangabeira",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "itapissuma-1",
          "nome": "Samara Dias",
          "setor": "GEFSP E GEFV",
          "bairro": "Mangabeira",
          "contato": "+55 48 9936-5250"
        }
      ]
    },
    {
      "id": "jaboatao-dos-guararapes",
      "nome": "Jaboatão dos Guararapes",
      "mesorregiao": "RMR",
      "totalMilitantes": 13,
      "percentualMilitantes": 30.2,
      "topBairros": [
        {
          "bairro": "Candeias",
          "militantes": 3
        },
        {
          "bairro": "Piedade",
          "militantes": 2
        },
        {
          "bairro": "Cajueiro Seco",
          "militantes": 1
        },
        {
          "bairro": "Conjunto Marcos Freire",
          "militantes": 1
        },
        {
          "bairro": "Engenho Velho",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "jaboatao-dos-guararapes-10",
          "nome": "Ana Loyo",
          "setor": "Cooordenadora Adjunta de Controla Interno",
          "bairro": "Piedade",
          "contato": "+55 81 9186-8665"
        },
        {
          "id": "jaboatao-dos-guararapes-12",
          "nome": "Betania Soares",
          "setor": "GEFSP E GEFV",
          "bairro": "Socorro",
          "contato": "+55 81 9219-5808"
        },
        {
          "id": "jaboatao-dos-guararapes-8",
          "nome": "Bruna Joana da Silva",
          "setor": "Recepcionista",
          "bairro": "Pacheco",
          "contato": "+55 81 9976-8548"
        },
        {
          "id": "jaboatao-dos-guararapes-5",
          "nome": "Cristóvão Fernandes",
          "setor": "Motorista",
          "bairro": "Conjunto Marcos Freire",
          "contato": "+55 81 9774-4196"
        },
        {
          "id": "jaboatao-dos-guararapes-3",
          "nome": "Edinalva Bezerra Ramos",
          "setor": "Assessora de Diretoria",
          "bairro": "Candeias",
          "contato": "+55 81 8758-1911"
        },
        {
          "id": "jaboatao-dos-guararapes-9",
          "nome": "Emony Lima",
          "setor": "Comunicação",
          "bairro": "Piedade",
          "contato": "+55 81 9559-0311"
        },
        {
          "id": "jaboatao-dos-guararapes-6",
          "nome": "Fernando da Silva Alves",
          "setor": "Motorista",
          "bairro": "Engenho Velho",
          "contato": "+55 81 9644-4777"
        },
        {
          "id": "jaboatao-dos-guararapes-4",
          "nome": "Itamar Alves Gadelha",
          "setor": "Gerente de Gestão de Pessoas",
          "bairro": "Candeias",
          "contato": "+55 81 98600-7803"
        },
        {
          "id": "jaboatao-dos-guararapes-7",
          "nome": "Kerollen Virginia",
          "setor": "Técnico Admnistrativo",
          "bairro": "Guararapes",
          "contato": "+55 81 8605-8559"
        },
        {
          "id": "jaboatao-dos-guararapes-2",
          "nome": "Paloma souza",
          "setor": "Assessor Administrativo",
          "bairro": "Candeias",
          "contato": "+55 81 9950-2961"
        },
        {
          "id": "jaboatao-dos-guararapes-13",
          "nome": "Rayssa Nascimento",
          "setor": "Assessor Administrativo",
          "bairro": "Zumbi do Pacheco",
          "contato": "+55 81 8760-1697"
        },
        {
          "id": "jaboatao-dos-guararapes-11",
          "nome": "Samara Gomes",
          "setor": "GERAI",
          "bairro": "Santana",
          "contato": "+55 81 8876-4922"
        },
        {
          "id": "jaboatao-dos-guararapes-1",
          "nome": "Thayanne Melo",
          "setor": "GEFSP E GEFV",
          "bairro": "Cajueiro Seco",
          "contato": "+55 81 8272-8837"
        }
      ]
    },
    {
      "id": "jaqueira",
      "nome": "Jaqueira",
      "mesorregiao": "Zona da Mata",
      "totalMilitantes": 1,
      "percentualMilitantes": 2.3,
      "topBairros": [
        {
          "bairro": "Frei caneca",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "jaqueira-1",
          "nome": "Carlos Vital",
          "setor": "Motorista",
          "bairro": "Frei caneca",
          "contato": "+55 81 8572-8401"
        }
      ]
    },
    {
      "id": "manari",
      "nome": "Manari",
      "mesorregiao": "Sertão",
      "totalMilitantes": 1,
      "percentualMilitantes": 2.3,
      "topBairros": [
        {
          "bairro": "Centro",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "manari-1",
          "nome": "Fabiana Neto",
          "setor": "Coordenadora Regional do Sertão do Moxotó",
          "bairro": "Centro",
          "contato": "+55 87 9144-2073"
        }
      ]
    },
    {
      "id": "olinda",
      "nome": "Olinda",
      "mesorregiao": "RMR",
      "totalMilitantes": 16,
      "percentualMilitantes": 37.2,
      "topBairros": [
        {
          "bairro": "Rio Doce",
          "militantes": 3
        },
        {
          "bairro": "Casa Caiada",
          "militantes": 2
        },
        {
          "bairro": "Jardim Fragoso",
          "militantes": 2
        },
        {
          "bairro": "Ouro Preto",
          "militantes": 2
        },
        {
          "bairro": "Aguazinha",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "olinda-10",
          "nome": "Ana Paula",
          "setor": "Psicóloga",
          "bairro": "Jardim Fragoso",
          "contato": "+55 81 8422-8338"
        },
        {
          "id": "olinda-7",
          "nome": "Anielle Souza",
          "setor": "CAJ",
          "bairro": "Casa Caiada",
          "contato": "+55 81 8224-7054"
        },
        {
          "id": "olinda-2",
          "nome": "Daniele Souza",
          "setor": "DEVG 190",
          "bairro": "Bairro Novo",
          "contato": "+55 81 9488-3535"
        },
        {
          "id": "olinda-1",
          "nome": "Eduardo Florêncio",
          "setor": "Manutenção Predial",
          "bairro": "Aguazinha",
          "contato": "+55 81 9674-0834 / +55 81 8579-6953"
        },
        {
          "id": "olinda-4",
          "nome": "Elimarcos cordeiro",
          "setor": "Supervisão -1",
          "bairro": "Caixa D´agua",
          "contato": "+55 81 8484-7320"
        },
        {
          "id": "olinda-14",
          "nome": "Gisele Maria Ramos",
          "setor": "Assessor Administrativo",
          "bairro": "Rio Doce",
          "contato": "+55 81 9332-8771"
        },
        {
          "id": "olinda-3",
          "nome": "Inês Tenório",
          "setor": "Gerente de Articulação e Interiorização das Ações de Gênero",
          "bairro": "Bom Sucesso",
          "contato": "+55 81 9647-1372"
        },
        {
          "id": "olinda-11",
          "nome": "Jady Santos",
          "setor": "Assessor Administrativo",
          "bairro": "Ouro Preto",
          "contato": "+55 81 8466-6146"
        },
        {
          "id": "olinda-12",
          "nome": "Jana Cruz",
          "setor": "Governanta",
          "bairro": "Ouro Preto",
          "contato": "+55 81 8969-0804"
        },
        {
          "id": "olinda-15",
          "nome": "Janaína Ribeiro",
          "setor": "GEFSP E GEFV",
          "bairro": "Rio Doce",
          "contato": "55 81 9978-6344"
        },
        {
          "id": "olinda-9",
          "nome": "Juliene Henrique",
          "setor": "Assessor Administrativo",
          "bairro": "Jardim Fragoso",
          "contato": "+55 81 8825-8774"
        },
        {
          "id": "olinda-6",
          "nome": "Mônica Costa",
          "setor": "Assessor Administrativo",
          "bairro": "Casa Caiada",
          "contato": "+55 81 8290-5678"
        },
        {
          "id": "olinda-8",
          "nome": "Ozimilis de Souza Silva",
          "setor": "Motorista",
          "bairro": "Jardim Atlântico",
          "contato": "+55 81 9412-3016"
        },
        {
          "id": "olinda-16",
          "nome": "Paulo Tadeu",
          "setor": "Motorista",
          "bairro": "Rio Doce",
          "contato": "+55 81 8838-6532"
        },
        {
          "id": "olinda-5",
          "nome": "Roberta Peregrino",
          "setor": "GERAI",
          "bairro": "Carmo",
          "contato": "+55 81 98409-8289"
        },
        {
          "id": "olinda-13",
          "nome": "Selence Correia",
          "setor": "DIPLAG",
          "bairro": "Peixinhos",
          "contato": "+55 81 9852-9225"
        }
      ]
    },
    {
      "id": "paulista",
      "nome": "Paulista",
      "mesorregiao": "RMR",
      "totalMilitantes": 10,
      "percentualMilitantes": 23.3,
      "topBairros": [
        {
          "bairro": "Centro",
          "militantes": 2
        },
        {
          "bairro": "Maranguape 1",
          "militantes": 2
        },
        {
          "bairro": "Arthur Lundgren 1",
          "militantes": 1
        },
        {
          "bairro": "Janga",
          "militantes": 1
        },
        {
          "bairro": "Maranguape 2",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "paulista-5",
          "nome": "Amadeu Barros",
          "setor": "DIPLAG",
          "bairro": "Maranguape 1",
          "contato": "+55 81 9603-8868"
        },
        {
          "id": "paulista-10",
          "nome": "Andreza K. Passos",
          "setor": "Técnico Admnistrativo",
          "bairro": "Pau amarelo",
          "contato": "+55 81 8308-8430"
        },
        {
          "id": "paulista-4",
          "nome": "Aristóteles Marques Cavalcanti da Silva",
          "setor": "DIPLAG",
          "bairro": "Janga",
          "contato": "+55 81 8319-8590"
        },
        {
          "id": "paulista-8",
          "nome": "Cadidja Galvão",
          "setor": "Gestora dos Serviços de Acolhimento",
          "bairro": "Maranguape I",
          "contato": "+55 81 8562-1822"
        },
        {
          "id": "paulista-6",
          "nome": "David Augusto",
          "setor": "Manutenção Predial",
          "bairro": "Maranguape 1",
          "contato": "+55 81 9628-1697"
        },
        {
          "id": "paulista-2",
          "nome": "Elyziana Machado",
          "setor": "Chefe de Gabinete",
          "bairro": "Centro",
          "contato": "+55 81 9471-6607"
        },
        {
          "id": "paulista-3",
          "nome": "Gilberlania santos",
          "setor": "GERAI",
          "bairro": "Centro",
          "contato": "+55 81 8435-0533"
        },
        {
          "id": "paulista-7",
          "nome": "Marcelino Albuquerque",
          "setor": "DIPLAG",
          "bairro": "Maranguape 2",
          "contato": "+55 81 8345-7619"
        },
        {
          "id": "paulista-1",
          "nome": "Mary Araújo",
          "setor": "GERAI",
          "bairro": "Arthur Lundgren 1",
          "contato": "+55 81 8840-2846"
        },
        {
          "id": "paulista-9",
          "nome": "Samuel Santos",
          "setor": "DIPLAG",
          "bairro": "Pau Amarelo",
          "contato": "+55 81 9807-5027"
        }
      ]
    },
    {
      "id": "recife",
      "nome": "Recife",
      "mesorregiao": "RMR",
      "totalMilitantes": 43,
      "percentualMilitantes": 100,
      "topBairros": [
        {
          "bairro": "Boa Viagem",
          "militantes": 4
        },
        {
          "bairro": "Campo Grande",
          "militantes": 3
        },
        {
          "bairro": "Iputinga",
          "militantes": 3
        },
        {
          "bairro": "Aflitos",
          "militantes": 2
        },
        {
          "bairro": "Afogados",
          "militantes": 2
        }
      ],
      "pessoas": [
        {
          "id": "recife-11",
          "nome": "Amanda Valença",
          "setor": "Secretária da Mulher",
          "bairro": "Boa Viagem",
          "contato": "+55 81 7318-0700"
        },
        {
          "id": "recife-18",
          "nome": "Ana Paula",
          "setor": "Assessora Especial de Controle Interno",
          "bairro": "Campo Grande",
          "contato": "+55 81 8798-5277"
        },
        {
          "id": "recife-37",
          "nome": "Ana Régia",
          "setor": "Gestora de Trabalho e Renda",
          "bairro": "Pina",
          "contato": "+55 81 8795-6671"
        },
        {
          "id": "recife-9",
          "nome": "Aurora sec mulher",
          "setor": "DIPLAG",
          "bairro": "Boa Viagem",
          "contato": "+55 81 9503-1403"
        },
        {
          "id": "recife-23",
          "nome": "Carolina Cabral",
          "setor": "Assessor Administrativo",
          "bairro": "Cordeiro",
          "contato": "+55 81 9179-5353"
        },
        {
          "id": "recife-17",
          "nome": "Cláudio Soares",
          "setor": "Motorista",
          "bairro": "Brejo da Guabiraba",
          "contato": "+55 81 9626-4172"
        },
        {
          "id": "recife-24",
          "nome": "Débora Eloy",
          "setor": "Assessor Administrativo",
          "bairro": "Cordeiro",
          "contato": "+55 81 9755-3936"
        },
        {
          "id": "recife-15",
          "nome": "Dioógenes Tavares",
          "setor": "GERAI",
          "bairro": "Bongi",
          "contato": "+55 81 99827-0414"
        },
        {
          "id": "recife-35",
          "nome": "Ericka Tatiane",
          "setor": "CAJ",
          "bairro": "Nova descoberta",
          "contato": "55 81 984697962"
        },
        {
          "id": "recife-19",
          "nome": "Gabi Cavalcante",
          "setor": "Assistente de Gerência",
          "bairro": "Campo Grande",
          "contato": "+55 81 9788-5454"
        },
        {
          "id": "recife-25",
          "nome": "Gabriela Amazonas",
          "setor": "GEFSP E GEFV",
          "bairro": "Encruzilhada",
          "contato": "+55 81 9218-8241"
        },
        {
          "id": "recife-7",
          "nome": "Gilvan Araújo",
          "setor": "Assessor Administrativo",
          "bairro": "Boa viagem",
          "contato": "+55 81 8940-5198"
        },
        {
          "id": "recife-28",
          "nome": "Giselly Costa",
          "setor": "Gestora do Serviço de Proteção",
          "bairro": "Ipsep",
          "contato": "+55 81 8846-5801"
        },
        {
          "id": "recife-29",
          "nome": "Gleyci Santos",
          "setor": "DIPLAG",
          "bairro": "Iputinga",
          "contato": "+55 81 9648-0145"
        },
        {
          "id": "recife-10",
          "nome": "Heliana",
          "setor": "GERAI",
          "bairro": "Boa Viagem",
          "contato": "+55 81 8400-1400"
        },
        {
          "id": "recife-2",
          "nome": "Ianne Galvão",
          "setor": "DIPLAG",
          "bairro": "Aflitos",
          "contato": "+55 87 9116-0450"
        },
        {
          "id": "recife-6",
          "nome": "Ingrid de Paula",
          "setor": "GEFSP E GEFV",
          "bairro": "Arruda",
          "contato": "+55 81 8514-2291"
        },
        {
          "id": "recife-26",
          "nome": "Iris Pessoa Cavalcanti",
          "setor": "Assessora de Gerência",
          "bairro": "Engenho do Meio",
          "contato": "+55 81 8771-1294"
        },
        {
          "id": "recife-34",
          "nome": "Isaias Luiz",
          "setor": "Supervisão -1",
          "bairro": "Macaxeira",
          "contato": "+55 81 9973-7998"
        },
        {
          "id": "recife-5",
          "nome": "Jefferson Ferreira",
          "setor": "Motorista",
          "bairro": "Areias",
          "contato": "+55 81 8612-7325"
        },
        {
          "id": "recife-13",
          "nome": "Jemarryr Cardoso",
          "setor": "GEFSP E GEFV",
          "bairro": "Boa Vista",
          "contato": "+55 81 99281-7857"
        },
        {
          "id": "recife-14",
          "nome": "Jemarryr santos",
          "setor": "Técnico Admnistrativo",
          "bairro": "Boa vista",
          "contato": "+55 81 9395-8754"
        },
        {
          "id": "recife-8",
          "nome": "Josi Barbosa Marins",
          "setor": "Assessora Técnica de Comunicação Social e Imprensa",
          "bairro": "Boa Viagem",
          "contato": "+55 81 9212-2070"
        },
        {
          "id": "recife-38",
          "nome": "Jucelio Felix",
          "setor": "Motorista",
          "bairro": "Pina",
          "contato": "+55 81 9641-5285"
        },
        {
          "id": "recife-39",
          "nome": "Luan Lourivan da Silva",
          "setor": "Assessor Especial",
          "bairro": "Santo Antônio",
          "contato": "+55 81 9485-6557"
        },
        {
          "id": "recife-21",
          "nome": "Luciane Candeas",
          "setor": "DIPLAG",
          "bairro": "Casa Amarela",
          "contato": "+55 81 9988-9131"
        },
        {
          "id": "recife-20",
          "nome": "Manuela Rodrigues",
          "setor": "DIPLAG",
          "bairro": "Campo Grande",
          "contato": "+55 81 9630-4879"
        },
        {
          "id": "recife-31",
          "nome": "Maria José Ferreira",
          "setor": "Assessora Administrativa",
          "bairro": "Iputinga",
          "contato": "+55 81 8624-4473"
        },
        {
          "id": "recife-1",
          "nome": "Maria Miranda",
          "setor": "Assessora de Diretoria",
          "bairro": "Aflitos",
          "contato": "+55 81 9269-9177"
        },
        {
          "id": "recife-12",
          "nome": "Marielse Fortes",
          "setor": "Assessor Administrativo",
          "bairro": "Boa vista",
          "contato": "+55 81 9918-7119"
        },
        {
          "id": "recife-43",
          "nome": "Marinalva Alves de Azevedo",
          "setor": "Técnico Admnistrativo",
          "bairro": "Zumbi",
          "contato": "+55 81 9166-3433"
        },
        {
          "id": "recife-16",
          "nome": "Nathalia Sandes",
          "setor": "GERAI",
          "bairro": "Bongi",
          "contato": "+55 81 9730-1800"
        },
        {
          "id": "recife-27",
          "nome": "Patricia de Paula",
          "setor": "DIPLAG",
          "bairro": "Espinheiro",
          "contato": "+55 81 9122-9630"
        },
        {
          "id": "recife-22",
          "nome": "Raquel Vilela Rizuto Cadena",
          "setor": "DIPLAG",
          "bairro": "Casa Amarela",
          "contato": "+55 81 9614-5998"
        },
        {
          "id": "recife-33",
          "nome": "Rayane Stefane",
          "setor": "DIPLAG",
          "bairro": "Joana Bezerra",
          "contato": "+55 81 99810-5774"
        },
        {
          "id": "recife-40",
          "nome": "Renata Crestine Espindola",
          "setor": "Coordenadora Regional Metropolitana",
          "bairro": "Tamarineira",
          "contato": "+55 81 9569-0806"
        },
        {
          "id": "recife-32",
          "nome": "Severino dos Ramos de Souza",
          "setor": "Motorista",
          "bairro": "Jardim São Paulo",
          "contato": "+55 81 8594-8914"
        },
        {
          "id": "recife-30",
          "nome": "Thais SEC MILJERY",
          "setor": "Gestora de Justiça e Segurança",
          "bairro": "Iputinga",
          "contato": "+55 81 9824-4801"
        },
        {
          "id": "recife-3",
          "nome": "Vera Maria de Moura",
          "setor": "Assessor Administrativo",
          "bairro": "Afogados",
          "contato": "+55 81 8321-5021"
        },
        {
          "id": "recife-42",
          "nome": "Vitotia Silva",
          "setor": "DIPLAG",
          "bairro": "Várzea",
          "contato": "+55 81 9326-9320"
        },
        {
          "id": "recife-41",
          "nome": "Wanildo Neto",
          "setor": "DIPLAG",
          "bairro": "Torre",
          "contato": "55 81 8105-7308"
        },
        {
          "id": "recife-36",
          "nome": "Willamis Manoel",
          "setor": "Motorista",
          "bairro": "Nova descoberta",
          "contato": "+55 81 9576-4140"
        },
        {
          "id": "recife-4",
          "nome": "Wilza Ribeiro",
          "setor": "DIPLAG",
          "bairro": "Afogados",
          "contato": "+55 81 9556-2283"
        }
      ]
    },
    {
      "id": "sao-lourenco-da-mata",
      "nome": "São Lourenço da Mata",
      "mesorregiao": "RMR",
      "totalMilitantes": 2,
      "percentualMilitantes": 4.7,
      "topBairros": [
        {
          "bairro": "Muribara",
          "militantes": 1
        },
        {
          "bairro": "Parque Capibaribe",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "sao-lourenco-da-mata-1",
          "nome": "Elaine Lima",
          "setor": "DIPLAG",
          "bairro": "Muribara",
          "contato": "+55 81 8877-1051"
        },
        {
          "id": "sao-lourenco-da-mata-2",
          "nome": "Rafael Azevedo",
          "setor": "DIPLAG",
          "bairro": "Parque Capibaribe",
          "contato": "+55 81 9643-2244"
        }
      ]
    },
    {
      "id": "serra-talhada",
      "nome": "Serra Talhada",
      "mesorregiao": "Sertão",
      "totalMilitantes": 2,
      "percentualMilitantes": 4.7,
      "topBairros": [
        {
          "bairro": "AABB",
          "militantes": 1
        },
        {
          "bairro": "José Rufino alves",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "serra-talhada-2",
          "nome": "Hemerson Souza",
          "setor": "Motorista",
          "bairro": "José Rufino alves",
          "contato": "+55 87 9995-3902"
        },
        {
          "id": "serra-talhada-1",
          "nome": "Maria Rosineide da Silva",
          "setor": "Coordenadora Regional do Sertão do Pajeú",
          "bairro": "AABB",
          "contato": "+55 87 8877-0734"
        }
      ]
    }
  ],
  "pendencias": []
}
