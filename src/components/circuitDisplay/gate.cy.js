/* global cy, it, describe */
import { composeStories } from '@storybook/testing-vue3'
import * as storiesGeneric from './genericGate.stories.js'
import * as storiesControlled from './controlledGate.stories.js'

const componentsGeneric = composeStories(storiesGeneric)
const componentsControlled = composeStories(storiesControlled)

describe('Generic Gate component', () => {
  Object.keys(componentsGeneric).forEach(name => {
    it(name + ' mounts', () => {
      cy.mount({ name, ...componentsGeneric[name]() })
    })
  })
})

describe('Controlled Gate component', () => {
  Object.keys(componentsControlled).forEach(name => {
    it(name + ' mounts', () => {
      cy.mount({ name, ...componentsControlled[name]() })
    })
  })
})
