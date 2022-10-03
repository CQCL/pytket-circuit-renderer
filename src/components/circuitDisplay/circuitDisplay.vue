<script>
import { teleportContainer, teleportTo } from '@/components/teleport/init'

import circuitLayer from './circuitLayer'
import splitCircuitLayers from './splitCircuitLayers'
import circuitCommand from './command'
import gateInfo from './gateInfo'
import { renderOptions } from './provideKeys'

let nCircuits = 0 // circuits needs unique ids.

export default {
  name: 'circuit-display',
  components: {
    teleportContainer,
    teleportTo,
    circuitLayer,
    splitCircuitLayers,
    circuitCommand,
    gateInfo
  },
  props: {
    circuit: { type: Object },
    navigatorStyling: { type: Object }
  },
  emits: ['updated'],
  inject: {
    condenseCBits: { from: renderOptions.condenseCBits },
    zxStyle: { from: renderOptions.zxStyle },
    recursive: { from: renderOptions.recursive },
    condensed: { from: renderOptions.condensed },
    nested: { from: renderOptions.nested }
  },
  data () {
    nCircuits++
    const id = 'gate-info-modal-' + nCircuits
    return {
      infoModal: {
        teleport: {
          names: {},
          id
        },
        visible: false,
        closeCallback: null
      },
      nRenderedCommands: 0,
      idCommandRef: undefined,
      condensedRegisters: {
        names: {},
        toggles: {},
        order: {}
      }
    }
  },
  computed: {
    circuitDetails () {
      if (this.circuit) {
        return {
          condensedBits: {
            global: this.circuit.bits.length > 0 ? [['C', ['..' + this.circuit.bits.length]]] : [],
            names: this.condensedRegisters.names
          },
          bits: this.circuit.bits,
          qubits: this.circuit.qubits,
          registerOrder: this.circuit.qubits.concat(this.circuit.bits)
        }
      }
      return {
        condensedBits: { global: [], names: {} },
        bits: [],
        qubits: [],
        registerOrder: []
      }
    },
    activeArgs () {
      if (this.circuit) {
        // Wires that we are currently displaying
        // Filter classical bits:
        const classicalBits = this.circuitDetails.bits.reduce(({ filtered, included }, bit) => {
          if (this.condensedRegisters.toggles[bit[0]]) {
            if (!(bit[0] in included)) { // Add the condensed register if this is the first bit to be condensed.
              filtered.push([bit[0], ['..' + this.circuitDetails.condensedBits.names[bit[0]]]])
              included[bit[0]] = true
            }
          } else { // not condensing this register
            filtered.push(bit)
          }
          return { filtered, included }
        }, { filtered: [], included: {} }).filtered

        return [...this.circuitDetails.qubits, ...(
          this.condenseCBits && this.circuitDetails.condensedBits
            ? this.circuitDetails.condensedBits.global
            : classicalBits
        )]
      }
      return []
    },
    commandRefs () {
      // Force update each time a new command gets rendered or the circuit changes.
      return this.nRenderedCommands > 0 ? this.$refs.commands.slice(0, this.circuit.commands.length) : []
    }
  },
  watch: {
    circuit: {
      immediate: true,
      handler: function (newCircuit) {
        if (newCircuit) {
          this.initCondensedRegisters()
        }
      }
    },
    recursive: {
      immediate: true,
      handler: function (recursive) {
        if (recursive) {
          // Make sure no registers are collapsed
          for (const name of Object.keys(this.condensedRegisters.toggles)) {
            this.condensedRegisters.toggles[name] = false
          }
        }
      }
    }
  },
  mounted () {
    // Initialise the teleport components
    this.infoModal.teleport.names[this.infoModal.teleport.id] = this.$refs.infoModals
  },
  methods: {
    initCondensedRegisters () {
      // Add a condensedRegister for each classical register name present in the circuit.
      const condensedRegisterNames = {}
      const condensedRegisterToggles = {}
      const condensedRegisterOrder = {}

      this.circuit.bits.forEach((bit, order) => {
        if (bit[0] in condensedRegisterNames) {
          condensedRegisterNames[bit[0]]++
          condensedRegisterOrder[bit[0]].last = this.circuit.qubits.length + order
        } else {
          condensedRegisterNames[bit[0]] = 1
          condensedRegisterToggles[bit[0]] = false
          condensedRegisterOrder[bit[0]] = {
            first: this.circuit.qubits.length + order,
            last: this.circuit.qubits.length + order
          }
        }
      })
      this.condensedRegisters.names = condensedRegisterNames
      this.condensedRegisters.toggles = condensedRegisterToggles
      this.condensedRegisters.order = condensedRegisterOrder
    },
    updateCondensedRegisterToggles (name) {
      this.condensedRegisters.toggles[name] = !this.condensedRegisters.toggles[name]
    },
    registerTeleport (...args) {
      this.$refs.teleportParent.registerTeleport(...args)
    },
    getRenderedCircuitEl () {
      return {
        circuit: this.$refs.renderedCircuit,
        width: this.$refs.renderedCircuitDimensions?.clientWidth,
        height: this.$refs.renderedCircuitDimensions?.clientHeight
      }
    },
    getDisplayedCircuitDimensions () {
      return {
        x: this.$refs.renderedCircuit?.clientWidth,
        y: this.$refs.renderedCircuit?.clientHeight
      }
    },
    onDisplayUpdate () {
      this.$emit('updated')
    }
  }
}
</script>

