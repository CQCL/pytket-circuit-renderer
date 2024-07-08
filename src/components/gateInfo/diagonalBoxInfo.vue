<script>
import { chartDef, chartMatrix } from '@/components/charts/init'

export default {
  name: 'diagonal-box-info',
  components: {
    chartMatrix,
    chartDef
  },
  props: {
    displayOp: { type: Object, required: true }
  }
}
</script>

<template>
  <div v-if="displayOp.type === 'DiagonalBox'">
    <chart-def title="Diagonal" hover>
      <chart-matrix :matrix="displayOp.box.diagonal" :display-title="false" entry-type="complex">
      </chart-matrix>
    </chart-def>
    <chart-def title="Upper triangle" hover>
      [[# displayOp.box.upper_triangle #]]
    </chart-def>
  </div>
</template>

<style>
</style>
