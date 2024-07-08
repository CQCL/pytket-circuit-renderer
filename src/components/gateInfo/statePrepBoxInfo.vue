<script>
import { chartDef, chartMatrix } from '@/components/charts/init'

export default {
  name: 'state-prep-box-info',
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
  <div v-if="displayOp.type === 'StatePreparationBox'">
    <chart-def title="State vector" hover>
      <chart-matrix :matrix="displayOp.box.statevector" :display-title="false" entry-type="complex">
      </chart-matrix>
    </chart-def>
    <chart-def title="Inverse" hover>
      [[# displayOp.box.is_inverse #]]
    </chart-def>
    <chart-def title="Includes reset" hover>
      [[# !!displayOp.box.with_initial_reset #]]
    </chart-def>
  </div>
</template>

<style>
</style>
