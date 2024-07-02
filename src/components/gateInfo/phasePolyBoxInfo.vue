<script>
import { chartList, chartDef, chartMatrix, chartMapping } from '@/components/charts/init'
import mathjaxContent from '@/components/mathjaxContent/mathjaxContent.vue'

export default {
  name: 'phase-poly-box-info',
  components: {
    chartMapping,
    chartMatrix,
    chartList,
    chartDef,
    mathjaxContent,
  },
  props: {
    displayOp: { type: Object, required: true },
  },
  computed: {
    linearTransformationMatrix () {
      const matrix = this.displayOp.box?.linear_transformation
      if (matrix) {
        const nQubits = Math.round(Math.log(matrix.length))
        const basis = []
        for (const x of Array(2 ** nQubits).keys()) {
          basis.push(
              (new Array(1 + nQubits).join('0') + x.toString(2))
                  .slice(-nQubits)
          )
        }
        const formattedMatrix = []
        for (const row of matrix) {
          formattedMatrix.push((basis, row.map((x) => x ? '1' : '0')))
        }
        return formattedMatrix
      }
      return undefined
    }
  },
}
</script>

<template>
  <div v-if="displayOp.type === 'PhasePolyBox'">
    <chart-def title="Encapsulating" hover>
      [[# displayOp.box.n_qubits #]] gates
    </chart-def>
    <chart-def title="Qubit Mapping" hover vertical>
      <chart-mapping :mapping="displayOp.box.qubit_indices" coerce-from="register"></chart-mapping>
    </chart-def>
    <chart-def title="Linear Transformation" hover vertical>
      <chart-matrix
          :matrix="linearTransformationMatrix"
          :display-title="false"
          entry-type="bool"
      ></chart-matrix>
    </chart-def>
    <chart-def title="Phase Polynomial" heading></chart-def>
    <div>
      <chart-def v-for="(entry, i) in displayOp.box.phase_polynomial" :key="i" title="" hover>
        <template #title>
          <chart-matrix :matrix="entry[0]" :depth="1" :display-title="false" entry-type="boolStr"></chart-matrix>
        </template>
        <mathjax-content :formula="'\`' + entry[1] + '\`'" :fallback="entry[1]"></mathjax-content>
      </chart-def>
    </div>
  </div>
</template>

<style>
</style>
