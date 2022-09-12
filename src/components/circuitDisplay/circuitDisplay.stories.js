import CircuitDisplay from './circuitDisplay.vue'
import * as circuitFixtures from '@/../cypress/fixtures/circuits.js'

export default {
  title: 'Circuits/CircuitDisplay',
  component: CircuitDisplay,
  argTypes: {
    circuit: { control: false }
  },
  args: {
    zxStyle: true,
    condenseCBits: true,
    recursive: false,
    condensed: true,
    circuit: { qubits: [['Q', [0]]], commands: [], bits: [], phase: 0, implicit_permutation: ['Q', [0]] } // Empty circuit with 1 qubit.
  }
}

const Template = (args) => ({
  components: { CircuitDisplay },
  setup () {
    return {
      ...args,
      renderOptions: {
        zxStyle: args.zxStyle,
        condenseCBits: args.condenseCBits,
        recursive: args.recursive,
        condensed: args.condensed
      }
    }
  },
  template: `<div class="circuit-display-container theme_variables">
    <circuit-display :circuit="circuit" :render-options="renderOptions" />
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
  condenseCBits: false,
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
