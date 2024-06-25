<script>
import { chartDef, chartMatrix } from '@/components/charts/init'
import { regToStr } from "@/components/circuitDisplay/utils";

export default {
  name: 'wasm-box-info',
  components: {
    chartMatrix,
    chartDef,
  },
  props: {
    displayOp: {type: Object, required: true},
    controlledCommand: {type: Object, required: true},
  },
  computed: {
    wasmVectorInfo () {
      if (this.displayOp.type === 'WASM') {
        const inArgs = []
        const outArgs = []
        const nIn = this.displayOp.wasm.width_i_parameter.reduce(
          (acc, i) => {
            inArgs.push([this.controlledCommand.args.slice(acc, acc + i).map(reg => [regToStr(reg)]).join(', ')])
            return acc + i
          },
          0
        )
        const nOut = this.displayOp.wasm.width_o_parameter.reduce(
          (acc, i) => {
            outArgs.push([this.controlledCommand.args.slice(acc, acc + i).map(reg => [regToStr(reg)]).join(', ')])
            return acc + i
          },
          nIn
        )
        return {
          in: nIn > 0 ? inArgs : [[' ']],
          out: nOut - nIn > 0 ? outArgs : [[' ']]
        }
      }
      return false
    }
  }
}
</script>

<template>
  <div v-if="displayOp.type === 'WASM'">
    <chart-def title="Function" hover>
      [[# displayOp.wasm.func_name #]]
    </chart-def>
    <chart-def title="Classical bits" hover>
      [[# displayOp.wasm.n #]]
    </chart-def>
    <chart-def title="WASM bits" hover>
      [[# displayOp.wasm.ww_n #]]
    </chart-def>
    <chart-def title="Input vector bits" hover>
      <chart-matrix entry-type="text" :matrix="wasmVectorInfo.in" :displayTitle="false"></chart-matrix>
    </chart-def>
    <chart-def title="Output vector bits" hover>
      <chart-matrix entry-type="text" :matrix="wasmVectorInfo.out" :displayTitle="false"></chart-matrix>
    </chart-def>
    <chart-def title="WASM uid" hover>
      <div :style="{wordWrap: 'break-word', textWrap: 'wrap', maxWidth: '300px'}">
        [[# displayOp.wasm.wasm_file_uid #]]
      </div>
    </chart-def>
  </div>
</template>

<style>
</style>
