<script>
import { chartList, chartMatrix, chartDef, chartMapping } from '@/components/charts/init'
import mathjaxContent from '@/components/mathjaxContent/mathjaxContent.vue'
import {NESTED_CIRCUIT_OPS, POSSIBLE_TOOLTIP_OPS} from '../circuitDisplay/consts'
import gateInfoSubCircuit from './gateInfoSubCircuit.vue'
import gateInfoBasic from "@/components/gateInfo/gateInfoBasic.vue";
import { renderOptions } from '@/components/circuitDisplay/provideKeys'
import gateInfoTooltip from "@/components/gateInfo/gateInfoTooltip.vue";
import {infoComputedBase} from "@/components/gateInfo/utils";
import {extractControlledCommand} from "@/components/circuitDisplay/utils";

export default {
  name: 'gate-info',
  components: {
    gateInfoTooltip,
    chartMapping,
    chartList,
    chartMatrix,
    chartDef,
    mathjaxContent,
    gateInfoSubCircuit,
    gateInfoBasic,
  },
  props: {
    command: { type: Object, required: true },
    nBlocks: { type: Number, default: 1},
  },
  inject: {
    recursive: { from: renderOptions.recursive },
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
          Uncompute: false,
        },
      }
    }
  },
  computed: {
    opType () {
      return this.command.op.type
    },
    displayOp () {
      return POSSIBLE_TOOLTIP_OPS.includes(this.controlledCommand.op.type)
          ? this.controlledCommand.op
          : this.command.op
    },
    controlledCommand () {
      return extractControlledCommand(this.command, {}).command
    },
    // ...infoComputedBase,
    hasContent () {
      return this.flags.hasBaseContent
          || Object.values(this.flags.hasSubCircuit).reduce((acc, next) => acc || next)
    },
    hasSubCircuit () {
      return NESTED_CIRCUIT_OPS.includes(this.displayOp.type)
    },
    maybeHasContent () {
      // Skip gates for gates that certainly don't have extra info to display:
      // - part of a recursively displayed circuit
      // - simple gate with no params
      return !(this.recursive && this.hasSubCircuit)
          || (POSSIBLE_TOOLTIP_OPS.includes(this.displayOp.type))
    }
  },
  methods: {
    onCircuitDisplayUpdate () {
      // Make sure info modal resizes when the circuit is loaded
      this.$nextTick(() => {
        this.$refs.infoTooltip.$refs.infoModal.onResize()
      })
    },
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
