<script>
import { chartDef, chartList, chartMatrix } from '@/components/charts/init'
import { regToStr } from '@/components/circuitDisplay/utils'

export default {
  name: 'unitary-tab-box-info',
  components: {
    chartList,
    chartMatrix,
    chartDef
  },
  props: {
    displayOp: { type: Object, required: true }
  },
  methods: {
    regToStr
  }
}
</script>

<template>
  <div v-if="displayOp.type === 'UnitaryTableauBox'">
    <chart-def title="Qubits" hover>
      <chart-list :chart="displayOp.box.tab.qubits.map(regToStr)" :display-title="false"></chart-list>
    </chart-def>
    <chart-def title="Tableau" vertical hover heading>
      <table>
        <tr class="text-2">
          <td>X</td>
          <td>Z</td>
          <td>Phase</td>
        </tr>
        <tr>
          <td>
            <chart-matrix :matrix="displayOp.box.tab.tab.xmat" :display-title="false" entry-type="boolStr">
            </chart-matrix>
          </td>
          <td>
            <chart-matrix :matrix="displayOp.box.tab.tab.zmat" :display-title="false" entry-type="boolStr">
            </chart-matrix>
          </td>
          <td>
            <chart-matrix :matrix="displayOp.box.tab.tab.phase" :display-title="false" entry-type="boolStr">
            </chart-matrix>
          </td>
        </tr>
      </table>
    </chart-def>
  </div>
</template>

<style>
</style>
