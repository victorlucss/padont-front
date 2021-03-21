import { createGlobalStyle } from 'styled-components'
import { colors } from './'

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${colors.black_dark};
    color: ${colors.white};
    font-family: 'Lato', sans-serif;
  }
`

export { GlobalStyle }
