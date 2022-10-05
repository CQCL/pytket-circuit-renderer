<script>
import { extractSubCircuit, extractControlledCommand } from './utils'
import { renderOptions } from './provideKeys'

export default {
  name: 'gate-info-sub-circuit',
  components: {},
  props: {
    op: { type: Object, required: true }
  },
  emits: ['updated'],
  provide () {
    return {
      [renderOptions.recursive]: false,
      [renderOptions.condensed]: true,
      [renderOptions.nested]: true
    }
  },
  computed: {
    opType () {
      return this.op.type
    },
    subCircuit () {
      // Default is that this box contains a circuit directly
      let circuit = extractSubCircuit(this.op)
      if (circuit) {
        return {
          circuit,
          type: 'Nested'
        }
      }

      // Otherwise, this could be a circuit controlled by another box
      circuit = extractSubCircuit(
        extractControlledCommand({
          op: this.op,
          args: []
        }, false).command
      )
      if (circuit) {
        return {
          circuit,
          type: 'Controlled'
        }
      }
      return false
    }
  },
  beforeCreate () {
    this.$options.components['circuit-display'] = require('./circuitDisplay.vue').default
  }
}
</script>

<template>
  <div v-if="subCircuit" style="overflow: auto;width: 100%">
    <h4>[[# subCircuit.type #]] Circuit</h4>
    <div class="gate_container nested">
      <circuit-display @updated="$emit('updated')" :circuit="subCircuit.circuit"></circuit-display>
    </div>
  </div>
</template>

<style>
</style>
