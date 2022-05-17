<script>
import { extractSubCircuit, extractControlledCommand } from "./utils";

export default  {
  name: "gate-info-sub-circuit",
  components: {},
  props: {
    op: {type: Object, required: true},
    renderOptions: {type: Object, required: true},
  },
  computed: {
    opType () {
      return this.op.type;
    },
    subCircuit () {
      let newRenderOptions = {...this.renderOptions};
      newRenderOptions.condensed = true;
      newRenderOptions.nested = true;
      newRenderOptions.recursive = false;

      // Default is that this box contains a circuit directly
      let circuit = extractSubCircuit(this.op);
      if (circuit) {
        return {
          circuit: circuit,
          type: "Nested",
          renderOptions: newRenderOptions,
        };
      }

      // Otherwise, this could be a circuit controlled by another box
      circuit = extractSubCircuit(
        extractControlledCommand({
          op: this.op,
          args: []
        })
      );
      if (circuit) {
        return {
          circuit: circuit,
          type: "Controlled",
          renderOptions: newRenderOptions,
        }
      }
      return false;
    },
  },
  beforeCreate () {
    this.$options.components["circuit-display"] = require('./circuitDisplay.vue').default;
  },
}
</script>

<template>
  <div v-if="subCircuit" style="overflow: auto;width: 100%">
    <h4>[[# subCircuit.type #]] Circuit</h4>
    <div class="gate_container nested">
      <circuit-display
          :circuit="subCircuit.circuit"
          :render-options="subCircuit.renderOptions"
      >
      </circuit-display>
    </div>
  </div>
</template>

<style>
</style>
