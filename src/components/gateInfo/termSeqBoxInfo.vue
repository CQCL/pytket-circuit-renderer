<script>
import { chartDef, chartList } from '@/components/charts/init'
import mathjaxContent from '@/components/mathjaxContent/mathjaxContent.vue'

export default {
  name: 'term-seq-box-info',
  components: {
    chartList,
    mathjaxContent,
    chartDef
  },
  props: {
    displayOp: { type: Object, required: true }
  },
  data () {
    return {
      // Pytket gives these as numbers
      GraphColouring: {
        2: 'Exhaustive',
        1: 'LargestFirst',
        0: 'Lazy'
      },
      PauliPartitionStrat: {
        1: 'CommutingSets',
        0: 'NonConflictingSets'
      }
    }
  }
}
</script>

<template>
  <div v-if="displayOp.type === 'TermSequenceBox'">
    <chart-def title="Pauli Gadgets">
      Phase
    </chart-def>
    <chart-def v-for="(gadget, i) in displayOp.box.pauli_gadgets" :key="i" hover>
      <template #title>
        <chart-list :chart="gadget[0]"></chart-list>
      </template>
      <mathjax-content :formula="'\`' + gadget[1] + '\`'" :fallback="gadget[1]"></mathjax-content>
    </chart-def>
    <chart-def title="Synthesis Strategy" hover>
      [[# displayOp.box.synth_strategy #]]
    </chart-def>
    <chart-def title="Partition Strategy" hover>
      [[# PauliPartitionStrat[displayOp.box.partition_strategy] #]]
    </chart-def>
    <chart-def title="Graph Colouring" hover>
      [[# GraphColouring[displayOp.box.graph_colouring] #]]
    </chart-def>
    <chart-def title="Config" hover>
      [[# displayOp.box.cx_config #]]
    </chart-def>
  </div>
</template>

<style>
</style>
