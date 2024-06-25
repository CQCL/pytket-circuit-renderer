<script>
import { chartDef, chartList } from '@/components/charts/init'

export default {
  name: 'dummy-box-info',
  components: {
    chartList,
    chartDef,
  },
  props: {
    displayOp: { type: Object, required: true },
  },
}
</script>

<template>
  <div v-if="displayOp.type === 'DummyBox'">
    <chart-def title="Bits" hover>
      [[# displayOp.box.n_bits #]]
    </chart-def>
    <chart-def title="Qubits" hover>
      [[# displayOp.box.n_qubits #]]
    </chart-def>

    <chart-def title="Gate Depth" hover>
      [[# displayOp.box.resource_data.gate_depth.min #]] - [[# displayOp.box.resource_data.gate_depth.max #]]
    </chart-def>
    <chart-def title="2q Gate Depth" hover>
      [[# displayOp.box.resource_data.two_qubit_gate_depth.min #]] - [[# displayOp.box.resource_data.two_qubit_gate_depth.max #]]
    </chart-def>

    <chart-def title="Gate Counts" heading></chart-def>
    <chart-def
        v-for="([optype, val], i) in displayOp.box.resource_data.op_type_count"
        :key="i + ' - ' + val.toString()"
        hover
    >
      <template #title>
        <chart-list :chart="[optype]" :display-title="false" />
      </template>
      [[# val.min #]] - [[# val.max #]]
    </chart-def>

    <chart-def title="Gate Depths" heading></chart-def>
    <chart-def
        v-for="([optype, val], i) in displayOp.box.resource_data.op_type_depth"
        :key="i + ' - ' + val.toString()"
        hover
    >
      <template #title>
        <chart-list :chart="[optype]" :display-title="false" />
      </template>
        [[# val.min #]] - [[# val.max #]]
    </chart-def>
  </div>
</template>

<style>
</style>
