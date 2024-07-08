<script>
import { chartDef } from '@/components/charts/init'

export default {
  name: 'assertion-box-info',
  components: {
    chartDef
  },
  props: {
    displayOp: { type: Object, required: true }
  }
}
</script>

<template>
  <div v-if="displayOp.type === 'StabiliserAssertionBox'">
    <chart-def title="Stabilisers" heading></chart-def>
    <chart-def v-for="(stab, i) in displayOp.box.stabilisers" :key="i" :title="stab.string[0]" hover>
      [[# stab.coeff #]]
    </chart-def>
  </div>
</template>

<style>
</style>
