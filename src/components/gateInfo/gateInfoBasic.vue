<script>
import { chartMatrix, chartDef } from '@/components/charts/init'
import mathjaxContent from '@/components/mathjaxContent/mathjaxContent.vue'
import {
  CLASSICAL_OPS,
  INFO_CONTENT_OPS,
  CONDITION_OPS,
  CONTROLLED_OPS
} from '../circuitDisplay/consts'
import { renderOptions } from '@/components/circuitDisplay/provideKeys'
import classicalBoxInfo from './classicalBoxInfo'
import expBoxesInfo from '@/components/gateInfo/expBoxesInfo.vue'
import phasePolyBoxInfo from '@/components/gateInfo/phasePolyBoxInfo.vue'
import conditionalBoxInfo from '@/components/gateInfo/conditionalBoxInfo.vue'
import customBoxInfo from '@/components/gateInfo/customBoxInfo.vue'
import wasmBoxInfo from '@/components/gateInfo/wasmBoxInfo.vue'
import dummyBoxInfo from '@/components/gateInfo/dummyBoxInfo.vue'
import termSeqBoxInfo from '@/components/gateInfo/termSeqBoxInfo.vue'
import assertionBoxInfo from '@/components/gateInfo/assertionBoxInfo.vue'
import multiplexBoxesInfo from '@/components/gateInfo/multiplexBoxesInfo.vue'
import statePrepBoxInfo from '@/components/gateInfo/statePrepBoxInfo.vue'
import toffoliBoxInfo from '@/components/gateInfo/toffoliBoxInfo.vue'
import unitaryTabBoxInfo from '@/components/gateInfo/unitaryTabBoxInfo.vue'
import diagonalBoxInfo from '@/components/gateInfo/diagonalBoxInfo.vue'
import { coerceSympyAsciimath } from '@/components/mathjaxContent/utils'

export default {
  name: 'gate-info-basic',
  methods: { coerceSympyAsciimath },
  components: {
    chartMatrix,
    chartDef,
    mathjaxContent,
    classicalBoxInfo,
    expBoxesInfo,
    phasePolyBoxInfo,
    conditionalBoxInfo,
    customBoxInfo,
    wasmBoxInfo,
    dummyBoxInfo,
    termSeqBoxInfo,
    assertionBoxInfo,
    multiplexBoxesInfo,
    statePrepBoxInfo,
    toffoliBoxInfo,
    unitaryTabBoxInfo,
    diagonalBoxInfo
  },
  inject: {
    cropParams: renderOptions.cropParams
  },
  props: {
    command: { type: Object, required: true },
    controlledCommand: { type: Object },
    displayOp: { type: Object, required: true }
  },
  emits: ['updated:hasBaseContent'],
  data () {
    return {
      baseContentOps: [...INFO_CONTENT_OPS, ...CLASSICAL_OPS, ...CONDITION_OPS]
    }
  },
  computed: {
    isCondition () {
      return CONTROLLED_OPS.includes(this.command.op.type)
    },
    matrixTitle () {
      // Special naming schemes:
      if (this.displayOp.type === 'ExpBox') return 'Exponentiated Matrix'
      if (this.displayOp.type === 'ProjectorAssertionBox') return 'Projector Matrix'
      return 'Matrix'
    },
    matrix () {
      if ('matrix' in this.displayOp) {
        return this.displayOp.matrix
      }
      if ('box' in this.displayOp && 'matrix' in this.displayOp.box) {
        return this.displayOp.box.matrix
      }
      return undefined
    },
    params () {
      // Try to find all the params for this command
      const params = this.command.op.params ?? []
      return params.concat(
        this.command.op.box?.params ? this.command.op.box.params : [],
        this.isCondition ? this.displayOp.params ?? [] : [],
        this.isCondition ? this.displayOp.box?.params ?? [] : []
      )
    },
    hasLongParams () {
      return (!this.cropParams && (this.params.length > 3)) || (this.params.reduce((acc, param) => {
        return acc || param.toString().length > 5 || isNaN(Number(param))
      }, false))
    },
    hasBaseContent () {
      return this.hasLongParams ||
          !!this.matrix ||
          this.baseContentOps.includes(this.displayOp.type)
    }
  },
  watch: {
    hasBaseContent: {
      handler (next) {
        this.$emit('updated:hasBaseContent', next)
      },
      immediate: true
    }
  }
}
</script>

<template>
  <div v-if="hasBaseContent">
    <!--  Long params  -->
    <chart-def v-if="hasLongParams" title="Box params" hover>
      <div style="display: flex; align-items: center">
        <div v-for="(param, i) in params" :key="i" class="complex-number">
          <mathjax-content :formula="'\`' + coerceSympyAsciimath(param.toString()) + '\`'" :fallback="param.toString()"></mathjax-content>
        </div>
      </div>
    </chart-def>

    <!--  Extra box info  -->
    <conditional-box-info :command="command"></conditional-box-info>

    <!--  Matrix  -->
    <chart-def v-if="matrix" :title="matrixTitle" hover vertical heading>
      <chart-matrix :matrix="matrix" entry-type="complex" :display-title="false"></chart-matrix>
    </chart-def>

    <!--  Specific box info handling  -->
    <exp-boxes-info :display-op="displayOp"></exp-boxes-info>
    <phase-poly-box-info :display-op="displayOp"></phase-poly-box-info>
    <custom-box-info :display-op="displayOp"></custom-box-info>
    <assertion-box-info :display-op="displayOp"></assertion-box-info>
    <unitary-tab-box-info :display-op="displayOp"></unitary-tab-box-info>
    <wasm-box-info :display-command="controlledCommand ?? command" :display-op="displayOp"></wasm-box-info>
    <toffoli-box-info :display-op="displayOp"></toffoli-box-info>
    <multiplex-boxes-info :display-op="displayOp"></multiplex-boxes-info>
    <state-prep-box-info :display-op="displayOp"></state-prep-box-info>
    <diagonal-box-info  :display-op="displayOp"></diagonal-box-info>
    <term-seq-box-info :display-op="displayOp"></term-seq-box-info>
    <dummy-box-info :display-op="displayOp"></dummy-box-info>
    <classical-box-info :op="displayOp"></classical-box-info>
  </div>
</template>

<style>
</style>
