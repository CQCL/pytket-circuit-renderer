<script>
import { extractSubCircuit, extractControlledCommand } from '@/components/circuitDisplay/utils'
import { renderOptions } from '@/components/circuitDisplay/provideKeys'
import { chartDef } from '@/components/charts/init'
import gateInfoCircuit from "./gateInfoCircuit";

export default {
  name: 'gate-info-sub-circuit',
  components: {gateInfoCircuit, chartDef },
  props: {
    op: { type: Object, required: true },
    circuitType: { default: undefined },
    args: { type: Object, required: false }
  },
  emits: ['updated', 'update:hasSubCircuit'],
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
    },
    hasSubCircuit () {
      return !!this.subCircuit
    }
  },
  watch: {
    hasSubCircuit: {
      handler(next) {
        this.$emit('update:hasSubCircuit', next)
      },
      immediate: true,
    }
  },
  beforeCreate () {
    this.$options.components['circuit-display'] = require('@/components/circuitDisplay/circuitDisplay').default
  }
}
</script>

<template>
  <div v-if="subCircuit" style="overflow: auto;width: 100%">
    <chart-def :title="subCircuit.type + ' Circuit'" heading></chart-def>
    <div class="gate_container nested" style="padding-bottom: 1rem">
      <circuit-display @updated="$emit('updated')" :circuit="subCircuit.circuit"></circuit-display>
    </div>

    <gate-info-circuit :circuit="subCircuit.circuit"></gate-info-circuit>
  </div>
</template>

<style>
</style>
