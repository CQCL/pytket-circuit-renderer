import { h, ref } from 'vue'
import CircuitCommand from './command.vue'
import { setupProvideRenderOptions } from './circuitDisplay.stories'

export default {
  title: 'Circuits/Command',
  component: CircuitCommand,
  excludeStories: ['SubstituteCommand'],
  args: {
    zxStyle: true,
    condenseCBits: false,
    recursive: true,
    condensed: true,
    nested: false
  }
}

const Wrapper = {
  props: ['commandRef', 'ready'],
  render () {
    return this.ready ? this.commandRef.renderSelf(h) : 'loading'
  }
}

const Template = (args) => ({
  components: { CircuitCommand, Wrapper },
  setup () {
    setupProvideRenderOptions(args)
    const commandRef = ref()
    const isReady = ref(false)
    return { args, h, commandRef, isReady }
  },
  methods: {
    onMounted () {
      this.commandRef = this.$refs.commandRef
      this.isReady = true
    }
  },
  template: `<div class="circuit-display-container theme_variables">
    <div style="justify-content: flex-start" class="circuit-container circuit-preview circuit_variables condensed">
      <div class="circuit-inner-scroll" data-cy="command-container">
        <circuit-command :ref="'commandRef'" v-bind="args" @mounted="onMounted">
          <template #gate-info>
            <div data-description="placeholder"></div>
          </template>
        </circuit-command>
        <wrapper :command-ref="commandRef" :ready="isReady"></wrapper>
      </div>
    </div>
  </div>`
})

export const Basic = Template.bind({})
Basic.args = {
  command: {
    args: [['q', [0]]],
    op: { type: 'X' }
  },
  registerOrder: [
    ['q', [0]],
    ['q', [1]],
    ['q', [2]],
    ['q', [3]],
    ['c', [0]],
    ['c', [1]],
    ['c', [2]],
    ['c', [3]],
    ['d', [0]],
    ['d', [1]]
  ],
  classicalThreshold: 4,
  condensedRegisters: {
    names: { c: 4, d: 2 },
    toggles: { c: false, d: true },
    order: { c: { first: 4, last: 7 }, d: { first: 8, last: 9 } }
  }
}

// Factory story to substitute different commands
export const SubstituteCommand = (command, args) => {
  const story = Template.bind({})
  const { registerOrder, classicalThreshold, condensedRegisters } = args
  story.args = { command, registerOrder, classicalThreshold, condensedRegisters }
  return story
}
