<script>
import { teleportContainer, teleportTo } from "@/components/teleport/init";

import { registerEquality } from "./utils";
import { CONTROLLED_OPS } from "./consts";

import circuitLayer from "./circuitLayer";
import controlledGate from "./controlledGate";
import genericGate from "./genericGate";
import gateInfo from "./gateInfo";

let nCircuits = 0; // circuits needs unique ids.

export default {
  name: "circuit-display",
  components: {
    teleportContainer,
    teleportTo,
    circuitLayer,
    controlledGate,
    genericGate,
    gateInfo,
  },
  props: {
    circuit: { type: Object },
    renderOptions: { type: Object, required: true },
  },
  data() {
    nCircuits++;
    const id = "gate-info-modal-" + nCircuits;
    return {
      infoModal: {
        teleport: {
          names: {},
          id: id,
        },
        visible: false,
        closeCallback: null,
      },
    };
  },
  computed: {
    circuitDetails() {
      if (this.circuit) {
        return {
          condensedBits:
            this.circuit.bits.length > 0
              ? ["C", [".." + this.circuit.bits.length]]
              : false,
          bits: this.circuit.bits,
          qubits: this.circuit.qubits,
        };
      }
      return {
        condensedBits: [],
        bits: [],
        qubits: [],
      };
    },
    activeArgs() {
      // Wires that we are currently displaying
      return [
        ...this.circuitDetails.qubits,
        ...(this.renderOptions.condenseCBits &&
        this.circuitDetails.condensedBits
          ? [this.circuitDetails.condensedBits]
          : this.circuitDetails.bits),
      ];
    },
    layers() {
      if (this.circuit) {
        // Iterate over commands and add id blocks as necessary
        // Here we only delimit which (qu)bit segments are involved in each command,
        // then render in a dedicated component.
        const registerOrder = this.circuitDetails.qubits.concat(
          this.circuitDetails.bits
        );
        const classicalThreshold = this.circuitDetails.qubits.length;
        let currentPos = 0;
        let layer = [];
        let layers = [];

        // Pad with a layer of ID at start
        layers.push([
          {
            command: { args: registerOrder, op: { type: "ID" } },
            args: registerOrder,
          },
        ]);

        this.circuit.commands.forEach((command) => {
          // Get the start and end indices for this command.
          let sortedArgs = command.args
            .map((arg, pos) => {
              return {
                name: arg,
                pos: pos, // index of arg in the command
                order: registerOrder.findIndex((reg) =>
                  registerEquality(reg, arg)
                ), // index of arg in the display order
              };
            })
            .sort((a, b) => {
              if (a.order > b.order) {
                return 1;
              }
              if (a.order < b.order) {
                return -1;
              }
              return 0;
            });
          let firstArg = sortedArgs[0].order;
          let lastArg = sortedArgs[sortedArgs.length - 1].order;

          // If we can't fit this command onto the current layer:
          if (firstArg < currentPos) {
            // Fill the previous layer with ID so we can start a new one.
            let args = registerOrder.slice(currentPos);
            layer.push({
              command: { args: args, op: { type: "ID" } },
              args: args,
            });
            layers.push(layer);
            currentPos = 0;
            layer = [];
          }
          // now fill with id up to start of current command.
          if (currentPos < firstArg) {
            let args = registerOrder.slice(
              currentPos,
              this.renderOptions.condenseCBits
                ? Math.min(firstArg, classicalThreshold)
                : firstArg
            );
            layer.push({
              command: { args: args, op: { type: "ID" } },
              args: args,
            });
          }

          // Add in this command
          layer.push({
            command: command,
            args: registerOrder.slice(firstArg, lastArg + 1),
          });

          // Adjust current pos to next wire to be filled. Wrap around if necessary:
          currentPos = lastArg + (1 % registerOrder.length);
          // If condensing classical args, and this op was classical, must circle around:
          if (
            this.renderOptions.condenseCBits &&
            currentPos > classicalThreshold
          ) {
            currentPos = 0;
          }
          // If we wrapped around, push the layer we just completed
          if (currentPos === 0) {
            layers.push(layer);
            layer = [];
          }
        });

        // Complete the last layer.
        if (currentPos > 0) {
          let args = registerOrder.slice(currentPos, registerOrder.length);
          layer.push({
            command: { args: args, op: { type: "ID" } },
            args: args,
          });
          layers.push(layer);
        }

        // Pad with a layer of ID at end
        layers.push([
          {
            command: { args: registerOrder, op: { type: "ID" } },
            args: registerOrder,
          },
        ]);

        return layers;
      }
      return [];
    },
  },
  mounted() {
    // Initialise the teleport components
    this.infoModal.teleport.names[this.infoModal.teleport.id] =
      this.$refs.infoModals;
  },
  methods: {
    renderControlGate(opType) {
      return (
        CONTROLLED_OPS.includes(opType) &&
        !["CNOT", "CX", "CZ"].includes(opType)
      );
    },
  },
};
</script>

