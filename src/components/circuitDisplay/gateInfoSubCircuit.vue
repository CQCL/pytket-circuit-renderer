<script>
import { extractSubCircuit, extractControlledCommand } from './utils'
import { renderOptions } from './provideKeys'
import { chartDef } from '@/components/charts/init'

export default {
  name: 'gate-info-sub-circuit',
  components: { chartDef },
  props: {
    op: { type: Object, required: true },
    circuitType: { default: undefined },
    args: { type: Object, required: false }
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
      // If circuit type is specified, we must extract that particular circuit from a conjugation box.
      const isConjBox = this.circuitType && this.opType === 'ConjugationBox'
      const op = isConjBox ? this.op.box[this.circuitType.toLowerCase()] : this.op

      if (isConjBox) {
        if (!op) return false
        // Upgrade the single command into a circuit. No bits are involved.
        return {
          circuit: {
            qubits: this.args ?? [],
            bits: [],
            commands: [{ op, args: this.args }]
          },
          type: this.circuitType
        }
      }

      // Default is that this box contains a circuit directly
      let circuit = extractSubCircuit(op)
      if (circuit) {
        return {
          circuit,
          type: 'Nested'
        }
      }

      // Otherwise, this could be a circuit controlled by another box
      circuit = extractSubCircuit(
        extractControlledCommand({
          op,
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
    <chart-def :title="subCircuit.type + ' Circuit'"></chart-def>
    <div class="gate_container nested">
      <circuit-display @updated="$emit('updated')" :circuit="subCircuit.circuit"></circuit-display>
    </div>
  </div>
</template>

<style>
</style>
