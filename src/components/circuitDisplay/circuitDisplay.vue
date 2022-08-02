<script>
import { teleportContainer, teleportTo } from '@/components/teleport/init';

import circuitLayer from './circuitLayer';
import renderCircuitLayers from './renderCircuitLayers';
import circuitCommand from './command';
import gateInfo from './gateInfo'


let nCircuits = 0;  // circuits needs unique ids.


export default {
  name: "circuit-display",
  components: {
    teleportContainer,
    teleportTo,
    circuitLayer,
    renderCircuitLayers,
    circuitCommand,
    gateInfo,
  },
  props: {
    circuit: {type: Object},
    renderOptions: {type: Object, required: true},
  },
  data () {
    nCircuits++;
    const id = 'gate-info-modal-' + nCircuits;
    return {
      infoModal: {
        teleport: {
          names: {},
          id: id,
        },
        visible: false,
        closeCallback: null,
      },
      nRenderedCommands: 0,
      idCommandRef: undefined,
      condensedRegisters: {
        names: {},
        toggles: {},
        order: {},
      },
    }
  },
  computed: {
    circuitDetails () {
      if (this.circuit) {
        return {
          condensedBits: {
            global: this.circuit.bits.length > 0 ? [["C", [".." + this.circuit.bits.length]]] : [],
            names: this.condensedRegisters.names,
          },
          bits: this.circuit.bits,
          qubits: this.circuit.qubits,
          registerOrder: this.circuit.qubits.concat(this.circuit.bits),

        }
      }
      return {
        condensedBits: {global: [], names: {}},
        bits: [],
        qubits: [],
        registerOrder: [],
      };
    },
    activeArgs () {
      if (this.circuit) {
        // Wires that we are currently displaying
        // Filter classical bits:
        const classicalBits = this.circuitDetails.bits.reduce(({filtered, included}, bit) => {
          if (this.condensedRegisters.toggles[bit[0]]) {
            if (!(bit[0] in included)) {  // Add the condensed register if this is the first bit to be condensed.
              filtered.push([bit[0], ['..' + this.circuitDetails.condensedBits.names[bit[0]]]]);
              included[bit[0]] = true;
            }
          } else {  // not condensing this register
            filtered.push(bit);
          }
          return {filtered, included};
        }, {filtered: [], included: {}}).filtered;

        return [...this.circuitDetails.qubits, ...(
            this.renderOptions.condenseCBits && this.circuitDetails.condensedBits
                ? this.circuitDetails.condensedBits.global
                : classicalBits
        )];
      }
      return [];
    },
    commandRefs () {
      // Force update each time a new command gets rendered.
      return this.nRenderedCommands > 0 ? this.$refs.commands : [];
    },
  },
  watch: {
    circuit (newCircuit) {
      if (newCircuit) {
        this.initCondensedRegisters();
      }
    },
    "renderOptions.recursive" (recursive) {
      if (recursive) {
        // Make sure no registers are collapsed
        for (let name of Object.keys(this.condensedRegisters.toggles)) {
          this.condensedRegisters.toggles[name] = false;
        }
      }
    }
  },
  mounted () {
    // Initialise the teleport components
    this.infoModal.teleport.names[this.infoModal.teleport.id] = this.$refs.infoModals;
  },
  methods: {
    initCondensedRegisters () {
      // Add a condensedRegister for each classical register name present in the circuit.
      let condensedRegisterNames = {};
      let condensedRegisterToggles = {};
      let condensedRegisterOrder = {};

      this.circuit.bits.forEach((bit, order) => {
        if (bit[0] in condensedRegisterNames) {
          condensedRegisterNames[bit[0]]++;
          condensedRegisterOrder[bit[0]].last = this.circuit.qubits.length + order;
        } else {
          condensedRegisterNames[bit[0]] = 1;
          condensedRegisterToggles[bit[0]] = false;
          condensedRegisterOrder[bit[0]] = {
            first: this.circuit.qubits.length + order,
            last: this.circuit.qubits.length + order,
          };
        }
      });
      this.condensedRegisters.names = condensedRegisterNames;
      this.condensedRegisters.toggles = condensedRegisterToggles;
      this.condensedRegisters.order = condensedRegisterOrder;
    },
    updateCondensedRegisterToggles (name) {
      this.condensedRegisters.toggles[name] = !this.condensedRegisters.toggles[name];
    },
    registerTeleport (...args) {
      this.$refs.teleportParent.registerTeleport(...args);
    },
    getRenderedCircuitEl () {
      return {
        circuit: this.$refs.renderedCircuit,
        width: this.$refs.renderedCircuitDimensions.clientWidth,
        height: this.$refs.renderedCircuitDimensions.clientHeight,
      }
    }
  }
}
</script>

