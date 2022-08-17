/* global Cypress */
import './commands'
import { mount } from 'cypress/vue'
import 'vue/dist/vue.esm-bundler.js' // Required for mounting storybook components
import '@/theme.scss'

Cypress.Commands.add('mount', mount)
