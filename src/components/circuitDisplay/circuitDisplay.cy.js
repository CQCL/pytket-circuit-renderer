/* global cy, it, describe */
import { composeStories } from '@storybook/testing-vue3'
import * as stories from './circuitDisplay.stories.js'

const { Boxes } = composeStories(stories)

describe('Circuit display component', () => {
  it('mounts', () => {
    cy.mount(Boxes())
  })
})
