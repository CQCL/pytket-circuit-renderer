/* global cy, it, describe */
import { composeStories } from '@storybook/testing-vue3'
import * as stories from './circuitDisplay.stories.js'
import * as circuits from '@/../cypress/fixtures/circuits.js'

const components = composeStories(stories)
const bools = [true, false]

describe('Circuit display component', () => {
  Object.keys(components).forEach(name => {
    describe(name + ' circuit', () => {
      it('mounts', () => {
        cy.mount({ name, ...components[name]() })
      })

      it('renders the right number of commands', () => {
        cy.mount({ name, ...components[name]() })
        cy.get('.circuit-container')
          .first()
          .children()
          .children('[data-command=true]')
          .should('have.length', circuits[name].commands.length)
      })

      bools.forEach(condenseCBits => {
        const nBits = condenseCBits ? Math.min(1, circuits[name].bits.length) : circuits[name].bits.length
        const nWires = nBits + circuits[name].qubits.length

        it(`displays the right number of registers when${condenseCBits ? ' ' : ' not '}condensing bits`, () => {
          cy.mount({ name, ...components[name]({ condenseCBits }) })
          cy.log('Expecting ' + nWires + ' bits.')
          countRegisters(nWires)
        })

        it(`renders (at most) the right number of wires for each circuit layer when${condenseCBits ? ' ' : ' not '}condensing bits`, () => {
          cy.mount({ name, ...components[name]({ condenseCBits }) })
          cy.log('Expecting ' + nWires + ' wires.')
          cy.get('[data-command=true]').invoke('css', 'font-size').as('1em')
          cy.get('@1em').then(em => {
            em = parseInt(em, 10) // chop 'px' off the end
            cy.log('1em:', em)
            cy.get('.circuit-layer') // All layers are the same height, so if one is too tall it will affect the others.
              .first()
              .invoke('height')
              .should('be.eq', 3 * nWires * em)
          })
        })
      })
    })
  })

  it('can toggle collapsing a classical register', () => {
    cy.mount({ name, ...components.Classical({ condenseCBits: false }) })
    cy.contains('a[1]').click()
    countRegisters(circuits.Classical.qubits.length + circuits.Classical.bits.length - 3)
    cy.contains('a[..4]').click()
    countRegisters(circuits.Classical.qubits.length + circuits.Classical.bits.length)
  })
})

const countRegisters = function (nRegisters) {
  return cy
    .get('.circuit-layer.qubits')
    .first()
    .find('.qubit')
    .should('have.length', nRegisters)
}
