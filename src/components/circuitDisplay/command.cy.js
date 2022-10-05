/* global cy, it, describe */
import { composeStories } from '@storybook/testing-vue3'
import BaseStory, { SubstituteCommand } from './command.stories.js'
import commands from '@/../cypress/fixtures/commands.json'

// Generate a story for each command
const stories = { default: BaseStory }
commands.commands.forEach((command, i) => {
  stories[`${i} [${command.op.type}]`] = SubstituteCommand(command, commands)
})
const components = composeStories(stories)

describe('Circuit command component', () => {
  Object.keys(components).forEach((name, i) => {
    const component = components[name]
    describe(name, () => {
      it('mounts', () => {
        cy.mount({ name, ...component() })
      })

      it('has the right number of wires', () => {
        // Work this out based on height - this will ensure that commands can fit together into a circuit properly.
        // Compute the number of wires involved:
        const command = commands.commands[i]
        const indices = []
        cy.log(command, commands.registerOrder)
        command.args.forEach(arg => {
          const i = commands.registerOrder.findIndex(reg => JSON.stringify(reg) === JSON.stringify(arg))
          if (i >= 0) indices.push(i)
        })
        const nWires = Math.max(0, ...indices) - Math.min(commands.registerOrder.length, ...indices) + 1
        cy.log('expecting ' + nWires + ' wires.', indices)
        cy.wrap(nWires).should('be.gt', 0)

        cy.mount({ name, ...component() })
        // Note: --block-height is 3em by default.
        cy.get('[data-command=true]').invoke('css', 'font-size').as('1em')
        cy.get('@1em').then(em => {
          em = parseInt(em, 10) // chop 'px' off the end
          cy.log('1em:', em)
          cy.get('.circuit-display-container > [data-command=true]') // No circuit layer at top level when testing.
            .should('have.length', 1) // Only one command should render.
            .invoke('height').should('be.eq', 3 * em * nWires)
        })
      })
    })
  })
})
