// Design Tokens para Agentes de Conversão
export * from './colors'
export * from './typography'
export * from './spacing'
export * from './animations'
export * from './shadows'
export * from './breakpoints'

// Tema completo
export const theme = {
  colors: require('./colors'),
  typography: require('./typography'),
  spacing: require('./spacing'),
  animations: require('./animations'),
  shadows: require('./shadows'),
  breakpoints: require('./breakpoints')
} as const
