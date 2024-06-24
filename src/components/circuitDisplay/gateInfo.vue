<script>
import { chartList, chartMatrix, chartDef, chartMapping } from '@/components/charts/init'
import mathjaxContent from '@/components/mathjaxContent/mathjaxContent'

import { CONTROLLED_OPS } from './consts'

import gateInfoSubCircuit from './gateInfoSubCircuit'
import gateInfoClassical from './gateInfoClassical'
import { renderOptions } from './provideKeys'
import { extractControlledCommand, regToStr } from './utils'
import GateInfoTooltip from "@/components/circuitDisplay/gateInfoTooltip";

export default {
  name: 'gate-info',
  components: {
    GateInfoTooltip,
    chartMapping,
    chartList,
    chartMatrix,
    chartDef,
    mathjaxContent,
    gateInfoSubCircuit,
    gateInfoClassical
  },
  props: {
    command: { type: Object, required: true }
  },
  inject: {
    recursive: { from: renderOptions.recursive },
  },
  emits: ['register-teleport', 'updated'],
  data () {
    // ops with content keys to be displayed directly
    const baseContentOps = [
      'ExpBox', 'PauliExpBox', 'PauliExpPairBox',
      'PauliExpCommutingSetBox', 'PhasePolyBox',
      'Custom', 'CustomGate', 'Composite', 'CompositeGate',
      'StabiliserAssertionBox', 'StatePreparationBox',
      'UnitaryTableauBox', 'WASM', 'ToffoliBox',
      'MultiplexorBox', 'MultiplexedRotationBox',
      'MultiplexedU2Box', 'MultiplexedTensoredU2Box',
      'DiagonalBox', 'TermSequenceBox',
      'DummyBox'
    ]
    return {
      controlledOps: CONTROLLED_OPS,
      baseContentOps,
      contentOps: [
        ...baseContentOps,
        // Matrix
        'Unitary1qBox', 'Unitary2qBox', 'Unitary3qBox',
        'ProjectorAssertionBox',
        // Classical
        'ClassicalExpBox', 'ClassicalTransform',
        'RangePredicate', 'ExplicitPredicate',
        'ExplicitModifier', 'SetBits', 'CopyBits',
        'MultiBit',
        // Nested
        'CircBox', 'ConjugationBox',
        // Controlled
        'Conditional',
      ],
      visible: false,
      // Pytket gives these as numbers
      GraphColouring: {
        2: 'Exhaustive',
        1: 'LargestFirst',
        0: 'Lazy'
      },
      PauliPartitionStrat: {
        1: 'CommutingSets',
        0: 'NonConflictingSets'
      }
    }
  },
  computed: {
    opType () {
      return this.command.op.type
    },
    op () {
      return this.command.op
    },
    matrix () {
      if ('matrix' in this.displayOp) {
        return this.displayOp.matrix
      }
      if ('box' in this.displayOp && 'matrix' in this.displayOp.box) {
        return this.displayOp.box.matrix
      }
      return false
    },
    matrixTitle () {
      // Special naming schemes:
      if (this.displayOp.type === 'ExpBox') return 'Exponentiated Matrix'
      if (this.displayOp.type === 'ProjectorAssertionBox') return 'Projector Matrix'
      return 'Matrix'
    },
    displayOp () {
      return this.hasNestedContent
        ? (
            this.isCondition ? this.op.conditional.op : this.op.box.op
          )
        : this.op
    },
    controlledCommand () {
      return extractControlledCommand(this.command, {}).command
    },
    isCondition () {
      return ['Condition', 'Conditional'].includes(this.opType)
    },
    hasNestedContent () {
      return (
        ['Condition', 'Conditional', 'Control', 'QControlBox'].includes(this.opType) &&
          'box' in this.op && 'op' in this.op.box &&
          this.contentOps.includes(this.op.box.op.type)
      ) || (this.isCondition && this.contentOps.includes(this.op.conditional.op.type))
    },
    hasContent () {
      return (
        this.contentOps.includes(this.opType) &&
        (!this.recursive || !['CircBox'].includes(this.opType))
      ) || this.hasLongParams
    },
    hasBaseContent () {
      return this.hasLongParams || this.matrix || this.isCondition || this.baseContentOps.includes(this.displayOp.type)
    },
    hasLongParams () {
      return (this.params.length > 3) || (this.params.reduce((acc, param) => {
        return acc || param.length > 5 || isNaN(Number(param))
      }, false))
    },
    params () {
      const params = 'params' in this.op && this.op.params ? this.op.params : []
      return params.concat(
        'box' in this.op && this.op.box.params ? this.op.box.params : [],
        this.isCondition && this.op.conditional.op.params ? this.op.conditional.op.params : []
      )
    },
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
  },
  methods: {
    formatBoolMatrix (matrix) {
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
    },
    formatMultiplexedOpMap (opMap) {
      return opMap.map(entry => {
        const ops = (Array.isArray(entry[1]) ? entry[1] : [entry[1]]).map(this.getBoxName)
        return [entry[0], ops]
      })
    },
    onCircuitDisplayUpdate () {
      // Make sure info modal resizes when the circuit is loaded
      this.$nextTick(() => {
        this.$refs.infoTooltip.$refs.infoModal.onResize()
      })
    },
    getBoxName (box) {
      return `${box.type}${box.params ? '(' + box.params.join(',') + ')' : ''}`
    },
    regToStr
  }
}
</script>

