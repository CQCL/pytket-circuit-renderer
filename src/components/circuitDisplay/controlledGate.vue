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
    indexedArgs: getIndexedArgs,
    renderIndexedArgs: renderIndexedArgs,
    controlledCommand () {
      return extractControlledCommand(this.command);
    },
    controlRegisters () {
      // Get condensed registers that act as controls for this op.
      return this.indexedArgs.filter(arg => {
        if (arg.pos !== -1 && arg.flags.condensed) {
          // Check if any of the condensed args are controls
          return arg.bits.reduce((acc, bit, i) => {
            return arg.pos[i] > -1
                ? acc && !this.isWireInList(bit, this.controlledCommand.args)
                : acc;
          }, true);
        }
        return false;
      }).map(arg => arg.name);
    }
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
          <div v-if="arg.order > 0" class="link link-top"></div>
      </div>

      <div v-else>
        <div v-if="arg.flags.condensed ? isWireInList(arg.name, controlRegisters) : !isWireInList(arg.name, controlledCommand.args)">
          <div class="gate_container">
            <wire :classical="arg.flags.classical" :condensed="arg.flags.condensed"></wire>
            <div v-if="opType === 'Condition' & !arg.flags.condensed" class="control_index">[[# arg.pos #]]</div>
            <div class="gate gate_control" :class="[arg.flags.classical ? 'classical' : 'z']"></div>
            <div v-if="arg.order > 0" class="link link-top"></div>
          </div>
        </div>

        <generic-gate v-else
              :command="controlledCommand"
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

<style>
</style>
