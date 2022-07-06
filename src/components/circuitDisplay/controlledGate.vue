<script>
import { registerEquality, getIndexedArgs, renderIndexedArgs, extractControlledCommand } from './utils';

import wire from './wire';
import genericGate from './genericGate';

export default {
  name: "controlled-gate",
  components: {
    wire,
    genericGate,
  },
  props: {
    args: {type: Array, required: true},
    command: {type: Object, required: true},
    circuitDetails: {type: Object, required: true},
    renderOptions: {type: Object, required: true},
    condensedRegisters: {type: Object, required: true},
  },
  computed: {
    opType () {
      return this.command.op.type;
    },
    nestedRenderOptions () {
      let newOptions = {...this.renderOptions};
      newOptions.recursive = false;
      return newOptions;
    },
    controlFlags () {
      let flags = {};
      for (const arg of this.args) {
        flags[arg] = {
          control: this.isWireInList(arg, this.controlledCommand.controlArgs),
          controlled: this.isWireInList(arg, this.controlledCommand.command.args),
        }
      }
      let inQuantumOp = false; // Display the connecting control wire as classical if there are no quantum controls.
      let lastControl = false;  // Track which control wire is displayed last.
      for (const arg of this.renderIndexedArgs.slice().reverse()) {
        // Iterate over backwards so we can easily identify the first quantum bit involved.
        inQuantumOp = inQuantumOp || (!arg.flags.classical && arg.pos > -1);
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
          }
        }
        if (!lastControl && flags[arg.name].control) {
          flags[arg.name].lastControl = true;
          lastControl = true;
        } else {
          flags[arg.name].lastControl = false;
        }
        flags[arg.name].classicalLink = !inQuantumOp;
        flags[arg.name].selfControl = flags[arg.name].control && flags[arg.name].controlled;
      }
      return flags;
    },
    controlledCommand () {
      return extractControlledCommand(this.command, []);
    },
    indexedArgs: getIndexedArgs,
    renderIndexedArgs: renderIndexedArgs,
  },
  methods: {
    isWireInList (arg, list) {
      return list.findIndex(reg => registerEquality(reg, arg)) > -1;
    },
    isClassicalWire (arg) {
      return this.circuitDetails.qubits.findIndex(reg => registerEquality(reg, arg)) === -1;
    },
    registerEquality: registerEquality,
  },
};

</script>

<template>
  <div :data-gate="opType">
    <div v-for="arg in renderIndexedArgs" :key="arg.name[0] + '-' + arg.order">
      <div v-if="arg.pos === -1" class="gate_container">
          <wire :classical="arg.flags.classical" :condensed="arg.flags.condensed"></wire>
          <div class="gate gate_connection" :class="{classical: arg.flags.classical}"></div>
          <div v-if="arg.order > 0" class="link link-top" :class="{'classical': controlFlags[arg.name].classicalLink}"></div>
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
            <div v-if="arg.order > 0 && !controlFlags[arg.name].controlled"
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
              :args="arg.flags.condensed ? arg.bits : [arg.name]"
              :split="true"
              :link-vertical="arg.order > 0 && !arg.flags.single"
              :circuitDetails="circuitDetails"
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
