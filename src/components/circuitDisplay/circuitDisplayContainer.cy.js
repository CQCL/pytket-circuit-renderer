/* global cy, it, describe */
import { composeStories } from '@storybook/vue3'
import * as stories from './circuitDisplayContainer.stories.js'

const components = composeStories(stories)
const useCases = Object.keys(components)

describe('Circuit display container component UPDATED!', () => {
  useCases.forEach(useCase => {
    describe(useCase, () => {
      it('mounts', () => {
        cy.mount({ name, ...components[useCase]({ circuitPreset: 'Classical' }) })
      })

      it('can scroll the circuit', () => {
        const viewWidth = useCase === 'MultiCircuit' ? 600 : 500
        cy.viewport(viewWidth, 500)
        cy.mount({ name, ...components[useCase]({ circuitPreset: 'Classical' }) })
        cy.contains('(a XOR b)').should('not.be.visible')
        cy.get('.navigator-controller.nav-x')
          .trigger('mousedown', { which: 1 })
          .trigger('mousemove', { clientX: viewWidth * 0.45, clientY: 0 })
          .trigger('mouseup', { which: 1 })
        cy.contains('(a XOR b)').should('be.visible')
        // Jump scrollbar to end
        cy.get('.navigator-preview-block-x').within(() => {
          cy.get('.navigator-preview')
            .click('right')
        })
        cy.contains('SetBits(1,1,0,0)').should('not.be.visible')
        cy.contains('(b RSH 1)').should('be.visible')
      })

      it('can zoom the circuit', () => {
        cy.viewport(500, 500)
        cy.mount({ name, ...components[useCase]({ circuitPreset: 'Classical' }) })
        cy.contains('(a XOR b)').should('not.be.visible')
        // zoom out
        cy.get('.zoom-controller.end.nav-x')
          .trigger('mousedown', { which: 1 })
          .trigger('mousemove', { clientX: 250, clientY: 0 })
          .trigger('mouseup', { which: 1 })
        cy.contains('(a XOR b)').should('be.visible')
        // zoom in
        cy.get('.zoom-controller.end.nav-x')
          .trigger('mousedown', { which: 1 })
          .trigger('mousemove', { clientX: 0, clientY: 0 })
          .trigger('mouseup', { which: 1 })
        cy.contains('(a XOR b)').should('not.be.visible')
        // view whole circuit
        cy.get('[data-cy="fitZoom"]').click()
        cy.contains('SetBits(1,1,0,0)').should('be.visible')
        cy.contains('(b RSH 1)').should('be.visible')
        // reset zoom
        cy.get('.navigator-controller.nav-x').dblclick()
        cy.contains('SetBits(1,1,0,0)').should('be.visible')
        cy.contains('Range[2, ').should('not.be.visible')
      })

      it('can toggle display options', () => {
        cy.mount({ name, ...components[useCase]({ circuitPreset: 'Classical' }) })
        cy.contains('tk_SCRATCH_BIT[0]').should('not.exist')
        cy.get('[title="Display Options"').click()
        cy.contains('Collapse classical registers').click()
        cy.contains('tk_SCRATCH_BIT[0]').should('exist')
      })

      it('Can view nested info modals', () => {
        cy.viewport(500, 500)
        cy.mount({ name, ...components[useCase]({ circuitPreset: 'SimpleNested' }) })
        cy.get('.navigator-controller.nav-x')
          .trigger('mousedown', { which: 1 })
          .trigger('mousemove', { clientX: 300, clientY: 0 })
          .trigger('mouseup', { which: 1 })
        cy.get('[data-cy=open-tool-tip-CircBox]').should('be.visible').first().click()
        cy.get('[data-cy=teleport-to] [data-cy=teleported-CircBox]').within(() => {
          cy.contains('Rx').should('exist')
          cy.get('[data-cy=open-tool-tip-Rx]').should('be.visible').click()
          cy.get('[data-cy=teleported-Rx]').within(() => {
            cy.contains('Box params')
          })
        })
      })
      it('Can view nested info modals when displaying circuits recursively', () => {
        cy.viewport(500, 500)
        cy.mount({
          name,
          ...components[useCase]({
            circuitPreset: 'SimpleNested', initOptions: true, condensed: true, recursive: true
          })
        })
        cy.get('.navigator-controller.nav-x')
          .trigger('mousedown', { which: 1 })
          .trigger('mousemove', { clientX: 270, clientY: 0 })
          .trigger('mouseup', { which: 1 })
        cy.get('[data-cy=open-tool-tip-Rx]').should('be.visible').first().click()
        cy.get('[data-cy=teleport-to] [data-cy=teleported-Rx]').within(() => {
          cy.contains('Box params').should('be.visible')
        })
      })
      // it('can export the circuit as an image')
    })
  })
})
