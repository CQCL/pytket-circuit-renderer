import '../src/theme.scss'
import '../src/themeVariables.scss'
import { setup } from '@storybook/vue3'

export const parameters = {
}

setup((app) => {
  // temp config to allow inject/provide to use computed properties
  app.config.unwrapInjectedRef = true
})
