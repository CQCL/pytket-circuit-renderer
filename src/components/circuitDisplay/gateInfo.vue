<script>
import { teleportFrom } from '@/components/teleport/init'
import { chartList, chartMatrix, chartDef, chartMapping } from '@/components/charts/init'
import mathjaxContent from '@/components/mathjaxContent/mathjaxContent'

import { CONTROLLED_OPS } from './consts'

import infoModal from './infoModal'
import gateInfoSubCircuit from './gateInfoSubCircuit'
import gateInfoClassical from './gateInfoClassical'
import { renderOptions, teleportConfig } from './provideKeys'

export default {
  name: 'gate-info',
  components: {
    chartMapping,
    chartList,
    chartMatrix,
    chartDef,
    infoModal,
    teleportFrom,
    mathjaxContent,
    gateInfoSubCircuit,
    gateInfoClassical
  },
  props: {
    command: { type: Object, required: true }
  },
  inject: {
    recursive: { from: renderOptions.recursive },
    teleportId: { from: teleportConfig.to }
  },
  emits: ['register-teleport', 'updated'],
  data () {
    return {
      controlledOps: CONTROLLED_OPS,
      contentOps: [
        'Unitary1qBox', 'Unitary2qBox', 'Unitary3qBox',
        'ExpBox', 'PauliExpBox', 'ClassicalExpBox',
        'PauliExpPairBox', 'PauliExpCommutingSetBox',
        'PhasePolyBox', 'CircBox', 'Conditional',
        'Custom', 'CustomGate', 'Composite', 'CompositeGate',
        'ProjectorAssertionBox', 'StabiliserAssertionBox',
        'ExplicitPredicate', 'ExplicitModifier',
        'ClassicalTransform', 'SetBits', 'CopyBits',
        'MultiBit', 'RangePredicate', 'StatePreparationBox',
        'UnitaryTableauBox', 'WASM', 'ToffoliBox',
        'MultiplexorBox', 'MultiplexedRotationBox',
        'MultiplexedU2Box', 'MultiplexedTensoredU2Box',
        'DiagonalBox', 'ConjugationBox'
      ],
      visible: false,
      teleportToId: this.teleportId
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
    displayOp () {
      return this.hasNestedContent
        ? (
            this.isCondition ? this.op.conditional.op : this.op.box.op
          )
        : this.op
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
      return (this.contentOps.includes(this.opType) &&
          (!this.recursive || !['CircBox'].includes(this.opType))) ||
          this.hasLongParams
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
        this.$refs.infoModal.onResize()
      })
    },
    getBoxName (box) {
      return `${box.type}${box.params ? '(' + box.params.join(',') + ')' : ''}`
    }
  }
}
</script>

