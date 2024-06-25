<script>
import { chartDef } from '@/components/charts/init'
import { CONDITION_OPS } from "@/components/circuitDisplay/consts";

export default {
  name: 'conditional-box-info',
  components: {
    chartDef,
  },
  props: {
    command: {type: Object, required: true},
  },
  computed: {
    isCondition () {
      return CONDITION_OPS.includes(this.command.op.type)
    }
  }
}
</script>

<template>
  <chart-def v-if="isCondition" title="Condition value" hover>
    [[# command.op.conditional.value #]]
  </chart-def>

  <chart-def v-if="isCondition" title="Condition width" hover>
    [[# command.op.conditional.width #]]
  </chart-def>
</template>

<style>
</style>
