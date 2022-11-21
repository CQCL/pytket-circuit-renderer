<script>
import { registerEquality, renderIndexedArgs, extractControlledCommand } from './utils'

import wire from './wire'
import genericGate from './genericGate'
import { renderOptions } from './provideKeys'

export default {
  name: 'controlled-gate',
  components: {
    wire,
    genericGate
  },
  props: {
    indexedArgs: { type: Array, required: true },
    command: { type: Object, required: true },
    condensedRegisters: { type: Object, required: true }
  },
  inject: {
    condenseCBits: { from: renderOptions.condenseCBits }
  },
  // provide () {
  //   return {
  //     [renderOptions.recursive]: false
  //   }
  // },
  computed: {
    opType () {
      return this.command.op.type
    },
    controlFlags () {
      // update the previously computed arg details.
      const flags = { ...this.controlledCommand.argDetails }
      let inQuantumOp = false // Display the connecting control wire as classical if there are no quantum controls.
      let inControlledOp = false // Track which control wires are between controlled wires.
      let lastControl = false // Track which control wire is displayed last.
      let nControlled = 0 // re compute the bounds for the controlled op.
      for (const argRef of this.renderIndexedArgs.slice().reverse()) {
        const arg = JSON.parse(JSON.stringify(argRef)) // deep copy so that we can have an updated copy of the flags fo the controlled op.
        // Iterate over backwards so we can easily identify the first quantum bit involved.
        inQuantumOp = inQuantumOp || (!arg.flags.classical && arg.pos > -1)
        // if this is a condensed wire, need to check if any of its bits are being controlled:
        inControlledOp = inControlledOp || (arg.flags.condensed ? arg.bits : [arg.name]).reduce(
          (acc, bit) => acc || (bit in flags && !!flags[bit].controlled),
          false
        )

        if (arg.name in flags) { // => pos !== -1
          flags[arg.name] = { ...flags[arg.name], ...arg, inControlledOp }
        } else {
          flags[arg.name] = {
            control: false,
            controlled: false,
            inControlledOp,
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
            inControlledOp,
            ...arg
          }
        }
        if (!lastControl && flags[arg.name].control) { // This is the last control bit
          flags[arg.name].lastControl = true
          lastControl = true
        } else {
          flags[arg.name].lastControl = false
        }

        if (flags[arg.name].inControlledOp) { // reassign controlled op bound flags
          const nArgs = arg.flags.condensed ? arg.indexedBits.filter(bit => bit.name in flags && flags[bit.name].controlled).length : 1
          flags[arg.name].flags.last = nControlled === 0 && flags[arg.name].controlled
          flags[arg.name].flags.first = nControlled === this.controlledCommand.command.args.length - 1 && flags[arg.name].controlled
          flags[arg.name].flags.single = this.controlledCommand.command.args.length === nArgs && flags[arg.name].controlled
          if (flags[arg.name].controlled) {
            nControlled += nArgs
          } else {
            flags[arg.name].pos = -1
          }
          // If this is the first controlled arg, next arg won't be in the controlled op
          if (flags[arg.name].flags.first) {
            inControlledOp = false
          }
        }

        flags[arg.name].classicalLink = !inQuantumOp
        // Special case for controlled SWAP: self controls look like normal controls
        flags[arg.name].selfControl = !(this.controlledCommand.command.op.type === 'SWAP') &&
            !!(flags[arg.name].control && flags[arg.name].inControlledOp)
      }
      return flags
    },
    controlledCommand () {
      return extractControlledCommand(this.command, {})
    },
    posAdjust () {
      return this.controlledCommand.command.args.length - this.command.args.length
    },
    controlledOpIndexedArgs () {
      // Get the indexed args for the whole controlled op
      return this.renderIndexedArgs
        .filter(arg => this.controlFlags[arg.name].inControlledOp)
        .map(arg => this.controlFlags[arg.name])
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
    <div v-for="(arg, order) in renderIndexedArgs" :key="arg.name[0] + '-' + order" :style="{ height: 'var(--block-height)'}">
      <!--  Not in the controlled operation and not a control wire.  -->
      <!--  Add a link in unless this is the topmost wire.  -->
      <div v-if="arg.pos === -1 && !controlFlags[arg.name].inControlledOp" class="gate_container">
          <wire :classical="arg.flags.classical" :condensed="arg.flags.condensed"></wire>
          <div class="gate gate_connection" :class="{classical: arg.flags.classical}"></div>
          <div v-if="!arg.flags.first" class="link link-top" :class="{'classical': controlFlags[arg.name].classicalLink}"></div>
      </div>

      <!--  In controlled op, or is a control wire  -->
      <div v-else :class="{'self-controlled-gate': controlFlags[arg.name].selfControl}">

        <!--  Add control point to the wire if its a control  -->
        <div v-if="controlFlags[arg.name].control">
          <div class="gate_container">
            <wire :classical="arg.flags.classical" :condensed="arg.flags.condensed"></wire>
            <div v-if="['Condition', 'Conditional'].includes(opType) && arg.flags.classical && !arg.flags.condensed && command.op.conditional.width > 1"
                 class="control_index">
              [[# arg.pos #]]
            </div>
            <div class="gate gate_control" :class="[arg.flags.classical ? 'classical' : 'z']"></div>
            <!--  Add a control link if not the first wire and not in the controlled op  -->
            <div v-if="!arg.flags.first && !controlFlags[arg.name].inControlledOp"
                 class="link link-top" :class="{'classical': controlFlags[arg.name].classicalLink}"
            ></div>
            <div v-if="['Condition', 'Conditional'].includes(opType) && controlFlags[arg.name].lastControl"
                 class="conditional-value">
              == [[# command.op.conditional.value #]]
            </div>
          </div>
        </div>

        <!--  Add self control link if applicable  -->
        <div v-if="controlFlags[arg.name].selfControl"
             :class="{'classical': controlFlags[arg.name].flags.classical, 'condensed': controlFlags[arg.name].flags.condensed}"
             class="self-controlled-link">
        </div>

        <!--  Pad out the gate height if this is a controlled wire  -->
        <div v-if="controlFlags[arg.name].inControlledOp" class="gate gate_mid gate_empty"></div>
      </div>

      <!--  Full size controlled gate is displayed in the last block  -->
      <!--  Add a control link if there are controls above the start of the controlled gate  -->
      <generic-gate v-if="controlFlags[arg.name].inControlledOp && controlFlags[arg.name].flags.last"
              style="z-index: 1; position: relative"
              :style="{bottom: 'calc('+ controlledOpIndexedArgs.length +' * var(--block-height))'}"
              :class="{'self-controlled-target': controlFlags[arg.name].selfControl}"
              :command="controlledCommand.command"
              :indexed-args="controlledOpIndexedArgs"
              :pos-adjust="posAdjust"
              :split="false"
              :link-vertical="controlledOpIndexedArgs[0].order > renderIndexedArgs[0].order"
              :condensed-registers="condensedRegisters">
        </generic-gate>
    </div>
  </div>
</template>

<style scoped lang="scss">
.self-controlled-gate {
  display: flex;
  position: relative;
}
.self-controlled-target{
  flex-grow: 1;
}
.self-controlled-link {
  position: absolute;
  left: calc(0px - var(--wire-height) / 2);
  bottom: 50%;
  overflow: hidden;
  height: calc(var(--block-height) / 2);
  width: calc(50% + var(--wire-height) / 2);

  &:after {
    content: " ";
    position: absolute;
    left: 0;
    top: 0;
    border: var(--wire-height) solid var(--wire-bg);
    border-radius: 100%;
    height: calc(var(--block-height));
    width: calc(100% - var(--wire-height) * 2);
  }
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