<template>
  <div v-if="hasContent || hasNestedContent">
    <div @click="visible = true" class="tool-tip-container" :data-cy="'open-tool-tip-' + this.opType"></div>

    <!-- content to be rendered in the info modal -->
    <div style="display: none">
      <teleport-from :to="visible ? teleportToId : ''">
        <info-modal ref="infoModal" v-model="visible" class="tool-tip-content" :data-cy="'teleported-'+this.opType">
          <template #title>
            [[# opType #]]
          </template>

          <template #content v-if="visible"> <!-- Defer rendering contents until modal is opened -->
            <chart-def v-if="hasLongParams" title="Box params" hover>
              <div style="display: flex">
                <div v-for="(param, i) in params" :key="i" class="complex-number">
                  <mathjax-content :formula="'\`' + param + '\`'"></mathjax-content>
                </div>
              </div>
            </chart-def>

            <chart-def v-if="matrix" title="Matrix" hover vertical>
              <chart-matrix :matrix="matrix" entry-type="complex" :display-title="false"></chart-matrix>
            </chart-def>

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
              <chart-def title="Paulis">
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
              <chart-def title="Phase Polynomial"></chart-def>
              <div>
                <chart-def v-for="(entry, i) in displayOp.box.phase_polynomial" :key="i" title="" hover>
                  <template #title>
                    <chart-matrix :matrix="entry[0]" :depth="1" :display-title="false" entry-type="boolStr"></chart-matrix>
                  </template>
                  <mathjax-content :formula="'\`' + entry[1] + '\`'"></mathjax-content>
                </chart-def>
              </div>
              <chart-def title="Linear Transformation" hover vertical>
                <chart-matrix :matrix="formatBoolMatrix(displayOp.box.linear_transformation)" :display-title="false" entry-type="bool"></chart-matrix>
              </chart-def>
            </div>

            <div v-if="['Custom', 'Composite', 'CompositeGate'].includes(displayOp.type)" class="mathjax-content hover-highlight">
              <chart-def title="Parameters"></chart-def>
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
              <chart-def title="Stabilisers"></chart-def>
              <chart-def v-for="(stab, i) in displayOp.box.stabilisers" :key="i" :title="stab.string[0]" hover>
                [[# stab.coeff #]]
              </chart-def>
            </div>

            <div v-if="displayOp.type === 'UnitaryTableauBox'">
              <chart-def title="Qubits" hover>
                <chart-list :chart="displayOp.box.tab.qubits.map((reg) => `${reg[0]}[${reg[1].join(',')}]`)" :display-title="false"></chart-list>
              </chart-def>
              <chart-def title="Tableau" vertical hover>
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
                [[# op.wasm.func_name #]]
              </chart-def>
              <chart-def title="Classical bits" hover>
                [[# op.wasm.n #]]
              </chart-def>
              <chart-def title="WASM bits" hover>
                [[# op.wasm.ww_n #]]
              </chart-def>
              <chart-def title="Input vector bits" hover>
                [[# op.wasm.width_i_parameter #]]
              </chart-def>
              <chart-def title="Output vector bits" hover>
                [[# op.wasm.width_o_parameter #]]
              </chart-def>
              <chart-def title="WASM uid" hover>
                <div :style="{wordWrap: 'break-word', textWrap: 'wrap', maxWidth: '300px'}">
                  [[# op.wasm.wasm_file_uid #]]
                </div>
              </chart-def>
            </div>

            <div v-if="displayOp.type === 'ToffoliBox'">
              <chart-def title="Strategy">
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
                <chart-def title="Permutation" vertical hover>
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
                <chart-def v-for="(entry, i) in formatMultiplexedOpMap(displayOp.box.op_map)" :key="i" title="" hover>
                  <template #title>
                    <chart-matrix :matrix="entry[0]" :depth="1" :display-title="false" entry-type="boolStr">
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

            <div v-if="displayOp.type === 'ConjugationBox'">
              <gate-info-sub-circuit v-for="key in ['Compute', 'Action', 'Uncompute']" :key="key"
                  @updated="onCircuitDisplayUpdate"
                  :op="displayOp"
                  :args="command.args"
                  :circuit-type="key"
              ></gate-info-sub-circuit>
            </div>

            <gate-info-sub-circuit @updated="onCircuitDisplayUpdate" :op="displayOp"></gate-info-sub-circuit>

            <gate-info-classical :op="displayOp"></gate-info-classical>
          </template>
        </info-modal>
      </teleport-from>
    </div>
  </div>
</template>

<style scoped>
.tool-tip-container{
    margin: calc(0px - var(--block-height) / 2) auto 0;
    padding-top: calc(var(--block-height) / 2);
    position: relative;
    bottom: 0;
    left: 0;
    right: 0;
    height: 0;
    width: 100%;
    z-index: 1;
    overflow: hidden;
}
.tool-tip-container:hover {
    cursor: pointer;
}
.tool-tip-content{
    cursor: auto;
}
.tool-tip-content > .gate_container.nested{
    width: 100%;
    min-width: unset;
    max-width: 400px;
    overflow: scroll;
}
</style>
