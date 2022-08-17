<script>
import { registerEquality, renderIndexedArgs, extractControlledCommand } from './utils'

import wire from './wire'
import genericGate from './genericGate'

export default {
  name: 'controlled-gate',
  components: {
    wire,
    genericGate
  },
  props: {
    indexedArgs: { type: Array, required: true },
    command: { type: Object, required: true },
    renderOptions: { type: Object, required: true },
    condensedRegisters: { type: Object, required: true }
  },
  computed: {
    opType () {
      return this.command.op.type
    },
    nestedRenderOptions () {
      const newOptions = { ...this.renderOptions }
      newOptions.recursive = false
      return newOptions
    },
    controlFlags () {
      // update the previously computed arg details.
      const flags = { ...this.controlledCommand.argDetails }
      let inQuantumOp = false // Display the connecting control wire as classical if there are no quantum controls.
      let lastControl = false // Track which control wire is displayed last.
      let nControlled = 0 // re compute the bounds for the controlled op.
      for (const argRef of this.renderIndexedArgs.slice().reverse()) {
        const arg = JSON.parse(JSON.stringify(argRef)) // deep copy so that we can have an updated copy of the flags fo the controled op.
        // Iterate over backwards so we can easily identify the first quantum bit involved.
        inQuantumOp = inQuantumOp || (!arg.flags.classical && arg.pos > -1)
        if (arg.name in flags) { // => pos !== -1
          flags[arg.name] = { ...flags[arg.name], ...arg }
        } else {
          flags[arg.name] = {
            control: false,
            controlled: false,
            ...arg
          }
        }
        if (arg.flags.condensed) {
          flags[arg.name] = {
            control: arg.bits.reduce(
              (acc, bit, i) => arg.pos[i] > -1 ? acc || flags[bit].control : acc,
              false
            ),
            controlled: arg.bits.reduce(
              (acc, bit, i) => arg.pos[i] > -1 ? acc || flags[bit].controlled : acc,
              false
            ),
            ...arg
          }
        }
        if (!lastControl && flags[arg.name].control) { // This is the last control bit
          flags[arg.name].lastControl = true
          lastControl = true
        } else {
          flags[arg.name].lastControl = false
        }

        if (flags[arg.name].controlled) { // reassign controlled op bound flags
          const nArgs = arg.flags.condensed ? arg.indexedBits.filter(bit => bit.name in flags && flags[bit.name].controlled).length : 1
          flags[arg.name].flags.last = nControlled === 0
          flags[arg.name].flags.first = nControlled === this.controlledCommand.command.args.length - 1
          flags[arg.name].flags.single = this.controlledCommand.command.args.length === nArgs
          nControlled += nArgs
        }

        flags[arg.name].classicalLink = !inQuantumOp
        flags[arg.name].selfControl = flags[arg.name].control && flags[arg.name].controlled
      }
      return flags
    },
    controlledCommand () {
      return extractControlledCommand(this.command, {})
    },
    posAdjust () {
      return this.controlledCommand.command.args.length - this.command.args.length
    },
    renderIndexedArgs
  },
  methods: {
    registerEquality
  }
}

</script>

<template>
  <div :data-gate="opType">
    <div v-for="(arg, order) in renderIndexedArgs" :key="arg.name[0] + '-' + order">
      <div v-if="arg.pos === -1" class="gate_container">
          <wire :classical="arg.flags.classical" :condensed="arg.flags.condensed"></wire>
          <div class="gate gate_connection" :class="{classical: arg.flags.classical}"></div>
          <div v-if="order > 0" class="link link-top" :class="{'classical': controlFlags[arg.name].classicalLink}"></div>
      </div>

      <div v-else :class="{'self-controlled-gate': controlFlags[arg.name].selfControl}">
        <div v-if="controlFlags[arg.name].control">
          <div class="gate_container">
            <wire :classical="arg.flags.classical" :condensed="arg.flags.condensed"></wire>
            <div v-if="['Condition', 'Conditional'].includes(opType) && arg.flags.classical && !arg.flags.condensed && command.op.conditional.width > 1"
                 class="control_index">
              [[# arg.pos #]]
            </div>
            <div class="gate gate_control" :class="[arg.flags.classical ? 'classical' : 'z']"></div>
            <div v-if="order > 0 && !controlFlags[arg.name].controlled"
                 class="link link-top" :class="{'classical': controlFlags[arg.name].classicalLink}"
            ></div>
            <div v-if="['Condition', 'Conditional'].includes(opType) && controlFlags[arg.name].lastControl"
                 class="conditional-value">
              == [[# command.op.conditional.value #]]
            </div>
          </div>
        </div>

        <div v-if="controlFlags[arg.name].selfControl" class="self-controlled-link"></div>

        <generic-gate v-if="controlFlags[arg.name].controlled"
              :class="{'self-controlled-target': controlFlags[arg.name].selfControl}"
              :command="controlledCommand.command"
              :indexed-args="[controlFlags[arg.name]]"
              :pos-adjust="posAdjust"
              :split="true"
              :link-vertical="order > 0 && !arg.flags.single"
              :render-options="nestedRenderOptions"
              :condensed-registers="condensedRegisters">
        </generic-gate>
      </div>
    </div>
  </div>
</template>

<style scoped>
.self-controlled-gate {
  display: flex;
  position: relative;
}
.self-controlled-target{
  flex-grow: 1;
}
.self-controlled-link {
  left: 0;
  border-radius: 100% 0 0 0;
  border-width: 1px 0 0 1px!important;
  width: 25%;
}
.self-controlled-link:after {
  content: " ";
  right: calc(-1px - 100%);
  bottom: -1px;
  border-radius: 0 100% 0 0;
  border-width: 1px 1px 0 0!important;
  width: 100%;
}
.self-controlled-link,
.self-controlled-link:after {
  position: absolute;
  height: calc(var(--block-height) / 2 - 1px);
  border: solid var(--c-wire-col);
}

.conditional-value {
  position: absolute;
  top: calc(var(--block-height) - 0.3em);
  left: -1em;
  right: -1em;
  min-width: 2em;
  font-size: 0.7em;
  z-index: 1;
}
.control_index {
  left: calc(50% - 0.8em);
  right: unset !important;
}
</style>
