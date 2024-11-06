import { provide, computed } from 'vue'
import CircuitDisplay from './circuitDisplay.vue'
import * as circuitFixtures from '@/../cypress/fixtures/circuits.js'
import { renderOptions } from './provideKeys'

export default {
  title: 'Circuits/CircuitDisplay',
  component: CircuitDisplay,
  excludeStories: ['setupProvideRenderOptions', 'Template'],
  argTypes: {
    circuit: { control: false }
  },
  args: {
    darkTheme: true,
    zxStyle: true,
    condenseCBits: true,
    recursive: false,
    condensed: true,
    // Note this is required to allow nice rendering of the circuit inline without a containing element.
    nested: 2,
    cropParams: true,
    interpretMath: true,
    circuit: {
      qubits: [['Q', [0]]],
      commands: [],
      bits: [],
      phase: 0,
      implicit_permutation: [[['Q', [0]], ['Q', [0]]]]
    } // Empty circuit with 1 qubit.
  }
}

const setupProvideRenderOptions = function (args) {
  provide(renderOptions.zxStyle, computed(() => args.zxStyle))
  provide(renderOptions.condenseCBits, computed(() => args.condenseCBits))
  provide(renderOptions.recursive, computed(() => args.recursive))
  provide(renderOptions.condensed, computed(() => args.condensed))
  provide(renderOptions.nested, computed(() => args.nested))
  provide(renderOptions.interpretMath, computed(() => args.interpretMath))
  provide(renderOptions.cropParams, computed(() => args.cropParams))
}
export { setupProvideRenderOptions }

export const Template = (args) => ({
  components: { CircuitDisplay },
  setup () {
    setupProvideRenderOptions(args)
    return {
      circuit: computed(() => args.circuit),
      darkTheme: computed(() => args.darkTheme)
    }
  },
  template: `
    <div :class="[darkTheme ? 'theme-mode-dark' : 'theme-mode-light']">
      <div class="circuit-display-container theme_variables">
        <circuit-display :circuit="circuit" />
      </div>
    </div>`
})

export const Basic = Template.bind({})
Basic.args = {
  circuit: circuitFixtures.Basic
}

export const ZX = Template.bind({})
ZX.args = {
  circuit: circuitFixtures.ZX
}

export const Classical = Template.bind({})
Classical.args = {
  circuit: circuitFixtures.Classical
}

export const Boxes = Template.bind({})
Boxes.args = {
  circuit: circuitFixtures.Boxes
}

export const QIR = Template.bind({})
QIR.args = {
  circuit: circuitFixtures.QIR
}

export const Control = Template.bind({})
Control.args = {
  circuit: circuitFixtures.Control
}

export const Deep = Template.bind({})
Deep.args = {
  circuit: circuitFixtures.Deep
}

export const Nested = Template.bind({})
Nested.args = {
  circuit: circuitFixtures.Nested
}

export const SimpleNested = Template.bind({})
SimpleNested.args = {
  circuit: circuitFixtures.SimpleNested
}

export const Phase = Template.bind({})
Phase.args = {
  circuit: circuitFixtures.Phase
}

export const Params = Template.bind({})
Params.args = {
  circuit: circuitFixtures.Params
}

export const Wide = Template.bind({})
Wide.args = {
  circuit: circuitFixtures.Wide
}

export const WASM = Template.bind({})
WASM.args = {
  circuit: circuitFixtures.WASM
}
