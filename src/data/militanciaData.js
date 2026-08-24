// ============================================================================
// MILITANCIA_DATA — SecMulher-PE · Painel de Mapeamento de Militância
// ----------------------------------------------------------------------------
// Gerado por scripts/build-militancia-data.mjs — não editar manualmente.
// Fontes (src/data/militancia/):
//   - contatos.csv                                       nome + número
//   - LISTAGEM SECMULHER VOLUNTÁRIOS.xlsx                 setor + bairro/município
//   - Planilha_Relacao_de_Pessoal_20_08_2026_AMANDA_02.xlsx  fallback de
//     bairro/município (endereço) e cargo, usado só quando a pessoa não
//     aparece na LISTAGEM.
// Cruzamento feito pelos 8 últimos dígitos do telefone. Todo mundo que tem
// nome entra na base — quem não teve município identificável em nenhuma das
// três fontes vai para MILITANCIA_DATA.pendencias (lista de quem precisa ser
// contatado para completar bairro/setor) em vez de ser descartado.
//
// Para atualizar: substitua os arquivos-fonte e rode
//   node scripts/build-militancia-data.mjs
// ============================================================================

export const MILITANCIA_DATA = {
  "metadata": {
    "orgao": "Secretaria da Mulher de Pernambuco (SecMulher-PE)",
    "painel": "Mapeamento de Militância e Presença Territorial",
    "ultimaAtualizacao": "2026-08-20",
    "modo": "producao"
  },
  "kpis": {
    "totalMilitantes": 129,
    "coberturaMunicipal": {
      "atual": 15,
      "total": 184
    },
    "setoresMapeados": 30,
    "bairrosMapeados": 45
  },
  "mesorregioes": [
    "RMR",
    "Sertão",
    "Agreste",
    "Zona da Mata"
  ],
  "setores": [
    "Assessor Especial",
    "Assessora de Diretoria",
    "Assessora de Gerência",
    "Assessora de Política da Saúde da Mulher",
    "Assessora Especial de Controle Interno",
    "Assessora Técnica de Comunicação Social e Imprensa",
    "Assistente de Gerência",
    "CAJ",
    "Cooordenadora Adjunta de Controla Interno",
    "Coordenadora Regional da Mata Sul",
    "Coordenadora Regional do Agreste Central",
    "Coordenadora Regional do Agreste Meridional",
    "Coordenadora Regional do Agreste Setentrional",
    "Coordenadora Regional do Sertão do Moxotó",
    "Coordenadora Regional Metropolitana",
    "DIPLAG",
    "Diretora de Enfrentamento a Violência de Gênero",
    "GEFSP E GEFV",
    "GERAI",
    "Gerente de Articulação e Interiorização das Ações de Gênero",
    "Gerente de Gestão de Pessoas",
    "Gestora de Articulação e Gestão ao Gabinete da Secretária",
    "Gestora de Justiça e Segurança",
    "Gestora de Trabalho e Renda",
    "Gestora do Serviço de Proteção",
    "Gestora dos Serviços de Acolhimento",
    "Ouvidora da Mulher",
    "Secretária da Mulher",
    "Secretária Executiva de Política para as Mulheres",
    "Supervisão -1"
  ],
  "municipios": [
    {
      "id": "agua-preta",
      "nome": "Água Preta",
      "mesorregiao": "Zona da Mata",
      "totalMilitantes": 1,
      "percentualMilitantes": 3.4,
      "topBairros": [
        {
          "bairro": "Cohab",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "agua-preta-1",
          "nome": "magalruiva",
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
      "totalMilitantes": 2,
      "percentualMilitantes": 6.9,
      "topBairros": [
        {
          "bairro": "Ponte dos Carvalhos",
          "militantes": 1
        },
        {
          "bairro": "Vila Dr. Manoel Clementino",
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
          "nome": "Walkiria Alves",
          "setor": "Secretária Executiva de Política para as Mulheres",
          "bairro": "Vila Dr. Manoel Clementino",
          "contato": "+55 81 9302-7768"
        }
      ]
    },
    {
      "id": "carpina",
      "nome": "Carpina",
      "mesorregiao": "Zona da Mata",
      "totalMilitantes": 1,
      "percentualMilitantes": 3.4,
      "topBairros": [],
      "pessoas": [
        {
          "id": "carpina-1",
          "nome": "Aline Venancio",
          "setor": "CAJ",
          "bairro": null,
          "contato": null
        }
      ]
    },
    {
      "id": "caruaru",
      "nome": "Caruaru",
      "mesorregiao": "Agreste",
      "totalMilitantes": 3,
      "percentualMilitantes": 10.3,
      "topBairros": [
        {
          "bairro": "Idianópolis",
          "militantes": 1
        },
        {
          "bairro": "Indianapolis",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "caruaru-1",
          "nome": "Erisson",
          "setor": "DIPLAG",
          "bairro": "Indianapolis",
          "contato": "+55 81 9653-4040"
        },
        {
          "id": "caruaru-2",
          "nome": "Rafaella Santos",
          "setor": "Coordenadora Regional do Agreste Setentrional",
          "bairro": "Idianópolis",
          "contato": "+55 81 9440-4019"
        },
        {
          "id": "caruaru-3",
          "nome": "Samara Ramos",
          "setor": "GERAI",
          "bairro": null,
          "contato": "+55 81 8208-5891"
        }
      ]
    },
    {
      "id": "garanhuns",
      "nome": "Garanhuns",
      "mesorregiao": "Agreste",
      "totalMilitantes": 1,
      "percentualMilitantes": 3.4,
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
      "percentualMilitantes": 3.4,
      "topBairros": [
        {
          "bairro": "Prado",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "gravata-1",
          "nome": "Poliana",
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
      "percentualMilitantes": 3.4,
      "topBairros": [
        {
          "bairro": "Centro",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "igarassu-1",
          "nome": "Ewelin SecMulher",
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
      "percentualMilitantes": 3.4,
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
      "percentualMilitantes": 3.4,
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
      "totalMilitantes": 6,
      "percentualMilitantes": 20.7,
      "topBairros": [
        {
          "bairro": "Cajueiro Seco",
          "militantes": 1
        },
        {
          "bairro": "Candeias",
          "militantes": 1
        },
        {
          "bairro": "Piedade",
          "militantes": 1
        },
        {
          "bairro": "Santana",
          "militantes": 1
        },
        {
          "bairro": "Socorro",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "jaboatao-dos-guararapes-2",
          "nome": "Ana Loyo",
          "setor": "Cooordenadora Adjunta de Controla Interno",
          "bairro": "Piedade",
          "contato": "+55 81 9186-8665"
        },
        {
          "id": "jaboatao-dos-guararapes-3",
          "nome": "Betania Soares",
          "setor": "GEFSP E GEFV",
          "bairro": "Socorro",
          "contato": "+55 81 9219-5808"
        },
        {
          "id": "jaboatao-dos-guararapes-4",
          "nome": "Edinalva",
          "setor": "Assessora de Diretoria",
          "bairro": null,
          "contato": "+55 81 8758-1911"
        },
        {
          "id": "jaboatao-dos-guararapes-1",
          "nome": "RH",
          "setor": "Gerente de Gestão de Pessoas",
          "bairro": "Candeias",
          "contato": "+5581986007803"
        },
        {
          "id": "jaboatao-dos-guararapes-5",
          "nome": "Samara Gomes",
          "setor": "GERAI",
          "bairro": "Santana",
          "contato": "+55 81 8876-4922"
        },
        {
          "id": "jaboatao-dos-guararapes-6",
          "nome": "thay",
          "setor": "GEFSP E GEFV",
          "bairro": "Cajueiro Seco",
          "contato": "+55 81 8272-8837"
        }
      ]
    },
    {
      "id": "manari",
      "nome": "Manari",
      "mesorregiao": "Sertão",
      "totalMilitantes": 1,
      "percentualMilitantes": 3.4,
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
      "totalMilitantes": 5,
      "percentualMilitantes": 17.2,
      "topBairros": [
        {
          "bairro": "Bom Sucesso",
          "militantes": 1
        },
        {
          "bairro": "Caixa D´agua",
          "militantes": 1
        },
        {
          "bairro": "Peixinhos",
          "militantes": 1
        },
        {
          "bairro": "Rio Doce",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "olinda-2",
          "nome": "elimarcos cordeiro",
          "setor": "Supervisão -1",
          "bairro": "Caixa D´agua",
          "contato": "+55 81 8484-7320"
        },
        {
          "id": "olinda-3",
          "nome": "Espaço Reluz",
          "setor": "GERAI",
          "bairro": null,
          "contato": "+55 81 8409-8289"
        },
        {
          "id": "olinda-4",
          "nome": "Inês Tenório",
          "setor": "Gerente de Articulação e Interiorização das Ações de Gênero",
          "bairro": "Bom Sucesso",
          "contato": "+55 81 9647-1372"
        },
        {
          "id": "olinda-5",
          "nome": "Janaína Ribeiro",
          "setor": "GEFSP E GEFV",
          "bairro": "Rio Doce",
          "contato": null
        },
        {
          "id": "olinda-1",
          "nome": "Selene sec mulher",
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
      "percentualMilitantes": 34.5,
      "topBairros": [
        {
          "bairro": "Centro",
          "militantes": 2
        },
        {
          "bairro": "Arthur Lundreg",
          "militantes": 1
        },
        {
          "bairro": "Jaguarana",
          "militantes": 1
        },
        {
          "bairro": "Janga",
          "militantes": 1
        },
        {
          "bairro": "Maranguape 1",
          "militantes": 1
        }
      ],
      "pessoas": [
        {
          "id": "paulista-1",
          "nome": "Amadeu",
          "setor": "DIPLAG",
          "bairro": "Maranguape 1",
          "contato": "+55 81 9603-8868"
        },
        {
          "id": "paulista-5",
          "nome": "Anna Clara",
          "setor": "GERAI",
          "bairro": "Arthur Lundreg",
          "contato": "+55 81 9636-2930"
        },
        {
          "id": "paulista-6",
          "nome": "Ari",
          "setor": "DIPLAG",
          "bairro": "Janga",
          "contato": "+55 81 8319-8590"
        },
        {
          "id": "paulista-4",
          "nome": "Cadidja Galvão",
          "setor": "Gestora dos Serviços de Acolhimento",
          "bairro": "Maranguape I",
          "contato": "+55 81 8562-1822"
        },
        {
          "id": "paulista-2",
          "nome": "Eli secmulher",
          "setor": "Gestora de Articulação e Gestão ao Gabinete da Secretária",
          "bairro": "Centro",
          "contato": "+55 81 9471-6607"
        },
        {
          "id": "paulista-7",
          "nome": "gilberlania santos",
          "setor": "GERAI",
          "bairro": "Centro",
          "contato": "+55 81 8435-0533"
        },
        {
          "id": "paulista-8",
          "nome": "Gledsa Alves",
          "setor": "Assistente de Gerência",
          "bairro": "Jaguarana",
          "contato": "+55 81 8862-2609"
        },
        {
          "id": "paulista-9",
          "nome": "Marcelino Albuquerque",
          "setor": "DIPLAG",
          "bairro": "Maranguape 2",
          "contato": "+55 81 8345-7619"
        },
        {
          "id": "paulista-10",
          "nome": "Mary Araújo",
          "setor": "GERAI",
          "bairro": null,
          "contato": "+55 81 8840-2846"
        },
        {
          "id": "paulista-3",
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
      "totalMilitantes": 29,
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
          "bairro": "Aflitos",
          "militantes": 2
        },
        {
          "bairro": "Bongi",
          "militantes": 2
        },
        {
          "bairro": "Casa Amarela",
          "militantes": 2
        }
      ],
      "pessoas": [
        {
          "id": "recife-1",
          "nome": "Amanda Valença",
          "setor": "Secretária da Mulher",
          "bairro": "Boa Viagem",
          "contato": "+55 81 7318-0700"
        },
        {
          "id": "recife-2",
          "nome": "Ana Paula",
          "setor": "Assessora Especial de Controle Interno",
          "bairro": "Campo Grande",
          "contato": "+55 81 8798-5277"
        },
        {
          "id": "recife-14",
          "nome": "Ana Régia",
          "setor": "Gestora de Trabalho e Renda",
          "bairro": "Pina",
          "contato": "+55 81 8795-6671"
        },
        {
          "id": "recife-3",
          "nome": "Aurora sec mulher",
          "setor": "DIPLAG",
          "bairro": "Boa Viagem",
          "contato": "+55 81 9503-1403"
        },
        {
          "id": "recife-27",
          "nome": "Dioógenes Tavares",
          "setor": "GERAI",
          "bairro": "Bongi",
          "contato": "+55 81 99827-0414"
        },
        {
          "id": "recife-15",
          "nome": "Gabi Cavalcante",
          "setor": "Assistente de Gerência",
          "bairro": "Campo Grande",
          "contato": "+55 81 9788-5454"
        },
        {
          "id": "recife-16",
          "nome": "Gabriela Amazonas",
          "setor": "GEFSP E GEFV",
          "bairro": "Encruzilhada",
          "contato": "+55 81 9218-8241"
        },
        {
          "id": "recife-17",
          "nome": "Giselly Costa",
          "setor": "Gestora do Serviço de Proteção",
          "bairro": "Ipsep",
          "contato": "+55 81 8846-5801"
        },
        {
          "id": "recife-18",
          "nome": "Gleyci Santos",
          "setor": "DIPLAG",
          "bairro": "Iputinga",
          "contato": "+55 81 9648-0145"
        },
        {
          "id": "recife-4",
          "nome": "Ianne Galvão",
          "setor": "DIPLAG",
          "bairro": "Aflitos",
          "contato": "+55 87 9116-0450"
        },
        {
          "id": "recife-19",
          "nome": "Ingrid de Paula",
          "setor": "GEFSP E GEFV",
          "bairro": "Arruda",
          "contato": "+55 81 8514-2291"
        },
        {
          "id": "recife-5",
          "nome": "Iris",
          "setor": "Assessora de Gerência",
          "bairro": "Engenho do Meio",
          "contato": "+55 81 8771-1294"
        },
        {
          "id": "recife-20",
          "nome": "Isaias Luiz",
          "setor": "Supervisão -1",
          "bairro": "Macaxeira",
          "contato": "+55 81 9973-7998"
        },
        {
          "id": "recife-28",
          "nome": "Jemarryr Cardoso",
          "setor": "GEFSP E GEFV",
          "bairro": "Boa Vista",
          "contato": "+55 81 99281-7857"
        },
        {
          "id": "recife-6",
          "nome": "Josi Barbosa Marins Comunicacao Secmulher",
          "setor": "Assessora Técnica de Comunicação Social e Imprensa",
          "bairro": "Boa Viagem",
          "contato": "+55 81 9212-2070"
        },
        {
          "id": "recife-7",
          "nome": "Luan",
          "setor": "Assessor Especial",
          "bairro": "Santo Antônio",
          "contato": "+55 81 9485-6557"
        },
        {
          "id": "recife-8",
          "nome": "Lúcia SECMulher",
          "setor": "Ouvidora da Mulher",
          "bairro": "Torreão",
          "contato": "+55 81 8885-0633"
        },
        {
          "id": "recife-21",
          "nome": "Luciane Candeas",
          "setor": "DIPLAG",
          "bairro": "Casa Amarela",
          "contato": "+55 81 9988-9131"
        },
        {
          "id": "recife-9",
          "nome": "Manuela Rodrigues",
          "setor": "DIPLAG",
          "bairro": "Campo Grande",
          "contato": "+55 81 9630-4879"
        },
        {
          "id": "recife-22",
          "nome": "Maria Miranda (Naza)",
          "setor": "Assessora de Diretoria",
          "bairro": "Aflitos",
          "contato": "+55 81 9269-9177"
        },
        {
          "id": "recife-23",
          "nome": "Nathalia Sandes",
          "setor": "GERAI",
          "bairro": "Bongi",
          "contato": "+55 81 9730-1800"
        },
        {
          "id": "recife-10",
          "nome": "Neto SecMul",
          "setor": "DIPLAG",
          "bairro": "Torre",
          "contato": "+55 81 8105-7308"
        },
        {
          "id": "recife-24",
          "nome": "Patricia de Paula (Tita)",
          "setor": "DIPLAG",
          "bairro": "Espinheiro",
          "contato": "+55 81 9122-9630"
        },
        {
          "id": "recife-11",
          "nome": "Raquel",
          "setor": "DIPLAG",
          "bairro": "Casa Amarela",
          "contato": "+55 81 9614-5998"
        },
        {
          "id": "recife-29",
          "nome": "Rayane Stefane",
          "setor": "DIPLAG",
          "bairro": "Joana Bezerra",
          "contato": "+55 81 99810-5774"
        },
        {
          "id": "recife-25",
          "nome": "Renata Crestine Espindola",
          "setor": "Coordenadora Regional Metropolitana",
          "bairro": "Tamarineira",
          "contato": "+55 81 9569-0806"
        },
        {
          "id": "recife-12",
          "nome": "Thais SEC MILJERY",
          "setor": "Gestora de Justiça e Segurança",
          "bairro": "Iputinga",
          "contato": "+55 81 9824-4801"
        },
        {
          "id": "recife-26",
          "nome": "timesheliana",
          "setor": "GERAI",
          "bairro": "Boa Viagem",
          "contato": "+55 81 8400-1400"
        },
        {
          "id": "recife-13",
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
      "percentualMilitantes": 6.9,
      "topBairros": [],
      "pessoas": [
        {
          "id": "sao-lourenco-da-mata-1",
          "nome": "Elaine",
          "setor": "DIPLAG",
          "bairro": null,
          "contato": "+55 81 8877-1051"
        },
        {
          "id": "sao-lourenco-da-mata-2",
          "nome": "Rafael Azevedo",
          "setor": "DIPLAG",
          "bairro": null,
          "contato": "+55 81 9643-2244"
        }
      ]
    }
  ],
  "pendencias": [
    {
      "id": "pendencia-7",
      "nome": "Alanna Maria",
      "contato": "+55 81 8428-1105",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-8",
      "nome": "alice",
      "contato": "+55 81 8758-1780",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-9",
      "nome": "Amaro Santos",
      "contato": "+55 81 9836-7173",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-10",
      "nome": "Amor Só De Deus.",
      "contato": "+55 81 8579-6953",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-11",
      "nome": "Ana Nery Jesus Minha Luz",
      "contato": "+55 81 9695-8563",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-6",
      "nome": "Andreza K. Passos",
      "contato": "+55 81 8308-8430",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-1",
      "nome": "Anniele Souza",
      "contato": "+55 81 8224-7054",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-12",
      "nome": "Bruna",
      "contato": "+55 81 9976-8548",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-13",
      "nome": "carlos Vital",
      "contato": "+55 81 8572-8401",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-60",
      "nome": "Carol",
      "contato": "+55 81 9179-5353",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-14",
      "nome": "Cláudio Soares",
      "contato": "+55 81 9626-4172",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-15",
      "nome": "Cristóvão Fernandes",
      "contato": "+55 81 9774-4196",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-16",
      "nome": "Dani",
      "contato": "+55 81 9488-3535",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-17",
      "nome": "David Augusto",
      "contato": "+55 81 9628-1697",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-18",
      "nome": "Débora Eloy",
      "contato": "+55 81 9755-3936",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-19",
      "nome": "Deus é bom o tempo todo",
      "contato": "+55 81 8511-7883",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-20",
      "nome": "Edinéa Sousa",
      "contato": "+55 81 9950-8337",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-2",
      "nome": "Eduardo Lopes",
      "contato": "+55 81 9674-0834",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-21",
      "nome": "Eletrica Express",
      "contato": "+55 87 8167-6432",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-3",
      "nome": "Emony",
      "contato": "+55 81 9559-0311",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-22",
      "nome": "Fabi",
      "contato": "+55 81 8521-1341",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-23",
      "nome": "Família Cruz Pessoa",
      "contato": "+55 81 8969-0804",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-24",
      "nome": "Fernando",
      "contato": "+55 81 9644-4777",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-25",
      "nome": "Geny Dione maior é Deus",
      "contato": "+55 81 8355-8902",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-4",
      "nome": "Gil SecMulher",
      "contato": "+55 81 8940-5198",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-26",
      "nome": "Gilvan Barbara",
      "contato": "+55 81 9745-1438",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-27",
      "nome": "Girleide Maia",
      "contato": "+55 81 8684-4553",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-28",
      "nome": "Gisele",
      "contato": "+55 81 9332-8771",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-29",
      "nome": "Hemerson Souza",
      "contato": "+55 87 9995-3902",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-30",
      "nome": "Itamar",
      "contato": "+55 81 9700-1063",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-31",
      "nome": "Jady",
      "contato": "+55 81 8466-6146",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-5",
      "nome": "Jamerson Gomes",
      "contato": "+55 81 8861-8011",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-32",
      "nome": "Janaina",
      "contato": "+55 81 9978-6344",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-33",
      "nome": "Jefferson Ferreira",
      "contato": "+55 81 8612-7325",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-34",
      "nome": "Jemarryr santos",
      "contato": "+55 81 9395-8754",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-35",
      "nome": "Jucelio Felix",
      "contato": "+55 81 9641-5285",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-36",
      "nome": "Juliene Henrique",
      "contato": "+55 81 8825-8774",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-37",
      "nome": "Kerollen Virginia",
      "contato": "+55 81 8605-8559",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-38",
      "nome": "Marie",
      "contato": "+55 81 9918-7119",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-39",
      "nome": "Marinalva",
      "contato": "+55 81 9166-3433",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-40",
      "nome": "Martha Araújo",
      "contato": "+55 81 9837-3326",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-41",
      "nome": "Mazé",
      "contato": "+55 81 8624-4473",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-42",
      "nome": "MIRO SOUZA",
      "contato": "+55 81 9412-3016",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-43",
      "nome": "Mônica Costa",
      "contato": "+55 81 8290-5678",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-44",
      "nome": "Paloma souza",
      "contato": "+55 81 9950-2961",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-45",
      "nome": "Paola",
      "contato": "+55 81 8422-8338",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-46",
      "nome": "Patricia",
      "contato": "+55 81 8515-1850",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-47",
      "nome": "Paulo Tadeu",
      "contato": "+55 81 8838-6532",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-48",
      "nome": "Rayssa Nascimento",
      "contato": "+55 81 8760-1697",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-49",
      "nome": "renanwilma80@gmail.com",
      "contato": "+55 81 8549-3417",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-50",
      "nome": "Rose Silva",
      "contato": "+55 87 8877-0734",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-51",
      "nome": "Severino",
      "contato": "+55 81 8594-8914",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-52",
      "nome": "thamires",
      "contato": "+55 81 8894-4811",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-53",
      "nome": "Toninho",
      "contato": "+55 81 9576-4140",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-54",
      "nome": "valmir nestor",
      "contato": "+55 81 8795-3819",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-55",
      "nome": "Vera",
      "contato": "+55 81 8321-5021",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-56",
      "nome": "Verônica Pereira",
      "contato": "+55 81 8415-7185",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-57",
      "nome": "Vi",
      "contato": "+55 81 9326-9320",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-58",
      "nome": "Vinicius Ricardo",
      "contato": "+55 81 8802-7393",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-59",
      "nome": "Wanildo Pinto",
      "contato": "+55 81 9928-8111",
      "setor": null,
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-62",
      "nome": "Alina Roberta",
      "contato": null,
      "setor": "CAJ",
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-64",
      "nome": "Anielle Souza",
      "contato": null,
      "setor": "CAJ",
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-61",
      "nome": "Ericka Tatiane",
      "contato": null,
      "setor": "CAJ",
      "bairro": null,
      "municipio": null
    },
    {
      "id": "pendencia-63",
      "nome": "Maria Luiza",
      "contato": null,
      "setor": "CAJ",
      "bairro": null,
      "municipio": null
    }
  ]
}
