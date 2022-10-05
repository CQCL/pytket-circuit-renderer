import CircuitDisplayContainer from './circuitDisplayContainer.vue'

// Get sample circuit data
import * as CircuitStories from './circuitDisplay.stories.js'

export default {
  title: 'Circuits/CircuitDisplayContainer',
  component: CircuitDisplayContainer,
  argTypes: {
    circuitPreset: {
      options: Object.keys(CircuitStories),
      control: { type: 'select' }
    }
  },
  args: {
    circuitPreset: 'default'
  }
}

export const FromRaw = (args) => ({
  components: { CircuitDisplayContainer },
  setup () {
    return {
      circuitRaw: CircuitStories[args.circuitPreset].args.circuit
    }
  },
  template: '<circuit-display-container :circuit-raw="circuitRaw"></circuit-display-container>'
})

export const FromDOM = (args) => ({
  components: { CircuitDisplayContainer },
  setup () {
    return {
      circuitElementStr: '#circuitJSON'
    }
  },
  template: `<div>
  <circuit-display-container :circuit-element-str="circuitElementStr"></circuit-display-container>
      <div id="circuitJSON">${JSON.stringify(CircuitStories[args.circuitPreset].args.circuit)}</div>
    </div>`
})
