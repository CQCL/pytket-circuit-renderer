import GenericGate from './genericGate.vue'
import { setupProvideRenderOptions } from './circuitDisplay.stories'

export default {
  title: 'Circuits/GenericGate',
  component: GenericGate,
  args: {
    zxStyle: true,
    condenseCBits: true,
    recursive: false,
    condensed: true,
    linkVertical: false,
    split: false,
    posAdjust: 0
  }
}

const Template = (args) => ({
  components: { GenericGate },
  setup () {
    setupProvideRenderOptions(args)
    return { args }
  },
  template: '<div class="circuit-display-container circuit-container circuit-preview theme_variables circuit_variables"><generic-gate v-bind="args" /></div>'
})

export const Generic = Template.bind({})
Generic.args = {
  indexedArgs: [
    {
      order: 0,
      pos: 1,
      name: ['q', [0]],
      flags: {
        classical: false,
        condensed: false,
        first: true,
        globalClassical: false,
        last: false,
        single: false
      }
    },
    {
      order: 1,
      pos: -1,
      name: ['q', [1]],
      flags: {
        classical: false,
        condensed: false,
        first: false,
        globalClassical: false,
        last: false,
        single: false
      }
    },
    {
      order: 2,
      pos: 0,
      name: ['q', [2]],
      flags: {
        classical: false,
        condensed: false,
        first: false,
        globalClassical: false,
        last: true,
        single: false
      }
    }
  ],
  command: {
    op: { type: 'Generic', params: ['0.65432'] },
    args: [['q', [2]], ['q', [0]]]
  },
  condensedRegisters: {}
}

export const Classical = Template.bind({})
Classical.args = {
  indexedArgs: [
    {
      order: 0,
      pos: 1,
      name: ['c', [0]],
      flags: {
        classical: true,
        condensed: false,
        first: true,
        globalClassical: false,
        last: false,
        single: false
      }
    },
    {
      order: 1,
      pos: -1,
      name: ['c', [1]],
      flags: {
        classical: true,
        condensed: false,
        first: false,
        globalClassical: false,
        last: false,
        single: false
      }
    },
    {
      order: 2,
      pos: 0,
      name: ['c', [2]],
      flags: {
        classical: true,
        condensed: false,
        first: false,
        globalClassical: false,
        last: true,
        single: false
      }
    },
    {
      order: 0,
      pos: [1, -1, 0],
      name: ['C', [2], 'condensed'],
      bits: [['c', [0]], ['c', [1]], ['c', [2]]],
      flags: {
        classical: true,
        condensed: true,
        first: true,
        globalClassical: false,
        last: true,
        single: true
      }
    },
    {
      order: 0,
      pos: [1, -1, 0, -1],
      name: ['Global Classical', [2], 'condensed'],
      bits: [['c', [0]], ['c', [1]], ['c', [2]], ['d', [0]]],
      flags: {
        classical: true,
        condensed: true,
        first: true,
        globalClassical: true,
        last: true,
        single: true
      }
    }
  ],
  command: {
    op: { type: 'Classical', params: ['0.65432'] },
    args: [['c', [2]], ['c', [0]]]
  },
  condensedRegisters: {
    c: false, d: false
  }
}

export const Hybrid = Template.bind({})
Hybrid.args = {
  indexedArgs: [
    {
      order: 0,
      pos: 0,
      name: ['q', [0]],
      flags: {
        classical: false,
        condensed: false,
        first: true,
        globalClassical: false,
        last: false,
        single: false
      }
    },
    {
      order: 1,
      pos: -1,
      name: ['q', [1]],
      flags: {
        classical: false,
        condensed: false,
        first: false,
        globalClassical: false,
        last: false,
        single: false
      }
    },
    {
      order: 2,
      pos: -1,
      name: ['c', [0]],
      flags: {
        classical: true,
        condensed: false,
        first: false,
        globalClassical: false,
        last: false,
        single: false
      }
    },
    {
      order: 2,
      pos: 1,
      name: ['c', [1]],
      flags: {
        classical: true,
        condensed: false,
        first: false,
        globalClassical: false,
        last: true,
        single: false
      }
    },
    {
      order: 2,
      pos: [1, -1, -1],
      name: ['C', [3], 'condensed'],
      bits: [['c', [0]], ['c', [1]], ['c', [2]]],
      flags: {
        classical: true,
        condensed: true,
        first: false,
        globalClassical: false,
        last: true,
        single: false
      }
    },
    {
      order: 2,
      pos: [1, -1, -1, -1],
      name: ['Global Classical', ['n'], 'condensed'],
      bits: [['c', [0]], ['c', [1]], ['c', [2]], ['d', [0]]],
      flags: {
        classical: true,
        condensed: true,
        first: false,
        globalClassical: true,
        last: true,
        single: false
      }
    }
  ],
  command: {
    op: { type: 'Hybrid' },
    args: [['q', [0]], ['c', [0]]]
  },
  condensedRegisters: {
    c: false
  }
}

