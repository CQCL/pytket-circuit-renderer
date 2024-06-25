<script>
import { chartDef, chartMapping, chartMatrix } from '@/components/charts/init'

export default {
  name: 'toffoli-box-info',
  components: {
    chartMapping,
    chartMatrix,
    chartDef,
  },
  props: {
    displayOp: { type: Object, required: true },
  },
}
</script>

<template>
  <div v-if="displayOp.type === 'ToffoliBox'">
    <chart-def title="Strategy" hover>
      [[# displayOp.box.strat ? displayOp.box.strat : (displayOp.box.cycles ? 'Cycle' : 'Matching') #]]
    </chart-def>
    <!-- Backwards compatibility -->
    <chart-def v-if="displayOp.box.cycles" title="Cycles" vertical hover>
      <chart-matrix :depth="3" :matrix="displayOp.box.cycles" :display-title="false" entry-type="boolStr">
      </chart-matrix>
    </chart-def>

    <div v-if="displayOp.box.permutation">
      <chart-def title="Rotation Axis" hover>
        [[# displayOp.box.rotation_axis #]]
      </chart-def>
      <chart-def title="Permutation" vertical hover heading>
        <chart-mapping coerce-from="state" coerce-to="state"
                     :mapping="displayOp.box.permutation"
                     :vertical="true"
        ></chart-mapping>
      </chart-def>
    </div>
  </div>
</template>

<style>
</style>
