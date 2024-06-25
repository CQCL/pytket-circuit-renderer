<script>
import { chartDef, chartList, chartMatrix } from '@/components/charts/init'
import { MULTIPLEXED_OPS } from "@/components/circuitDisplay/consts";

export default {
  name: 'multiplexed-box-info',
  data() {
    return { MULTIPLEXED_OPS }
  },
  components: {
    chartList,
    chartMatrix,
    chartDef,
  },
  props: {
    displayOp: { type: Object, required: true },
  },
  methods: {
    formatMultiplexedOpMap (opMap) {
      return opMap.map(entry => {
        const ops = (Array.isArray(entry[1]) ? entry[1] : [entry[1]]).map(this.getBoxName)
        return [entry[0], ops]
      })
    },
    getBoxName (box) {
      return `${box.type}${box.params ? '(' + box.params.join(',') + ')' : ''}`
    },
  }
}
</script>

<template>
    <div v-if="MULTIPLEXED_OPS.includes(displayOp.type)">
      <chart-def  v-if="displayOp.type === 'MultiplexedU2Box'" title="Implement diagonal" hover>
        [[# displayOp.box.impl_diag #]]
      </chart-def>
      <div>
        <chart-def title="Mapping" heading></chart-def>
        <chart-def v-for="(entry, i) in formatMultiplexedOpMap(displayOp.box.op_map)" :key="i" title="" hover>
          <template #title>
            <chart-matrix :matrix="entry[0]" :display-title="false" :depth="1" entry-type="boolStr">
            </chart-matrix>
          </template>
          <chart-list :chart="entry[1]" :display-title="false"></chart-list>
        </chart-def>
      </div>
    </div>
</template>

<style>
</style>
