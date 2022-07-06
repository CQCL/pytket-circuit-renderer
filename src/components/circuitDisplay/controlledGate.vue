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
  },
  methods: {
    isControlWire (arg) {
      return this.controlledCommand.args.findIndex(reg => registerEquality(reg, arg)) === -1;
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
          <wire :classical="arg.flags.classical"></wire>
          <div class="gate gate_connection" :class="{classical: arg.flags.classical}"></div>
          <div v-if="arg.order > 0" class="link link-top"></div>
      </div>

      <div v-else>
        <div v-if="isControlWire(arg.name)">
          <div class="gate_container">
            <wire :classical="arg.flags.classical" :condensed="arg.flags.condensed"></wire>
            <div v-if="opType === 'Condition' & !arg.flags.condensed" class="control_index">[[# arg.pos #]]</div>
            <div class="gate gate_control" :class="[arg.flags.classical ? 'classical' : 'z']"></div>
            <div v-if="arg.order > 0" class="link link-top"></div>
          </div>
        </div>

        <generic-gate v-else
              :command="controlledCommand"
              :args="[arg.name]"
              :split="true"
              :link-vertical="arg.order > 0"
              :circuitDetails="circuitDetails"
              :render-options="nestedRenderOptions">
        </generic-gate>
      </div>
    </div>
  </div>
</template>

<style>
</style>
