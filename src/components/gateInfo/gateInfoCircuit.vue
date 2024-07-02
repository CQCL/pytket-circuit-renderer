<script>
import { chartList, chartDef, chartMapping } from '@/components/charts/init'
import { regToStr } from '@/components/circuitDisplay/utils'
import MathjaxContent from '@/components/mathjaxContent/mathjaxContent'

export default {
  name: 'gate-info-circuit',
  components: {
    MathjaxContent,
    chartMapping,
    chartList,
    chartDef
  },
  props: {
    circuit: { type: Object, required: true }
  },
  methods: {
    regToStr
  }
}
</script>

<template>
  <div v-if="circuit">
    <chart-def v-if="circuit.name" title="Name" hover>
      <mathjax-content :formula="circuit.name" :fallback="circuit.name"></mathjax-content>
    </chart-def>

    <chart-def v-if="circuit.phase" title="Global Phase" hover>
      <mathjax-content :formula="'\`' + circuit.phase + '\`'"></mathjax-content>
    </chart-def>

    <chart-def title="Qubits" hover>
      [[# circuit.qubits.length #]]
    </chart-def>
    <chart-def
        v-if="circuit.created_qubits && circuit.created_qubits.length > 0"
        title="Created qubits" hover
    >
      <chart-list :chart="circuit.created_qubits.map(regToStr)" :display-title="false"></chart-list>
    </chart-def>
    <chart-def
        v-if="circuit.discarded_qubits && circuit.discarded_qubits.length > 0"
        title="Discarded qubits" hover
    >
      <chart-list :chart="circuit.discarded_qubits.map(regToStr)" :display-title="false"></chart-list>
    </chart-def>

    <chart-def title="Classical bits" hover>
      [[# circuit.bits.length #]]
    </chart-def>
    <chart-def v-if="circuit.number_of_ws" title="WASM bits" hover>
      [[# circuit.number_of_ws #]]
    </chart-def>

    <chart-def vertical hover
        v-if="circuit.implicit_permutation && circuit.implicit_permutation.length > 0"
        title="Implicit Permutation"
    >
      <chart-mapping coerce-from="register" coerce-to="register"
                   :mapping="circuit.implicit_permutation"
                   :vertical="true"
      ></chart-mapping>
    </chart-def>
  </div>
</template>

<style>
</style>
