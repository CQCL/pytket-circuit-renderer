import CircuitDisplayContainer from './circuitDisplayContainer.vue'

// Get sample circuit data
import * as CircuitStories from './circuitDisplay.stories.js'

export default {
  title: 'Circuits/CircuitDisplayContainer',
  component: CircuitDisplayContainer,
  argTypes: {
    circuitPreset: {
      options: Object.keys(CircuitStories).filter(key => {
        return !CircuitStories.default.excludeStories.includes(key)
      }),
      control: { type: 'select' }
    }
  },
  args: {
    circuitPreset: 'default',
    initOptions: false,
    darkTheme: false,
    condensed: false,
    condenseCBits: true,
    zxStyle: true,
    recursive: false
  }
}

export const FromRaw = (args) => ({
  components: { CircuitDisplayContainer },
  setup () {
    return {
      circuitRaw: CircuitStories[args.circuitPreset].args.circuit,
      initRenderOptions: args.initOptions
        ? {
            darkTheme: args.darkTheme,
            condensed: args.condensed,
            condenseCBits: args.condenseCBits,
            zxStyle: args.zxStyle,
            recursive: args.recursive
          }
        : {}
    }
  },
  template: '<circuit-display-container :circuit-raw="circuitRaw" :init-render-options="initRenderOptions"></circuit-display-container>'
})

export const FromDOM = (args) => ({
  components: { CircuitDisplayContainer },
  setup () {
    return {
      circuitElementStr: '#circuitJSON',
      initRenderOptions: args.initOptions
        ? {
            darkTheme: args.darkTheme,
            condensed: args.condensed,
            condenseCBits: args.condenseCBits,
            zxStyle: args.zxStyle,
            recursive: args.recursive
          }
        : {}
    }
  },
  template: `<div>
      <div style="position: relative; width: 100%; height: 400px">
        <circuit-display-container :circuit-element-str="circuitElementStr" :init-render-options="initRenderOptions">
        </circuit-display-container>
      </div>
      <div id="circuitJSON">${JSON.stringify(CircuitStories[args.circuitPreset].args.circuit)}</div>
    </div>`
})
