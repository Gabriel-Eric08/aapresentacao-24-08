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
