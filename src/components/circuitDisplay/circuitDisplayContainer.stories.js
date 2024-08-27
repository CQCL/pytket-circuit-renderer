import CircuitDisplayContainer from './circuitDisplayContainer.vue'
import { computed } from 'vue'

// Get sample circuit data
import * as CircuitStories from './circuitDisplay.stories.js'

const meta = {
  title: 'Circuits/CircuitDisplayContainer',
  component: CircuitDisplayContainer
}
export default meta

const renderOptionArgs = {
  args: {
    initOptions: false,
    darkTheme: false,
    systemTheme: true,
    transparentBg: false,
    condensed: false,
    condenseCBits: true,
    zxStyle: true,
    recursive: false,
    interpretMath: true,
    cropParams: true
  }
}
const singleCircArgs = {
  argTypes: {
    circuitPreset: {
      options: Object.keys(CircuitStories).filter(key => {
        return !CircuitStories.default.excludeStories.includes(key)
      }),
      control: { type: 'select' }
    },
    circuitRaw: { description: 'specify raw circuit JSON to display instead of the preset' }
  },
  args: {
    circuitPreset: 'Basic',
    circuitRaw: undefined
  }
}
const multiCircArgs = {
  argTypes: {
    viewFormat: { options: ['row', 'column'], control: { type: 'select' } },
    circuitPresets: {
      type: Array,
      description: 'List of presets to display next to the first preset.'
    }
  },
  args: {
    viewFormat: 'row',
    circuitPresets: ['Basic', 'Basic']
  }
}

export const InitRenderOptions = {
  ...renderOptionArgs,
  render: (args) => ({
    components: { CircuitDisplayContainer },
    setup () {
      const circuitRaw = CircuitStories.Nested.args.circuit
      const initRenderOptions = computed(() => {
        return args.initOptions
          ? {
              darkTheme: args.darkTheme,
              systemTheme: args.systemTheme,
              condensed: args.condensed,
              condenseCBits: args.condenseCBits,
              zxStyle: args.zxStyle,
              recursive: args.recursive,
              transparentBg: args.transparentBg,
              interpretMath: args.interpretMath,
              cropParams: args.cropParams
            }
          : {}
      })

      return { circuitRaw, initRenderOptions }
    },
    template: '<circuit-display-container :circuit-raw="circuitRaw" :init-render-options="initRenderOptions"></circuit-display-container>'
  })
}

export const FromRaw = {
  ...singleCircArgs,
  render: (args) => ({
    components: { CircuitDisplayContainer },
    setup () {
      const circuitRaw = computed(() => {
        return args.circuitRaw ? args.circuitRaw : CircuitStories[args.circuitPreset].args.circuit
      })

      return { circuitRaw }
    },
    template: '<circuit-display-container :circuit-raw="circuitRaw"></circuit-display-container>'
  })
}

export const FromDOMReactive = {
  ...singleCircArgs,
  render: (args) => ({
    components: { CircuitDisplayContainer },
    setup () {
      const circuitPreset = computed(() => {
        return args.circuitPreset
      })
      return {
        circuitPreset,
        circuitJSON: computed(() => {
          return JSON.stringify(CircuitStories[circuitPreset.value]?.args.circuit)
        }),
        presets: Object.keys(CircuitStories).filter(key => !CircuitStories.default.excludeStories.includes(key)),
        circuitElementStr: '#circuitJSON'
      }
    },
    template: `
      <div>
        <div style="position: relative; width: 100%; height: 400px">
          <circuit-display-container :circuit-element-str="circuitElementStr">
          </circuit-display-container>
        </div>
        <div id="circuitJSON" style="margin-top: 20px; font-size: 10px">
          {{ circuitJSON }}
        </div>
      </div>`
  })
}

export const MultiCircuit = {
  ...multiCircArgs,
  render: (args) => ({
    components: { CircuitDisplayContainer },
    setup () {
      return {
        circuitJSON: computed(() => {
          const circList = args.circuitPresets
            .map(preset => CircuitStories[preset]?.args.circuit)
            .filter(circ => !!circ)
          return JSON.stringify(circList)
        }),
        viewFormat: computed(() => args.viewFormat),
        presets: Object.keys(CircuitStories).filter(key => !CircuitStories.default.excludeStories.includes(key)),
        circuitElementStr: '#circuitJSON'
      }
    },
    template: `<div>
        <div style="position: relative; width: 100%; height: 400px">
          <circuit-display-container
              :circuit-element-str="circuitElementStr"
              :view-format="viewFormat"
          ></circuit-display-container>
        </div>
      
        Circuit preset options:
        <div style="display: flex; gap: 5px; flex-wrap: wrap">
          <span v-for="preset in presets" style="padding: 5px 10px;">
            {{ preset }}
          </span>
        </div>
        
        <div id="circuitJSON" style="margin-top: 20px; font-size: 10px">
          {{ circuitJSON }}
        </div>
      </div>`
  })
}
