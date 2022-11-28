import { provide } from 'vue'
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
    nested: false,
    circuit: { qubits: [['Q', [0]]], commands: [], bits: [], phase: 0, implicit_permutation: ['Q', [0]] } // Empty circuit with 1 qubit.
  }
}

const setupProvideRenderOptions = function (args) {
  provide(renderOptions.zxStyle, args.zxStyle)
  provide(renderOptions.condenseCBits, args.condenseCBits)
  provide(renderOptions.recursive, args.recursive)
  provide(renderOptions.condensed, args.condensed)
  provide(renderOptions.nested, args.nested)
}
export { setupProvideRenderOptions }

export const Template = (args) => ({
  components: { CircuitDisplay },
  setup () {
    setupProvideRenderOptions(args)
    return { circuit: args.circuit, darkTheme: args.darkTheme }
  },
  template: `<div class="circuit-display-container theme_variables" :class="[darkTheme ? 'dark' : 'light']">
    <circuit-display :circuit="circuit" />
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
