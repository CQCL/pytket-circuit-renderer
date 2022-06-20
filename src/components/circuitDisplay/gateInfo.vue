<script>
import { teleportFrom } from "@/components/teleport/init";
import { chartList, chartMatrix } from "@/components/charts/init";
import mathjaxContent from "@/components/mathjaxContent/mathjaxContent";

import { CONTROLLED_OPS } from "./consts";

import infoModal from "./infoModal";
import gateInfoSubCircuit from './gateInfoSubCircuit';
import gateInfoClassical from './gateInfoClassical';


export default  {
  name: "gate-info",
  components: {
    chartList,
    chartMatrix,
    infoModal,
    teleportFrom,
    mathjaxContent,
    gateInfoSubCircuit,
    gateInfoClassical,
  },
  props: {
    op: {type: Object, required: true},
    teleportId: {type: String, required: true},
    teleportParent: {required: true}, // ref to the parent. Undefined until parent is mounted.
    renderOptions: {type: Object, required: true},
  },
  data () {
    return {
      controlledOps: CONTROLLED_OPS,
      contentOps: [
        "Unitary1qBox", "Unitary2qBox", "Unitary3qBox",
        "ExpBox", "PauliExpBox", "ClassicalExpBox",
        "PhasePolyBox", "CircBox",
        "Custom", "CustomGate", "Composite", "CompositeGate",
        "ProjectorAssertionBox", "StabiliserAssertionBox",
        "ExplicitPredicate", "ExplicitModifier",
        "ClassicalTransform", "SetBits", "CopyBits",
        "MultiBit", "RangePredicate",
      ],
      visible: false,
    };
  },
  computed: {
    opType () {
      return this.op.type;
    },
    matrix () {
      if ("matrix" in this.displayOp) {
        return this.displayOp.matrix;
      }
      if ("box" in this.displayOp && "matrix" in this.displayOp.box) {
        return this.displayOp.box.matrix;
      }
      return false;
    },
    displayOp () {
       return this.hasNestedContent ? this.op.box.op : this.op;
    },
    hasNestedContent () {
      return (["Condition", "Control", "QControlBox"].includes(this.opType)
          && "box" in this.op && "op" in this.op.box
          && this.contentOps.includes(this.op.box.op.type))
        || (this.opType === "Condition" && this.contentOps.includes(this.op.conditional.op.type));
    },
    hasContent () {
      return (this.contentOps.includes(this.opType)
          && (!this.renderOptions.recursive || !["CircBox"].includes(this.opType)))
          || this.hasLongParams;
    },
    hasLongParams () {
      return (this.params.length > 3) || (this.params.reduce((acc, param) => {
        return acc || param.length > 5;
      }, false));
    },
    params () {
      let params = "params" in this.op && this.op.params ? this.op.params : [];
      return params.concat(
          "box" in this.op && this.op.box.params ? this.op.box.params : [],
          this.opType === "Condition" && this.op.conditional.op.params ? this.op.conditional.op.params : [],
      );
    }
  },
  methods: {
    formatMapping (mapping, coerceFrom, coerceTo) {
      const coerce = {
        register: (reg) => reg, // `${reg[0]}[${reg[1][0]}]`,
        bool: (x) => x ? "1" : "0",
      }
      let formattedMapping = [];
      for (let elFrom in mapping) {
        formattedMapping.push(
            coerceFrom ? coerce[coerceFrom](elFrom) : elFrom
            + " → " +
            coerceFrom ? coerce[coerceTo](mapping[elFrom]) : mapping[elFrom]
        );
      }
      return formattedMapping;
    },
    formatBoolMatrix (matrix) {
      const nQubits = Math.round(Math.log(matrix.length));
      let basis = [];
      for (const x of Array(2 ** nQubits).keys()) {
        basis.push(
          (new Array(1 + nQubits).join("0") + x.toString(2))
            .slice(-nQubits)
        );
      }
      let formattedMatrix = [];
      for (let row of matrix) {
        formattedMatrix.push((basis, row.map((x) => x ? "1" : "0")));
      }
      return formattedMatrix;
    },
  }
}
</script>

<template>
  <div v-if="hasContent || hasNestedContent">
    <div @click="visible = true" class="tool-tip-container"></div>

    <!-- content to be rendered in the info modal -->
    <div style="display: none">
      <teleport-from :to="visible ? teleportId : ''" :parent="teleportParent">
        <info-modal v-model="visible" class="tool-tip-content">
          <template #title>
            [[# opType #]]
          </template>
          <template #content>
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

            <table v-if="displayOp.type === 'Condition'">
              <tr>
                <th>Condition value</th>
                <td>[[# displayOp.conditional.value #]]</td>
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

            <gate-info-sub-circuit :op="displayOp" :render-options="renderOptions"></gate-info-sub-circuit>

            <gate-info-classical :op="displayOp"></gate-info-classical>
          </template>
        </info-modal>
      </teleport-from>
    </div>
  </div>
</template>

<style scoped>
</style>
