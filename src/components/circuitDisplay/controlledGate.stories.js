import ControlledGate from './controlledGate.vue'
import { setupProvideRenderOptions } from './circuitDisplay.stories'

export default {
  title: 'Circuits/ControlledGate',
  component: ControlledGate,
  args: {
    darkTheme: true,
    zxStyle: true,
    condenseCBits: true,
    recursive: false,
    condensed: true
  }
}

const Template = (args) => ({
  components: { ControlledGate },
  setup () {
    setupProvideRenderOptions(args)
    return { args }
  },
  template: `
    <div :class="[args.darkTheme ? 'theme-mode-dark' : 'theme-mode-light']">
      <div class="circuit-display-container theme_variables">
        <div class="circuit-container circuit-preview circuit_variables">
          <controlled-gate v-bind="args" />
        </div>
      </div>
    </div>`
})

export const QControlBox = Template.bind({})
QControlBox.args = {
  indexedArgs: [
    {
      order: 0,
      pos: 2,
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
    args: [['q', [2]], ['q', [1]], ['q', [0]]],
    op: {
      box: {
        n_controls: 2,
        op: { params: ['0.4'], type: 'Rx' },
        type: 'QControlBox'
      },
      type: 'QControlBox'
    }
  },
  condensedRegisters: {}
}

export const CCX = Template.bind({})
CCX.args = {
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
      pos: 2,
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
    op: { type: 'CCX' },
    args: [['q', [2]], ['q', [0]], ['q', [1]]]
  },
  condensedRegisters: {}
}

export const ClassicalControl = Template.bind({})
ClassicalControl.args = {
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
      pos: 0,
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
      order: 0,
      pos: [-1, 0],
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
      pos: [-1, 0, -1],
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
    op: { type: 'Conditional', conditional: { op: { type: 'X' }, value: 0, width: 1 } },
    args: [['c', [1]], ['q', [0]]]
  },
  condensedRegisters: { c: false }
}

const c0 = {
  order: 1,
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
}
const c1 = {
  order: 2,
  pos: 0,
  name: ['c', [1]],
  flags: {
    classical: true,
    condensed: false,
    first: false,
    globalClassical: false,
    last: true,
    single: false
  }
}
const d0 = { ...c0 }
d0.name[0] = 'd'

export const SelfControl = Template.bind({})
SelfControl.args = {
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
    c0,
    c1,
    {
      order: 1,
      pos: [-1, 0],
      name: ['C', [2], 'condensed'],
      bits: [['c', [0]], ['c', [1]]],
      indexedBits: [c0, c1],
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
      order: 1,
      pos: [-1, 0, -1],
      name: ['Global Classical', [2], 'condensed'],
      bits: [['c', [0]], ['c', [1]], ['d', [0]]],
      indexedBits: [c0, c1, d0],
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
    op: { type: 'Conditional', conditional: { op: { type: 'Measure' }, value: 0, width: 1 } },
    args: [['c', [1]], ['q', [0]], ['c', [1]]]
  },
  condensedRegisters: { c: false }
}
