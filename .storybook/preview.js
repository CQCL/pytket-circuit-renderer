import '../src/theme.scss'
import { app } from '@storybook/vue3'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  }
}

app.config.unwrapInjectedRef = true // temp config to allow inject/provide to use computed properties