// Special 2Q gates

const Template2Q = (args) => ({
  components: { GenericGate },
  setup () {
    const indexed2Qtemplate = [
      {
        order: 0,
        pos: 0,
        name: ['q', [0]],
        flags: {
          classical: false,
          condensed: false,
          first: true,
          globalClassical: false,
          last: false,
          single: false
        }
      },
      {
        order: 1,
        pos: 1,
        name: ['q', [1]],
        flags: {
          classical: false,
          condensed: false,
          first: false,
          globalClassical: false,
          last: true,
          single: false
        }
      }
    ]
    const commands = {
      CX: {
        indexedArgs: indexed2Qtemplate,
        command: {
          op: { type: 'CX' },
          args: [['q', [0]], ['q', [1]]]
        },
        condensedRegisters: {}
      },
      CZ: {
        indexedArgs: indexed2Qtemplate,
        command: {
          op: { type: 'CZ' },
          args: [['q', [0]], ['q', [1]]]
        },
        condensedRegisters: {}
      },
      SWAP: {
        indexedArgs: indexed2Qtemplate,
        command: {
          op: { type: 'SWAP' },
          args: [['q', [0]], ['q', [1]]]
        },
        condensedRegisters: {}
      },
      Measure: {
        indexedArgs: [
          {
            order: 0,
            pos: 0,
            name: ['q', [0]],
            flags: {
              classical: false,
              condensed: false,
              first: true,
              globalClassical: false,
              last: false,
              single: false
            }
          },
          {
            order: 1,
            pos: 1,
            name: ['c', [0]],
            flags: {
              classical: true,
              condensed: false,
              first: false,
              globalClassical: false,
              last: true,
              single: false
            }
          },
          {
            order: 1,
            pos: 1,
            name: ['C', ['..1']],
            flags: {
              classical: true,
              condensed: true,
              first: false,
              globalClassical: true,
              last: true,
              single: false
            }
          },
          {
            order: 1,
            pos: 1,
            name: ['c', ['..1']],
            flags: {
              classical: true,
              condensed: true,
              first: false,
              globalClassical: false,
              last: true,
              single: false
            }
          }
        ],
        command: {
          op: { type: 'Measure' },
          args: [['q', [0]], ['c', [0]]]
        },
        condensedRegisters: { c: false }
      }
    }
    args = { ...args, ...commands[args.opType] }
    setupProvideRenderOptions(args)
    return { args }
  },
  template: '<div class="circuit-display-container circuit-container circuit-preview theme_variables circuit_variables"><generic-gate v-bind="args" /></div>'
})

export const Special2Qubits = Template2Q.bind({})
Special2Qubits.args = { opType: 'CX' }
Special2Qubits.argTypes = {
  opType: { options: ['CX', 'CZ', 'SWAP', 'Measure'], control: { type: 'inline-radio' } }
}

// Special 1Q gates
const Template1Q = (args) => ({
  components: { GenericGate },
  setup () {
    args = {
      ...args,
      indexedArgs: [{
        order: 0,
        pos: 0,
        name: ['q', [0]],
        flags: {
          classical: false,
          condensed: false,
          first: true,
          globalClassical: false,
          last: true,
          single: true
        }
      }],
      command: {
        op: { type: args.opType },
        args: [['q', [0]]]
      },
      condensedRegisters: {}
    }
    setupProvideRenderOptions(args)
    return { args }
  },
  template: '<div class="circuit-display-container circuit-container circuit-preview theme_variables circuit_variables"><generic-gate v-bind="args" /></div>'
})

export const Special1Qubit = Template1Q.bind({})
Special1Qubit.args = { opType: 'X' }
Special1Qubit.argTypes = {
  opType: { options: ['X', 'Y', 'Z', 'H', 'S', 'Sdg', 'T', 'Tdg', 'V', 'Vdg', 'Reset'], control: { type: 'inline-radio' } }
}