<template>
  <teleport-container
    :names="infoModal.teleport.names"
    ref="teleportParent"
    :class="{
      condensed: renderOptions.condensed,
      'circuit-preview circuit_variables': !renderOptions.nested,
    }"
  >
    <div
      v-if="circuit"
      tabindex="0"
      :class="{ 'nested-circuit-container': renderOptions.condensed }"
    >
      <div :class="{ 'circuit-inner-scroll': renderOptions.condensed }">
        <div
          class="circuit-container"
          :class="{
            nested: renderOptions.nested || renderOptions.condensed,
            zx: renderOptions.zxStyle,
          }"
        >
          <circuit-layer
            :nested="renderOptions.nested"
            :qubits="true"
            :argList="activeArgs"
          ></circuit-layer>

          <circuit-layer
            v-for="(layer, i) in layers"
            :key="i"
            :nested="renderOptions.nested"
          >
            <div
              v-for="(command, j) in layer"
              :key="j"
              :data-command="command.command.op.type"
            >
              <controlled-gate
                v-if="renderControlGate(command.command.op.type)"
                :command="command.command"
                :args="command.args"
                :circuitDetails="circuitDetails"
                :render-options="renderOptions"
              >
              </controlled-gate>
              <generic-gate
                v-else
                :command="command.command"
                :args="command.args"
                :circuitDetails="circuitDetails"
                :render-options="renderOptions"
              >
              </generic-gate>
              <gate-info
                :op="command.command.op"
                :teleport-id="infoModal.teleport.id"
                :teleport-parent="$refs.teleportParent"
                :render-options="renderOptions"
              >
              </gate-info>
            </div>
          </circuit-layer>

          <circuit-layer
            :nested="renderOptions.nested"
            :qubits="true"
            :argList="activeArgs"
          ></circuit-layer>
        </div>
      </div>
    </div>

    <!-- Gates in circuit will send extra info modals here. -->
    <teleport-to
      :name="infoModal.teleport.id"
      ref="infoModals"
      style="z-index: 10"
    ></teleport-to>
  </teleport-container>
</template>

<style scoped>
/* FOR DISPLAYING CIRCUITS */
/* Main preview container */
.circuit-preview {
  width: 100%;
  height: 100%;
  text-align: center;
  color: black;
  font-size: 1rem;
}
.circuit-preview * {
  box-sizing: border-box !important;
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
  --box-col-overlay: rgba(0, 0, 0, 0.05);
  --c-box-col: #ddd;
  --index-col: #888;
}
.condensed {
  display: flex;
  flex-wrap: nowrap;
}

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