<template>
  <teleport-container :names="infoModal.teleport.names" ref="teleportParent"
    :class="{condensed: renderOptions.condensed, 'circuit-preview circuit_variables': !renderOptions.nested}"
  >
    <div v-if="circuit" tabindex="0" :class="{'nested-circuit-container': renderOptions.condensed}">
      <!--  Pre-processing for the commands we want to display  -->
      <div style="display:none">
        <circuit-command
            :ref="'command-id'"
            :command="{op: {type: 'ID'}, args: circuitDetails.registerOrder}"
            :register-order="circuitDetails.registerOrder"
            :classicalThreshold="circuitDetails.qubits.length"
            :render-options="renderOptions"
            :condensed-registers="condensedRegisters"
            @mounted="idCommandRef = $refs['command-id']"
        ></circuit-command>
        <circuit-command v-for="(command, j) in circuit.commands" :key="j"
            :ref="'commands'"
            :command="command"
            :register-order="circuitDetails.registerOrder"
            :classicalThreshold="circuitDetails.qubits.length"
            :render-options="renderOptions"
            :condensed-registers="condensedRegisters"
            @mounted="nRenderedCommands++"
        >
          <template #gate-info>
            <gate-info
                :op="command.op"
                :teleport-id="infoModal.teleport.id"
                :teleport-parent="$refs.teleportParent"
                :render-options="renderOptions"
                @register-teleport="registerTeleport">
            </gate-info>
          </template>
        </circuit-command>
      </div>

      <div :class="{'circuit-inner-scroll': renderOptions.condensed}">
        <div ref="renderedCircuit">
          <div  ref="renderedCircuitDimensions" class="circuit-container"
             :class="{nested: renderOptions.nested || renderOptions.condensed, zx: renderOptions.zxStyle}">
          <circuit-layer
              :nested="renderOptions.nested"
              :qubits="true"
              :style="{'text-align': 'right'}"
              :argList="activeArgs"
              :condensed-registers="renderOptions.recursive ? {} : condensedRegisters.toggles"
              @toggle="updateCondensedRegisterToggles">
          </circuit-layer>

          <!--  Circuit commands will actually render in here:  -->
          <div v-if="commandRefs.length === 0">Loading...</div>
          <render-circuit-layers v-else
              :register-order="circuitDetails.registerOrder"
              :command-refs="commandRefs"
              :id-command-ref="idCommandRef"
              :render-options="renderOptions"
              :condensed-registers="condensedRegisters.toggles">
          </render-circuit-layers>

          <circuit-layer
              :nested="renderOptions.nested"
              :qubits="true"
              :style="{'text-align': 'left'}"
              :argList="activeArgs"
              :condensed-registers="renderOptions.recursive ? {} : condensedRegisters.toggles"
              @toggle="updateCondensedRegisterToggles">
          </circuit-layer>
        </div>
        </div>
      </div>
    </div>

    <!-- Gates in circuit will send extra info modals here. -->
    <teleport-to :name="infoModal.teleport.id" ref="infoModals" style="z-index:10"></teleport-to>
  </teleport-container>
</template>

<style>
/* FOR DISPLAYING CIRCUITS */
/* Main preview container */
.circuit-preview {
    width: 100%;
    height: 100%;
    text-align: center;
    color: black;
    font-size: 1rem;
}
.circuit_variables {
    /* Define some variables */
    --block-height: 3em;
    --box-height: 1.3em;
    --box-margin: calc((var(--block-height) - var(--box-height)) / 2);
    --box-border: 1px;

    --base-wire-height: 2px;
    --wire-col: #000;
    --c-wire-col: #ccc;

    --box-col: #ccc;
    --box-col-overlay: rgba(0,0,0,0.05);
    --c-box-col: #ddd;
    --index-col: #888;
}
.condensed{
    display: flex;
    flex-wrap: nowrap;
}

