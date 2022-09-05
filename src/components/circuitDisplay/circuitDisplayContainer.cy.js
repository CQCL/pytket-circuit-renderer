/* global cy, it, describe */
import { composeStories } from '@storybook/testing-vue3'
import * as stories from './circuitDisplayContainer.stories.js'

const components = composeStories(stories)
const useCases = Object.keys(components)

describe('Circuit display container component', () => {
  describe(name + ' circuit', () => {
    useCases.forEach(useCase => {
      describe(useCase, () => {
        it('mounts', () => {
          cy.mount({ name, ...components[useCase]({ circuitPreset: 'Classical' }) })
        })

        it('can zoom in and out', () => {
          cy.mount({ name, ...components[useCase]({ circuitPreset: 'Classical' }) })
          cy.get('[title="Zoom out"]').click()
          cy.get('[title="Zoom out"]').click()
          cy.get('[title="Zoom in"]').click()
          cy.get('[title="Zoom in"]').click() // for now, manually check this works
        })
        // it('can toggle display options')
        // it('can export the circuit as an image')
      })
    })
  })
})