/* Circuits */
.circuit-container {
  max-width: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-content: flex-start;
  margin: auto;
  width: -moz-fit-content;
  width: fit-content;
}
.circuit-preview.condensed > .circuit-container {
  flex-wrap: nowrap;
  min-width: fit-content;
}
.circuit-container.nested {
  position: relative;
  flex-wrap: nowrap;
}
.nested-circuit-container {
  display: flex;
  overflow: auto;
  background: var(--box-col-overlay);
  box-shadow: 0 0 0 var(--box-border) var(--box-col) inset;
}
.nested-circuit-container:focus,
.nested-circuit-container:focus-visible {
  box-shadow: inset 0 0 0 6px var(--accent-col-outline, #ccffcc);
}

.circuit-inner-scroll {
  overflow: visible;
  width: -moz-fit-content;
  width: fit-content;
  margin: auto;
}

.circuit-layer {
  min-width: var(--block-height);
  width: max-content;
  display: flex;
  flex-flow: column nowrap;
  flex-grow: 1;
  justify-content: space-between;
  align-items: stretch;
  margin-bottom: 20px;
}
.circuit-container:not(.nested) > .circuit-layer:nth-child(2),
.circuit-container:not(.nested) > .circuit-layer:nth-last-child(2),
.circuit-container.nested > .circuit-layer:nth-child(2),
.circuit-container.nested > .circuit-layer:nth-last-child(2),
.gate_container.nested > .circuit-layer:first-child,
.gate_container.nested > .circuit-layer:nth-last-child(2),
.gate_container.nested > .circuit-layer:last-child {
  min-width: 10px;
}
.nested .circuit-layer {
  margin-bottom: 0px;
}

/* Display qubit names at start of circuit */
.circuit-layer.qubits {
  flex-grow: 0;
}
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
.link-top,
.link-bottom {
  --wire-height: var(--base-wire-height);
  background: var(--wire-col);
  position: relative;
}
.wire.classical,
.link-top.classical,
.link-bottom.classical {
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
  height: var(--block-height);
  margin: 0 var(--box-margin);
  padding: var(--box-margin) 0.4em;
  border-left: var(--border);
  border-right: var(--border);
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
.nested-label-layer {
  background: var(--box-col);
  padding: 0 0.4em;
}
.nested-label-layer .wire-label {
  padding: var(--box-margin) 0;
  height: var(--block-height);
}

/* Multi-qubit gates */
.gate_bottom {
  height: calc(var(--box-height) + var(--box-margin));
  margin-bottom: var(--box-margin);
  padding-bottom: 0;
  border-bottom: var(--border);
}
.gate_top {
  height: calc(var(--box-height) + var(--box-margin));
  margin-top: var(--box-margin);
  padding-top: 0;
  border-top: var(--border);
}
.gate_name {
  text-align: center;
  flex-grow: 1;
}
/* Single qubit gate*/
.gate_box {
  height: calc(var(--box-height) + var(--box-border));
  margin: var(--box-margin) 0;
  padding: 0 0.4em;
  border: var(--border);
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
.link-bottom,
.link-top {
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
  top: calc(var(--block-height) / 2);
}
.edge-link {
  height: calc(var(--block-height) - var(--box-margin));
}
.link-top.edge-link {
  margin-bottom: var(--box-margin);
}
.link-bottom.edge-link {
  margin-top: var(--box-margin);
}
.link-bottom.classical {
  z-index: 1;
}
.link-top.barrier,
.link-bottom.barrier {
  border-left: var(--wire-height) dashed var(--c-wire-col);
  border-right: none;
  border-top: none;
  border-bottom: none;
  background: transparent;
  width: 0;
  top: 0;
}

/* tool tips */
.tool-tip-container {
  margin: calc(0px - var(--block-height)) auto 0;
  padding-top: var(--block-height);
  position: relative;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0;
  width: 100%;
  z-index: 4;
  overflow: hidden;
}
.nested > .tool-tip-container {
  position: absolute;
  bottom: -10px;
}
.tool-tip-container:hover {
  cursor: pointer;
}
.tool-tip-content {
  cursor: auto;
}
.tool-tip .complex-number {
  padding: 4px;
}
.tool-tip-content > .gate_container.nested {
  width: 100%;
  min-width: unset;
  max-width: 400px;
  overflow: scroll;
}
.nested-label-layer.as-height {
  padding: 0;
}
.tool-tip-content > .gate_container.nested > .nested-circuit-container,
.circuit-preview.condensed > .nested-circuit-container {
  background: transparent;
  box-shadow: none;
  width: 100%;
  min-width: unset;
  max-width: unset;
}
</style>
