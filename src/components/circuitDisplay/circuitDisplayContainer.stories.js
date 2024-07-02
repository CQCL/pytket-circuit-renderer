import CircuitDisplayContainer from './circuitDisplayContainer.vue'
import { reactive } from 'vue'

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
    circuitRaw: undefined,
    initOptions: false,
    darkTheme: false,
    transparentBg: false,
    condensed: false,
    condenseCBits: true,
    zxStyle: true,
    recursive: false,
    interpretMath: true,
    cropParams: true
  }
}

export const FromRaw = (args) => ({
  components: { CircuitDisplayContainer },
  setup () {
    return {
      circuitRaw: args.circuitRaw ? args.circuitRaw : CircuitStories[args.circuitPreset].args.circuit,
      initRenderOptions: args.initOptions
        ? {
            darkTheme: args.darkTheme,
            condensed: args.condensed,
            condenseCBits: args.condenseCBits,
            zxStyle: args.zxStyle,
            recursive: args.recursive,
            transparentBg: args.transparentBg,
            interpretMath: args.interpretMath,
            cropParams: args.cropParams
          }
        : {}
    }
  },
  template: '<circuit-display-container :circuit-raw="circuitRaw" :init-render-options="initRenderOptions"></circuit-display-container>'
})

export const FromDOMReactive = (args) => ({
  components: { CircuitDisplayContainer },
  setup () {
    const circuitPreset = reactive({ val: args.circuitPreset })
    return {
      circuitStories: CircuitStories,
      circuitPreset,
      presets: Object.keys(CircuitStories).filter(key => !CircuitStories.default.excludeStories.includes(key)),
      circuitElementStr: '#circuitJSON',
      initRenderOptions: args.initOptions
        ? {
            darkTheme: args.darkTheme,
            condensed: args.condensed,
            condenseCBits: args.condenseCBits,
            zxStyle: args.zxStyle,
            recursive: args.recursive,
            transparentBg: args.transparentBg,
            interpretMath: args.interpretMath,
            cropParams: args.cropParams
          }
        : {}
    }
  },
  template: `<div>
      <div style="position: relative; width: 100%; height: 400px">
        <circuit-display-container :circuit-element-str="circuitElementStr" :init-render-options="initRenderOptions">
        </circuit-display-container>
      </div>
      
      Reactive circuit choice:
      <select v-model="circuitPreset.val">
        <option v-for="preset in presets" :value="preset">
          {{ preset }}
        </option>
      </select>
      
      <div id="circuitJSON" style="margin-top: 20px; font-size: 10px">
        {{ JSON.stringify(circuitStories[circuitPreset.val].args.circuit) }}
      </div>
    </div>`
})
