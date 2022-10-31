/* global Cypress */
import './commands'
import { mount } from 'cypress/vue'
import 'vue/dist/vue.esm-bundler.js' // Required for mounting storybook components
import { setGlobalConfig } from '@storybook/testing-vue3'
import * as globalStorybookConfig from '../../.storybook/preview' // path of your preview.js file

setGlobalConfig(globalStorybookConfig)

// Cypress.Commands.add('mount', mount)

Cypress.Commands.add('mount', (component, ...args) => {
  args.global = args.global || {}
  args.global.config = {
    ...args.global.config,
    unwrapInjectedRef: true
  }
  return mount(component, args)
})