/* Circuits */
.circuit-container{
    max-width: 100%;
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-content: flex-start;
    margin: auto;
    width: -moz-fit-content;
    width: fit-content;
}
.circuit-preview.condensed > .circuit-container{
    flex-wrap: nowrap;
    min-width: fit-content;
}
.tool-tip-content > .gate_container.nested > .nested-circuit-container,
.circuit-preview.condensed > .nested-circuit-container{
    background: transparent;
    box-shadow: none;
    width: 100%;
    min-width: unset;
    max-width: unset;
}
.circuit-container.nested{
    position: relative;
    flex-wrap: nowrap;
}
.nested-circuit-container{
    display: flex;
    overflow: auto;
    background: var(--box-col-overlay);
    box-shadow: 0 0 0 var(--box-border) var(--box-col) inset;
}
.nested-circuit-container:focus,
.nested-circuit-container:focus-visible {
    box-shadow: inset 0 0 0 6px var(--accent-col-outline, #ccffcc);
}

.circuit-inner-scroll{
    overflow: visible;
    width: -moz-fit-content;
    width: fit-content;
    margin: auto;
}

.circuit-container:not(.nested) > .circuit-layer:nth-child(2),
.circuit-container:not(.nested) > .circuit-layer:nth-last-child(2),
.circuit-container.nested > .circuit-layer:nth-child(2),
.circuit-container.nested > .circuit-layer:nth-last-child(2),
.gate_container.nested > .circuit-layer:first-child,
.gate_container.nested > .circuit-layer:nth-last-child(2),
.gate_container.nested > .circuit-layer:last-child{
    min-width: 10px;
}
</style>

<style lang="scss">
.circuit-preview * {
    box-sizing: border-box !important;
}

.circuit-container {
  /* Box colours */
  .h {
    --box-col: #ffee00;
    --box-col-overlay: rgba(255, 255, 0, 0.2);
    --c-box-col: #ffee88;
    --index-col: #ffcc00;
  }

  .x {
    --box-col: #ff8888;
    --box-col-overlay: rgba(255, 0, 0, 0.2);
    --c-box-col: #e8a6a6;
    --index-col: red;
  }

  .y {
    --box-col: #6699ff;
    --box-col-overlay: rgba(0, 0, 255, 0.2);
    --c-box-col: #86c6f6;
    --index-col: blue;
  }

  .z {
    --box-col: #ccffcc;
    --box-col-overlay: rgba(0, 255, 0, 0.2);
    --c-box-col: #e2ffe2;
    --index-col: green;
  }

  .nested .circuit-layer{
      margin-bottom: 0px;
  }

  /* Display qubit names at start of circuit */
  .qubit {
    height: var(--block-height);
    padding: calc((var(--block-height) - 1em) / 2) 0.5em;
    text-align: center;
    font-family: monospace;
  }

  /* WIRES */
  .wire {
    height: var(--wire-height);
    top: calc((var(--block-height) - var(--wire-height)) / 2);
  }

  .wire,
  .link {
    --wire-height: var(--base-wire-height);
    background: var(--wire-col);
    position: relative;
  }

  .wire.classical,
  .link.classical {
    --wire-height: calc(var(--base-wire-height) / 2);
    background: var(--c-wire-col) !important;
  }

  .wire.classical.condensed {
    --wire-height: calc(var(--base-wire-height) * 2);
  }

  .wire.wire_in {
    width: var(--box-margin);
    margin: calc((var(--block-height) - var(--wire-height)) / 2) 0;
    top: 0;
  }

  .wire.flex_wire {
    flex-grow: 1;
  }

  .wire.transparent-wire {
    background: transparent;
  }

  /* Generic base for our gates */
  .gate_container {
    display: flow-root;
    position: relative;
    min-width: fit-content;
    height: var(--block-height);
  }

  .gate_container.nested {
    display: flex;
    flex-wrap: nowrap;
    height: fit-content;
  }

  .gate_container.generic {
    flex-grow: 1;
  }

  .gate_container.nested:after {
    display: flex;
    flex-wrap: nowrap;
  }

  .gate_container .classical {
    background: var(--c-box-col);
    border-color: var(--index-col);
  }

  .gate {
    --border: var(--box-border) solid var(--wire-col);
    position: relative;
    margin: var(--box-margin);
    border: var(--border);
    padding: 0.4em;
    text-align: left;
    background: var(--box-col);
    display: flex;
    z-index: 1;
  }

  .gate.connected {
    margin-left: 0;
    margin-right: 0;
  }

  .wire-label {
    color: var(--index-col);
    width: -moz-fit-content;
    width: fit-content;
    padding-right: 0.4em;
  }

  .gate_top > .wire-label,
  .gate_bottom > .wire-label {
    padding-top: 0;
  }

  /* Multi-qubit gates */
  .gate_bottom {
    height: calc(var(--box-height) + var(--box-margin));
    margin-top: 0;
    padding-top: var(--box-margin);
    padding-bottom: 0;
    border-top: none;
  }

  .gate_mid {
    height: var(--block-height);
    margin-top: 0;
    margin-bottom: 0;
    padding-top: var(--box-margin);
    padding-bottom: var(--box-margin);
    border-top: none;
    border-bottom: none;
  }

  .gate_top {
    height: calc(var(--box-height) + var(--box-margin) + 1px);
    margin-bottom: 0;
    padding-top: 0;
    padding-bottom: var(--box-margin);
    border-bottom: none;
  }

  .gate_name {
    text-align: center;
    flex-grow: 1;
  }

  /* Single qubit gate*/
  .gate_box {
    height: calc(var(--box-height) + var(--box-border));
    margin-left: 0;
    margin-right: 0;
    padding-top: 0;
    padding-bottom: 0;
    text-align: center;
  }

  /* Special gates */
  .gate_connection {
    border: none;
    margin: 0;
    padding: 0;
    width: 0;
  }

  .gate_swap,
  .gate_measure {
    position: absolute;
    left: calc(50% - var(--box-height) / 2);
    height: var(--box-height);
    width: var(--box-height);
    margin: var(--box-margin) 0;
    background: transparent;
  }

  .gate_swap > svg,
  .gate_measure > svg {
    width: 100%;
    height: 100%;
    padding: 0;
  }

  .gate_control {
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 50%;
    width: 0.5em;
    height: 0.5em;
    margin: calc(var(--block-height) / 2 - 0.25em) calc(50% - 0.25em);
    padding: 0;
    border: var(--box-border) solid var(--wire-col);
    background: var(--wire-col);
  }

  .gate_control.classical {
    background: var(--c-wire-col);
    border-color: var(--c-wire-col);
  }

  .control_index {
    position: absolute;
    right: calc(50% - 1em);
    top: calc(50% - 1.4em);
    color: var(--c-wire-col);
    font-size: 0.8em;
  }

  .control_index.measure {
    right: calc(50% - 1.2em);
    color: var(--index-col);
  }

  .gate_reset {
    margin-left: 0;
    margin-right: 0;
    padding: 0 0 0 10px;
    border: none !important;
    border-left: var(--base-wire-height) solid var(--wire-col) !important;
    background: transparent;
  }

  .gate_reset_spider {
    width: calc(var(--box-height) - 24px);
    height: calc(var(--box-height) - 24px);
    background: var(--box-col);
    border-radius: 50%;
    font-size: 0.75em;
  }

  .gate_barrier.link {
    border: var(--wire-height) dashed var(--c-wire-col);
    border-width: 0 var(--wire-height) 0 0;
    background: transparent !important;
    top: 0;
    width: 0;
    padding:0;
    margin: 0 auto;
  }

  .gate-barrier.gate_mid {
    height: 100%;
  }

  .gate_barrier.gate_bottom {
    margin-bottom: var(--box-margin);
  }

  .gate_barrier.gate_top {
    margin-top: var(--box-margin);
  }

  .gate_barrier.gate_box {
    margin-bottom: var(--box-margin);
    margin-top: var(--box-margin);
  }

  /* Special ZX style gates */
  .zx-spider {
    border: var(--base-wire-height) solid var(--wire-col);
    border-radius: calc(var(--box-height) / 2);
    height: var(--box-height);
    min-width: var(--box-height);
    width: fit-content;
  }

  .zx-cz > .zx-hadamard {
    top: calc(0px - var(--box-height));
    left: 0.2em; /* depends on the box internal padding */
    margin: 0;
  }

  .zx-hadamard {
    position: absolute;
    top: calc(var(--box-height) / 4);
    left: calc(0px - var(--box-height) / 4);
    width: calc(var(--box-height) / 2);
    height: calc(var(--box-height) / 2);
    padding: 0;
    border: var(--base-wire-height) solid var(--wire-col);
    background: var(--box-col);
  }

  /* Vertical wire links */
  .link-bottom, .link-top {
    height: var(--block-height);
    width: var(--wire-height);
    background: var(--wire-col);
    position: absolute;
    left: calc(50% - var(--wire-height) / 2);
  }

  .link-top {
    top: calc(0px - var(--block-height) / 2);
  }

  .link-bottom {
    top: calc(var(--block-height) / 2)
  }

  .link-bottom.classical {
    z-index: 1;
  }

  .nested > .tool-tip-container {
    position: absolute;
    bottom: -10px;
  }

  .tool-tip .complex-number{
    padding: 4px;
  }
}
</style>