<template>
  <teleport-container :names="infoModal.teleport.names" ref="teleportParent"
    :class="{condensed: condensed, 'circuit-preview circuit_variables': !nested}"
  >
    <div v-if="circuit" tabindex="0" :class="{'nested-circuit-container': condensed, 'parent': !nested}">
      <!--  Pre-processing for the commands we want to display  -->
      <div style="display:none">
        <circuit-command
            :ref="'command-id'"
            :command="{op: {type: 'ID'}, args: circuitDetails.registerOrder}"
            :register-order="circuitDetails.registerOrder"
            :classicalThreshold="circuitDetails.qubits.length"
            :condensed-registers="condensedRegisters"
            @mounted="idCommandRef = $refs['command-id']"
        ></circuit-command>
        <circuit-command v-for="(command, j) in circuit.commands" :key="j"
            :ref="'commands'"
            :command="command"
            :register-order="circuitDetails.registerOrder"
            :classicalThreshold="circuitDetails.qubits.length"
            :condensed-registers="condensedRegisters"
            @mounted="nRenderedCommands++"
        >
          <template #gate-info>
            <gate-info
                :op="command.op"
                :teleport-id="infoModal.teleport.id"
                :teleport-parent="$refs.teleportParent"
                @register-teleport="registerTeleport">
            </gate-info>
          </template>
        </circuit-command>
      </div>

      <div ref="navigatorContent" :class="{'circuit-inner-scroll': condensed}" :style="navigatorStyling">
        <div ref="renderedCircuit">
          <div ref="renderedCircuitDimensions" class="circuit-container"
              :class="{nested: nested || condensed, zx: zxStyle}">
            <circuit-layer
                :qubits="true"
                :style="{'text-align': 'right'}"
                :argList="activeArgs"
                :condensed-registers="recursive ? {} : condensedRegisters.toggles"
                @toggle="updateCondensedRegisterToggles">
            </circuit-layer>

            <!--  Circuit commands will actually render in here:  -->
            <div v-if="commandRefs.length === 0"></div>
            <split-circuit-layers v-else
                :register-order="circuitDetails.registerOrder"
                :command-refs="commandRefs"
                :id-command-ref="idCommandRef"
                :condensed-registers="condensedRegisters.toggles"
                @updated="onDisplayUpdate">
            </split-circuit-layers>

            <circuit-layer
                :qubits="true"
                :style="{'text-align': 'left'}"
                :argList="activeArgs"
                :condensed-registers="recursive ? {} : condensedRegisters.toggles"
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
.nested-circuit-container.parent{
  overflow: hidden;
}
.nested-circuit-container:focus,
.nested-circuit-container:focus-visible {
    box-shadow: inset 0 0 0 6px var(--accent-col-outline, #ccffcc);
}

.circuit-inner-scroll{
    overflow: visible;
    width: -moz-fit-content;
    width: fit-content;
    margin: auto 0;
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
@import "./circuitDisplay.scss";
</style>
