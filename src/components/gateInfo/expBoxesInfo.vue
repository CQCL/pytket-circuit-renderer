<script>
import { chartList, chartDef } from '@/components/charts/init'
import mathjaxContent from '@/components/mathjaxContent/mathjaxContent.vue'

export default {
  name: 'exp-boxes-info',
  components: {
    chartList,
    chartDef,
    mathjaxContent,
  },
  props: {
    displayOp: { type: Object, required: true },
  },
}
</script>

<template>
  <div v-if="displayOp.type === 'ExpBox'">
    <chart-def title="Phase" hover>
      <mathjax-content :formula="'\`' + displayOp.box.phase + '\`'" :fallback="displayOp.box.phase"></mathjax-content>
    </chart-def>
  </div>

  <div v-if="displayOp.type === 'PauliExpBox'">
    <chart-def title="Paulis">
      Phase
    </chart-def>
    <chart-def hover>
      <template #title>
        <chart-list :chart="displayOp.box.paulis"></chart-list>
      </template>
      <mathjax-content :formula="'\`' + displayOp.box.phase + '\`'" :fallback="displayOp.box.phase"></mathjax-content>
    </chart-def>
    <chart-def v-if="displayOp.box.cx_config" title="Config" hover>
      [[# displayOp.box.cx_config #]]
    </chart-def>
  </div>

  <div v-if="displayOp.type === 'PauliExpPairBox'">
    <chart-def title="Pauli Pairs">
      Phase
    </chart-def>
    <chart-def v-for="(paulis, i) in displayOp.box.paulis_pair" :key="i" hover>
      <template #title>
        <chart-list :chart="paulis"></chart-list>
      </template>
      <mathjax-content :formula="'\`' + displayOp.box.phase_pair[i] + '\`'" :fallback="displayOp.box.phase_pair[i]"></mathjax-content>
    </chart-def>
    <chart-def v-if="displayOp.box.cx_config" title="Config" hover>
      [[# displayOp.box.cx_config #]]
    </chart-def>
  </div>

  <div v-if="displayOp.type === 'PauliExpCommutingSetBox'">
    <chart-def title="Pauli Gadgets">
      Phase
    </chart-def>
    <chart-def v-for="(gadget, i) in displayOp.box.pauli_gadgets" :key="i" hover>
      <template #title>
        <chart-list :chart="gadget[0]"></chart-list>
      </template>
      <mathjax-content :formula="'\`' + gadget[1] + '\`'" :fallback="gadget[1]"></mathjax-content>
    </chart-def>
    <chart-def v-if="displayOp.box.cx_config" title="Config" hover>
      [[# displayOp.box.cx_config #]]
    </chart-def>
  </div>
</template>

<style>
</style>
