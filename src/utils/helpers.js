// Funções utilitárias compartilhadas pelos componentes do painel.

export function mascararNome(nomeCompleto) {
  return nomeCompleto
    .split(' ')
    .filter(Boolean)
    .map((parte) => `${parte[0].toUpperCase()}.`)
    .join('')
}

export function mascararContato(contato) {
  return contato.replace(/\d(?=\d{2})/g, '•')
}

export function formatarNumero(valor) {
  return valor.toLocaleString('pt-BR')
}

export function nivelEngajamento(percentual) {
  if (percentual >= 80) return 'Alto'
  if (percentual >= 50) return 'Médio'
  return 'Baixo'
}

export const CORES_ENGAJAMENTO = {
  Alto: { texto: 'text-emerald-700', fundo: 'bg-emerald-50', ponto: 'bg-emerald-500', borda: 'border-emerald-200' },
  Médio: { texto: 'text-amber-700', fundo: 'bg-amber-50', ponto: 'bg-amber-500', borda: 'border-amber-200' },
  Baixo: { texto: 'text-rose-700', fundo: 'bg-rose-50', ponto: 'bg-rose-500', borda: 'border-rose-200' },
}

// Interpola entre o roxo mais claro e o roxo institucional mais profundo
// conforme o percentual de militância — usado no mapa (coroplético) e legendas.
export function escalaRoxo(percentual) {
  const clamped = Math.max(0, Math.min(100, percentual))
  const paradas = [
    { p: 0, cor: [237, 233, 254] },   // roxo quase branco
    { p: 40, cor: [216, 180, 254] },  // roxo claro
    { p: 70, cor: [147, 51, 234] },   // roxo vibrante
    { p: 100, cor: [91, 33, 182] },   // roxo profundo institucional
  ]
  let inicio = paradas[0]
  let fim = paradas[paradas.length - 1]
  for (let i = 0; i < paradas.length - 1; i++) {
    if (clamped >= paradas[i].p && clamped <= paradas[i + 1].p) {
      inicio = paradas[i]
      fim = paradas[i + 1]
      break
    }
  }
  const faixa = fim.p - inicio.p || 1
  const t = (clamped - inicio.p) / faixa
  const rgb = inicio.cor.map((c, i) => Math.round(c + (fim.cor[i] - c) * t))
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}

export function raioPorMilitantes(total, min = 6, max = 22) {
  // Escala em raiz quadrada para evitar que municípios grandes dominem visualmente.
  const maior = 2500
  const escala = Math.sqrt(total / maior)
  return Math.max(min, Math.min(max, min + escala * (max - min) * 2))
}
