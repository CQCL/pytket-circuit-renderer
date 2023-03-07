<script>
import { teleportFrom } from '@/components/teleport/init'
import { chartList, chartMatrix } from '@/components/charts/init'
import mathjaxContent from '@/components/mathjaxContent/mathjaxContent'

import { CONTROLLED_OPS } from './consts'

import infoModal from './infoModal'
import gateInfoSubCircuit from './gateInfoSubCircuit'
import gateInfoClassical from './gateInfoClassical'
import { renderOptions, teleportConfig } from './provideKeys'

export default {
  name: 'gate-info',
  components: {
    chartList,
    chartMatrix,
    infoModal,
    teleportFrom,
    mathjaxContent,
    gateInfoSubCircuit,
    gateInfoClassical
  },
  props: {
    op: { type: Object, required: true }
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
        'PhasePolyBox', 'CircBox', 'Conditional',
        'Custom', 'CustomGate', 'Composite', 'CompositeGate',
        'ProjectorAssertionBox', 'StabiliserAssertionBox',
        'ExplicitPredicate', 'ExplicitModifier',
        'ClassicalTransform', 'SetBits', 'CopyBits',
        'MultiBit', 'RangePredicate',
        'UnitaryTableauBox', 'WASM', 'ToffoliBox',
        'MultiplexorBox', 'MultiplexedRotationBox', 'MultiplexedU2Box'
      ],
      visible: false,
      teleportToId: this.teleportId
    }
  },
  computed: {
    opType () {
      return this.op.type
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
    formatMapping (mapping, coerceFrom, coerceTo) {
      const coerce = {
        register: (reg) => reg, // `${reg[0]}[${reg[1][0]}]`,
        bool: (x) => x ? '1' : '0'
      }
      const formattedMapping = []
      for (const elFrom in mapping) {
        formattedMapping.push(
          coerceFrom
            ? coerce[coerceFrom](elFrom)
            : elFrom +
            ' → ' +
            coerceFrom
              ? coerce[coerceTo](mapping[elFrom])
              : mapping[elFrom]
        )
      }
      return formattedMapping
    },
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
    onCircuitDisplayUpdate () {
      // Make sure info modal resizes when the circuit is loaded
      this.$nextTick(() => {
        this.$refs.infoModal.onResize()
      })
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
            <div v-if="hasLongParams">
              <h4>Box params</h4>
              <div v-for="(param, i) in params" :key="i" class="complex-number">
                <mathjax-content :formula="'\`' + param + '\`'"></mathjax-content>
              </div>
            </div>

            <div v-if="matrix">
              <chart-matrix :matrix="matrix" entry-type="complex"></chart-matrix>
            </div>

            <table v-if="displayOp.type === 'PauliExpBox'">
              <tr><th>Phase</th><th>Paulis</th></tr>
              <tr>
                <td><mathjax-content :formula="'\`' + displayOp.box.phase + '\`'"></mathjax-content></td>
                <td><chart-list :chart="displayOp.box.paulis"></chart-list></td>
              </tr>
            </table>

            <div v-if="displayOp.type === 'PhasePolyBox'">
              <div class="row">Encapsulating [[# displayOp.box.n_qubits #]] gates</div>

              <h4>Qubit Mapping</h4>
              <chart-list :chart="formatMapping(displayOp.box.qubit_indices, 'register', false)"></chart-list>

              <h4>Phase Polynomial</h4>
              <chart-list :chart="formatMapping(displayOp.box.phase_polynomial, 'bool', false)"></chart-list>

              <h4>Linear Transformation</h4>
              <chart-matrix :matrix="formatBoolMatrix(displayOp.box.linear_transformation)" :display-title="false" entry-type="bool"></chart-matrix>
            </div>

            <table v-if="['Custom', 'Composite', 'CompositeGate'].includes(displayOp.type)" class="mathjax-content hover-highlight">
              <tr><th>Parameter</th><th>Value</th></tr>
              <tr v-for="(param, i) in displayOp.box.params" :key="i">
                <td><mathjax-content :formula="'\`' + displayOp.box.gate.args[i] + '\`'"></mathjax-content></td>
                <td><mathjax-content :formula="'\`' + param + '\`'"></mathjax-content></td>
              </tr>
            </table>

            <table v-if="isCondition">
              <tr>
                <th>Condition value</th>
                <td>[[# op.conditional.value #]]</td>
              </tr>
            </table>

            <div v-if="displayOp.type === 'StabiliserAssertionBox'">
              <h4>Stabilisers</h4>
              <table class="hover-highlight">
                <tr v-for="(stab, i) in displayOp.box.stabilisers" :key="i">
                  <td>[[# stab.string #]]</td>
                  <td>[[# stab.coeff #]]</td>
                </tr>
              </table>
            </div>

            <div v-if="displayOp.type === 'UnitaryTableauBox'">
              <h4>Tableau</h4>
              <table>
                <thead>
                  <tr>
                    <th>X</th>
                    <th>Z</th>
                    <th>Phase</th>
                  </tr>
                </thead>
                <tbody>
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
                </tbody>
              </table>
            </div>

            <div v-if="displayOp.type === 'WASM'">
              <h4>WASM</h4>
              <table class="hover-highlight">
                <tr>
                  <td>Function</td>
                  <td>[[# op.wasm.func_name #]]</td>
                </tr>
                <tr>
                  <td>N</td>
                  <td>[[# op.wasm.n #]]</td>
                </tr>
                <tr>
                  <td>Input vector</td>
                  <td>[[# op.wasm.ni_vec #]]</td>
                </tr>
                <tr>
                  <td>Output vector</td>
                  <td>[[# op.wasm.no_vec #]]</td>
                </tr>
                <tr>
                  <td>WASM uid</td>
                  <td>[[# op.wasm.wasm_uid #]]</td>
                </tr>
              </table>
            </div>

            <div v-if="displayOp.type === 'ToffoliBox'">
              <h4>Cycles</h4>
              <div v-for="(cycle, i) in displayOp.box.cycles" :key="i">
                <chart-matrix :matrix="cycle" :display-title="false" entry-type="bool">
                </chart-matrix>
              </div>
            </div>

            <div v-if="['MultiplexorBox', 'MultiplexedU2Box', 'MultiplexedRotationBox'].includes(displayOp.type)">
              <table>
                <thead>
                  <tr>
                    <th>Values</th>
                    <th>Op</th>
                    <th>Params</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(entry, i) in displayOp.box.op_map" :key="i">
                    <td>
                      [[# entry[0] #]]
                    </td>
                    <td>
                      [[# entry[1].type #]]
                    </td>
                    <td>
                      <chart-list :chart="entry[1].params"></chart-list>
                    </td>
                  </tr>
                </tbody>
              </table>
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
    margin: calc(0px - var(--block-height)) auto 0;
    padding-top: var(--block-height);
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