<template>
  <gate-info-tooltip ref="infoTooltip" :ref-string="opType" :should-display="hasContent || hasNestedContent">
    <template #title>
      [[# opType #]]
    </template>

    <template #content>
      <div v-if="hasBaseContent">
        <chart-def v-if="hasLongParams" title="Box params" hover>
          <div style="display: flex">
            <div v-for="(param, i) in params" :key="i" class="complex-number">
              <mathjax-content :formula="'\`' + param + '\`'"></mathjax-content>
            </div>
          </div>
        </chart-def>

        <chart-def v-if="matrix" :title="matrixTitle" hover vertical heading>
          <chart-matrix :matrix="matrix" entry-type="complex" :display-title="false"></chart-matrix>
        </chart-def>

        <div v-if="displayOp.type === 'ExpBox'">
          <chart-def title="Phase" hover>
            <mathjax-content :formula="'\`' + displayOp.box.phase + '\`'"></mathjax-content>
          </chart-def>
        </div>
        <div v-if="displayOp.type === 'PauliExpBox'">
          <chart-def title="Paulis">
            Phase
          </chart-def>
          <chart-def hover>
            <template #title>
              <chart-list :chart="displayOp.box.paulis"></chart-list>
            </template>
            <mathjax-content :formula="'\`' + displayOp.box.phase + '\`'"></mathjax-content>
          </chart-def>
          <chart-def v-if="displayOp.box.cx_config" title="Config" hover>
            [[# displayOp.box.cx_config #]]
          </chart-def>
        </div>

        <div v-if="displayOp.type === 'PauliExpPairBox'">
          <chart-def title="Pauli Pairs">
            Phase
          </chart-def>
          <chart-def v-for="(paulis, i) in displayOp.box.paulis_pair" :key="i" hover>
            <template #title>
              <chart-list :chart="paulis"></chart-list>
            </template>
            <mathjax-content :formula="'\`' + displayOp.box.phase_pair[i] + '\`'"></mathjax-content>
          </chart-def>
          <chart-def v-if="displayOp.box.cx_config" title="Config" hover>
            [[# displayOp.box.cx_config #]]
          </chart-def>
        </div>

        <div v-if="displayOp.type === 'PauliExpCommutingSetBox'">
          <chart-def title="Pauli Gadgets">
            Phase
          </chart-def>
          <chart-def v-for="(gadget, i) in displayOp.box.pauli_gadgets" :key="i" hover>
            <template #title>
              <chart-list :chart="gadget[0]"></chart-list>
            </template>
            <mathjax-content :formula="'\`' + gadget[1] + '\`'"></mathjax-content>
          </chart-def>
          <chart-def v-if="displayOp.box.cx_config" title="Config" hover>
            [[# displayOp.box.cx_config #]]
          </chart-def>
        </div>

        <div v-if="displayOp.type === 'PhasePolyBox'">
          <chart-def title="Encapsulating" hover>
            [[# displayOp.box.n_qubits #]] gates
          </chart-def>
          <chart-def title="Qubit Mapping" hover vertical>
            <chart-mapping :mapping="displayOp.box.qubit_indices" coerce-from="register"></chart-mapping>
          </chart-def>
          <chart-def title="Linear Transformation" hover vertical>
            <chart-matrix :matrix="formatBoolMatrix(displayOp.box.linear_transformation)" :display-title="false" entry-type="bool"></chart-matrix>
          </chart-def>
          <chart-def title="Phase Polynomial" heading></chart-def>
          <div>
            <chart-def v-for="(entry, i) in displayOp.box.phase_polynomial" :key="i" title="" hover>
              <template #title>
                <chart-matrix :matrix="entry[0]" :depth="1" :display-title="false" entry-type="boolStr"></chart-matrix>
              </template>
              <mathjax-content :formula="'\`' + entry[1] + '\`'"></mathjax-content>
            </chart-def>
          </div>
        </div>

        <div v-if="['Custom', 'Composite', 'CompositeGate'].includes(displayOp.type)" class="mathjax-content hover-highlight">
          <chart-def title="Parameters" heading></chart-def>
          <chart-def v-for="(param, i) in displayOp.box.params" :key="i" title="" hover>
            <template #title>
              <mathjax-content :formula="'\`' + displayOp.box.gate.args[i] + '\`'"></mathjax-content>
            </template>
            <mathjax-content :formula="'\`' + param + '\`'"></mathjax-content>
          </chart-def>
        </div>

        <chart-def v-if="isCondition" title="Condition value" hover>
          [[# command.op.conditional.value #]]
        </chart-def>

        <chart-def v-if="isCondition" title="Condition width" hover>
          [[# command.op.conditional.width #]]
        </chart-def>

        <div v-if="displayOp.type === 'StabiliserAssertionBox'">
          <chart-def title="Stabilisers" heading></chart-def>
          <chart-def v-for="(stab, i) in displayOp.box.stabilisers" :key="i" :title="stab.string[0]" hover>
            [[# stab.coeff #]]
          </chart-def>
        </div>

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

        <div v-if="[
            'MultiplexorBox', 'MultiplexedU2Box', 'MultiplexedRotationBox', 'MultiplexedTensoredU2Box'
        ].includes(displayOp.type)">
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

        <div v-if="displayOp.type === 'DiagonalBox'">
          <chart-def title="Diagonal" hover>
            <chart-matrix :matrix="displayOp.box.diagonal" :display-title="false" entry-type="complex">
            </chart-matrix>
          </chart-def>
          <chart-def title="Upper triangle" hover>
            [[# displayOp.box.upper_triangle #]]
          </chart-def>
        </div>

        <div v-if="displayOp.type === 'TermSequenceBox'">
          <chart-def title="Pauli Gadgets">
            Phase
          </chart-def>
          <chart-def v-for="(gadget, i) in displayOp.box.pauli_gadgets" :key="i" hover>
            <template #title>
              <chart-list :chart="gadget[0]"></chart-list>
            </template>
            <mathjax-content :formula="'\`' + gadget[1] + '\`'"></mathjax-content>
          </chart-def>
          <chart-def title="Synthesis Strategy" hover>
            [[# displayOp.box.synth_strategy #]]
          </chart-def>
          <chart-def title="Partition Strategy" hover>
            [[# PauliPartitionStrat[displayOp.box.partition_strategy] #]]
          </chart-def>
          <chart-def title="Graph Colouring" hover>
            [[# GraphColouring[displayOp.box.graph_colouring] #]]
          </chart-def>
          <chart-def title="Config" hover>
            [[# displayOp.box.cx_config #]]
          </chart-def>
        </div>

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
          <chart-def v-for="([optype, val], i) in displayOp.box.resource_data.op_type_count" :key="i + ' - ' + val.toString()" hover>
            <template #title>
              <chart-list :chart="[optype]" :display-title="false" />
            </template>
            [[# val.min #]] - [[# val.max #]]
          </chart-def>

          <chart-def title="Gate Depths" heading></chart-def>
          <chart-def v-for="([optype, val], i) in displayOp.box.resource_data.op_type_depth" :key="i + ' - ' + val.toString()" hover>
            <template #title>
              <chart-list :chart="[optype]" :display-title="false" />
            </template>
              [[# val.min #]] - [[# val.max #]]
          </chart-def>
        </div>

        <gate-info-classical :op="displayOp"></gate-info-classical>
      </div>

      <div v-if="displayOp.type === 'ConjugationBox'" v-for="key in ['Compute', 'Action', 'Uncompute']">
        <gate-info-sub-circuit :key="key"
            @updated="onCircuitDisplayUpdate"
            :op="displayOp"
            :args="command.args"
            :circuit-type="key"
        ></gate-info-sub-circuit>
      </div>

      <gate-info-sub-circuit @updated="onCircuitDisplayUpdate" :op="displayOp"></gate-info-sub-circuit>
    </template>
  </gate-info-tooltip>
</template>

<style>
</style>
