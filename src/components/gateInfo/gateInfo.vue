<script>
import { NESTED_CIRCUIT_OPS, POSSIBLE_TOOLTIP_OPS } from '@/components/circuitDisplay/consts'
import { renderOptions } from '@/components/circuitDisplay/provideKeys'
import gateInfoSubCircuit from './gateInfoSubCircuit'
import gateInfoBasic from './gateInfoBasic'
import gateInfoTooltip from './gateInfoTooltip'
import { infoComputedBase } from './utils'

export default {
  name: 'gate-info',
  components: {
    gateInfoTooltip,
    gateInfoSubCircuit,
    gateInfoBasic
  },
  props: {
    command: { type: Object, required: true },
    nBlocks: { type: Number, default: 1 }
  },
  inject: {
    recursive: { from: renderOptions.recursive }
  },
  emits: ['register-teleport'],
  data () {
    return {
      visible: false,
      flags: {
        hasBaseContent: false,
        hasSubCircuit: {
          default: false,
          Compute: false,
          Action: false,
          Uncompute: false
        }
      }
    }
  },
  computed: {
    ...infoComputedBase,
    hasContent () {
      return this.flags.hasBaseContent ||
          Object.values(this.flags.hasSubCircuit).reduce((acc, next) => acc || next)
    },
    hasSubCircuit () {
      return NESTED_CIRCUIT_OPS.includes(this.displayOp.type)
    },
    maybeHasContent () {
      // Skip gates for gates that certainly don't have extra info to display:
      // - part of a recursively displayed circuit
      // - simple gate with no params
      if (this.recursive && this.hasSubCircuit) return false
      return POSSIBLE_TOOLTIP_OPS.includes(this.displayOp.type)
    }
  },
  methods: {
    onCircuitDisplayUpdate () {
      // Make sure info modal resizes when the circuit is loaded
      this.$nextTick(() => {
        this.$refs.infoTooltip.$refs.infoModal.onResize()
      })
    }
  }
}
</script>

<template>
  <gate-info-tooltip
      ref="infoTooltip"
      :ref-string="opType"
      :if-display="maybeHasContent"
      :show-display="hasContent"
      :n-blocks="nBlocks"
  >
    <template #title>
      [[# opType #]]
    </template>

    <template #content>
      <gate-info-basic
          :command="command"
          :controlled-command="controlledCommand"
          :display-op="displayOp"
          @updated:has-base-content="(val) => flags.hasBaseContent = val"
      ></gate-info-basic>

      <gate-info-sub-circuit v-if="displayOp.type === 'ConjugationBox'"
          v-for="key in ['Compute', 'Action', 'Uncompute']"
          :key="key"
          @updated="onCircuitDisplayUpdate"
          @update:has-sub-circuit="(val) => {flags.hasSubCircuit[key] = val}"
          :op="displayOp"
          :args="command.args"
          :circuit-type="key"
      ></gate-info-sub-circuit>

      <gate-info-sub-circuit v-if="hasSubCircuit"
          @updated="onCircuitDisplayUpdate"
          @update:has-sub-circuit="(val) => {flags.hasSubCircuit.default = val}"
          :op="displayOp"
      ></gate-info-sub-circuit>
    </template>
  </gate-info-tooltip>
</template>

<style>
</style>
