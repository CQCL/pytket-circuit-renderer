<script>
import { POSSIBLE_TOOLTIP_OPS } from '@/components/circuitDisplay/consts'
import { renderOptions } from '@/components/circuitDisplay/provideKeys'
import gateInfoBasic from './gateInfoBasic'
import gateInfoTooltip from './gateInfoTooltip'
import gateInfoCircuit from './gateInfoCircuit'
import {infoComputedBase} from "@/components/gateInfo/utils";

export default {
  name: 'circuit-info',
  components: {
    gateInfoCircuit,
    gateInfoTooltip,
    gateInfoBasic,
  },
  props: {
    command: { type: Object, default: undefined },
    circuit: { type: Object, required: true },
  },
  inject: {
    recursive: { from: renderOptions.recursive },
  },
  emits: ['register-teleport'],
  data () {
    return {
      visible: false,
      hasBaseContent: false,
    }
  },
  computed: {
    title () {
      return this.hasBaseContent ? this.opType : 'Circuit Information'
    },
    maybeHasContent () {
      return this.command && POSSIBLE_TOOLTIP_OPS.includes(this.displayOp.type)
    },
    ...infoComputedBase
  },
}
</script>

<template>
  <gate-info-tooltip
      ref-string="base-circuit"
      :if-display="true"
      :show-display="true"
  >
    <template #trigger>
      <div class="circuit-info-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info" viewBox="0 0 16 16">
          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
        </svg>
      </div>
    </template>

    <template #title>[[# title #]]</template>

    <template #content>
      <gate-info-basic
          v-if="maybeHasContent"
          :display-op="displayOp"
          :command="command"
          @updated:has-base-content="(val) => hasBaseContent = val"
      ></gate-info-basic>
      <gate-info-circuit :circuit="circuit"></gate-info-circuit>
    </template>
  </gate-info-tooltip>
</template>

<style>
</style>
