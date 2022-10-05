/* global cy, it, describe */
import { composeStories, composeStory } from '@storybook/testing-vue3'
import * as storiesRaw from './circuitDisplay.stories.js'
import * as circuits from '@/../cypress/fixtures/circuits.js'

// remove non-story exports from the main collection
const Template = storiesRaw.Template
const stories = { ...storiesRaw, setupProvideRenderOptions: undefined, Template: undefined }
delete stories.setupProvideRenderOptions
delete stories.Template
const components = composeStories(stories)
const bools = [true, false]

describe('Circuit display component', () => {
  Object.keys(components).forEach(name => {
    describe(name + ' circuit', () => {
      it('mounts', () => {
        cy.mount({ name, ...components[name]() })
        waitForRender()
      })

      it('renders the right number of commands', {
        defaultCommandTimeout: 30000 // Give more time to load all gates in the circuit.
      }, () => {
        cy.mount({ name, ...components[name]() })
        waitForRender({ all: true })

        cy.get('.circuit-container')
          .first()
          .children()
          .children('[data-command=true]')
          .should('have.length', circuits[name].commands.length)
      })

      bools.forEach(condenseCBits => {
        const nBits = condenseCBits ? Math.min(1, circuits[name].bits.length) : circuits[name].bits.length
        const nWires = nBits + circuits[name].qubits.length
        const story = Template.bind({})
        story.args = {
          condenseCBits,
          ...stories[name].args
        }
        const component = composeStory(story, stories.default)

        it(`displays the right number of registers when${condenseCBits ? ' ' : ' not '}condensing bits`, {
          defaultCommandTimeout: 30000 // Give more time to load all gates in the circuit.
        }, () => {
          cy.log(story)
          cy.mount({ name, ...component() })
          waitForRender({ all: true })

          cy.log('Expecting ' + nWires + ' bits.')
          countRegisters(nWires)
        })

        it(`renders (at most) the right number of wires for each circuit layer when${condenseCBits ? ' ' : ' not '}condensing bits`, {
          defaultCommandTimeout: 30000 // Give more time to load all gates in the circuit.
        }, () => {
          cy.mount({ name, ...component() })
          waitForRender({ all: true })

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
    const story = Template.bind({})
    story.args = {
      condenseCBits: false,
      ...stories.Classical.args
    }
    const component = composeStory(story, stories.default)
    cy.mount({ name, ...component() })
    waitForRender()

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

const waitForRender = function (options) {
  if (typeof options === 'undefined') {
    options = {}
  }
  return cy
    .get('[data-command=true]')
    .should('exist') // At least one command has rendered
    .then(() => {
      if (options.all) {
        // Make sure all blocks have rendered
        cy.get('[data-cy=loading]')
          .should('not.exist')
        cy.get('[data-cy=rendering-complete]')
          .should('exist')
      }
    })
}
