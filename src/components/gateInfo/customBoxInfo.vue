<script>
import { chartDef } from '@/components/charts/init'
import mathjaxContent from '@/components/mathjaxContent/mathjaxContent.vue'

export default {
  name: 'custom-box-info',
  components: {
    mathjaxContent,
    chartDef
  },
  props: {
    displayOp: { type: Object, required: true }
  }
}
</script>

<template>
  <div v-if="['Custom', 'Composite', 'CompositeGate'].includes(displayOp.type)" class="hover-highlight">
    <chart-def title="Parameters" heading></chart-def>
    <chart-def v-for="(param, i) in displayOp.box.params" :key="i" title="" hover>
      <template #title>
        <mathjax-content :formula="'\`' + displayOp.box.gate.args[i] + '\`'" :fallback="displayOp.box.gate.args[i]"></mathjax-content>
      </template>
      <mathjax-content :formula="'\`' + param + '\`'" :fallback="param"></mathjax-content>
    </chart-def>
  </div>
</template>

<style>
</style>
