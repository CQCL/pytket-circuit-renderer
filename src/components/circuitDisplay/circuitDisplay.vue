<script>
import { computed } from 'vue'
import { teleportContainer, teleportTo } from '@/components/teleport/init'
import { PendingDataValidator } from '@/components/propValidators'

import circuitLayer from './circuitLayer'
import splitCircuitLayers from './splitCircuitLayers'
import circuitCommand from './command'
import { gateInfo, circuitInfo } from '../gateInfo/init'
import { renderOptions, teleportConfig } from './provideKeys'
import MathjaxContent from '@/components/mathjaxContent/mathjaxContent.vue'

let nCircuits = 0 // circuits needs unique ids.

export default {
  name: 'circuit-display',
  components: {
    MathjaxContent,
    teleportContainer,
    teleportTo,
    circuitLayer,
    splitCircuitLayers,
    circuitCommand,
    gateInfo,
    circuitInfo
  },
  props: {
    circuit: { validator: PendingDataValidator(Object) },
    parentCommand: { type: Object, default: undefined },
    navigatorStyling: { type: Object, required: false, default: () => { return {} } },
    isInlineCircuit: { type: Boolean, default: false }
  },
  emits: ['updated'],
  inject: {
    condenseCBits: { from: renderOptions.condenseCBits },
    zxStyle: { from: renderOptions.zxStyle },
    recursive: { from: renderOptions.recursive },
    condensed: { from: renderOptions.condensed },
    nested: { from: renderOptions.nested },
    cropParams: { from: renderOptions.cropParams },
    globalTeleportParent: { from: teleportConfig.parent, default: false },
    globalTeleportToId: { from: teleportConfig.to, default: false }
  },
  provide () {
    return {
      [teleportConfig.parent]: computed(() => {
        return this.nested > 0 && this.globalTeleportParent ? this.globalTeleportParent : this.infoModal.teleport.parent
      }),
      [teleportConfig.to]: computed(() => {
        return this.nested > 0 && this.globalTeleportToId ? this.globalTeleportToId : this.infoModal.teleport.id
      })
    }
  },
  data () {
    nCircuits++
    const id = 'gate-info-modal-' + nCircuits
    return {
      infoModal: {
        teleport: {
          parent: null,
          names: {},
          id
        },
        visible: false,
        closeCallback: null
      },
      nRenderedCommands: 0,
      idCommandRef: null,
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
        const wasms = [...Array(this.circuit.number_of_ws ?? 0).keys()].map(i => ['_w', [i]])
        return {
          condensedBits: {
            global: this.circuit.bits.length > 0 ? [['C', ['..' + this.circuit.bits.length]]] : [],
            names: this.condensedRegisters.names
          },
          bits: this.circuit.bits,
          qubits: this.circuit.qubits,
          wasms: wasms.map(arg => ['WASM', arg[1]]), // Rename to something more user-friendly
          registerOrder: this.circuit.qubits.concat(this.circuit.bits).concat(wasms)
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
        ), ...this.circuitDetails.wasms]
      }
      return []
    },
    commandRefs () {
      // Force update each time a new command gets rendered or the circuit changes.
      return this.nRenderedCommands > 0 ? this.$refs.commands.slice(0, this.circuit.commands.length) : []
    },
    displayName () {
      const name = this.cropParams
        ? (this.circuit.name.length > 20 ? this.circuit.name.slice(0, 15) + '...' : this.circuit.name)
        : this.circuit.name
      return name
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
    this.infoModal.teleport.parent = this.$refs.teleportParent
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
    :class="{condensed: condensed, 'circuit-preview circuit_variables': nested === 0}"
  >
    <div v-if="circuit" tabindex="0" :class="{
      'nested-circuit-container': condensed,
      'parent': nested === 0,
      'odd_nesting': nested % 2 === 1,
      'inline-circuit': isInlineCircuit
    }" style="position: relative">
      <!--  Pre-processing for the commands we want to display  -->
      <div style="display:none">
        <circuit-command
            :ref="'command-id'"
            :command="{op: {type: 'ID'}, args: circuitDetails.registerOrder}"
            :register-order="circuitDetails.registerOrder"
            :classical-threshold="circuitDetails.qubits.length"
            :wasm-threshold="circuitDetails.qubits.length + circuitDetails.bits.length"
            :condensed-registers="condensedRegisters"
            @mounted="idCommandRef = $refs['command-id']"
        ></circuit-command>
        <circuit-command v-for="(command, j) in circuit.commands" :key="j"
            :ref="'commands'"
            :command="command"
            :register-order="circuitDetails.registerOrder"
            :classical-threshold="circuitDetails.qubits.length"
            :wasm-threshold="circuitDetails.qubits.length + circuitDetails.bits.length"
            :condensed-registers="condensedRegisters"
            @mounted="nRenderedCommands++"
        >
          <template #gate-info>
            <gate-info
                :command="command"
                :n-blocks="$refs.commands[j].nWires"
                @register-teleport="registerTeleport"
            >
            </gate-info>
          </template>
        </circuit-command>
      </div>

      <circuit-info
          v-if="nested === 0 || isInlineCircuit"
          :style="{position: 'absolute', left: nested === 0 ? 0: '0.5em', top: '0.5em', zIndex: 1}"
          :command="parentCommand"
          :circuit="circuit"
      ></circuit-info>

      <div ref="navigatorContent" :class="{'circuit-inner-scroll': condensed}" :style="navigatorStyling">
        <div ref="renderedCircuit">
          <div v-if="circuit && circuit.name" class="circuit-name-tag circuit-tag-below">
            <mathjax-content :formula="circuit.name" :fallback="displayName" inline-circuit></mathjax-content>
          </div>

          <div ref="renderedCircuitDimensions" class="circuit-container"
              :class="{nested: nested > 0 || condensed, zx: zxStyle}">
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
                :classical-threshold="circuitDetails.qubits.length"
                :wasm-threshold="circuitDetails.qubits.length + circuitDetails.bits.length"
                @updated="onDisplayUpdate">
            </split-circuit-layers>

            <circuit-layer
                :qubits="true"
                :style="{'text-align': 'left'}"
                :argList="activeArgs"
                :permutation="circuit.implicit_permutation"
                :condensed-registers="recursive ? {} : condensedRegisters.toggles"
                @toggle="updateCondensedRegisterToggles">
            </circuit-layer>
          </div>
        </div>
      </div>
    </div>

    <!-- Gates in circuit will send extra info modals here. -->
    <teleport-to
        :name="infoModal.teleport.id"
        ref="infoModals" style="z-index:10"
        data-cy="teleport-to"
        :data-cy-depth="nested"
    ></teleport-to>
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
.nested-circuit-container:hover > .circuit-inner-scroll > div > .circuit-name-tag {
  display: block;
  position: absolute;
  padding: 0.25em 0.5em;
  z-index: 2;
  font-size: 0.7em;
  border-radius: var(--radius);
  color: var(--text-primary);
}
.circuit-name-tag.circuit-tag-below{
  top: 0.5rem;
  background: hsl(from var(--paper-dark) h s l / 0.9);
}
.nested-circuit-container.inline-circuit > .circuit-inner-scroll > div > .circuit-name-tag {
  left: 2.5rem;
}
.nested-circuit-container:not(.inline-circuit) > .circuit-inner-scroll > div > .circuit-name-tag {
  left: 1px;
}
.circuit-name-tag,
.tool-tip-content .nested-circuit-container:hover > .circuit-inner-scroll > div > .circuit-name-tag {
  display: none;
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
    --current-circuit-background: var(--circuit-background);
    display: flex;
    position: relative;
    overflow: auto;
    background: var(--current-circuit-background);
    box-shadow: 0 0 0 var(--box-border-width) var(--box-col) inset;
}
.nested-circuit-container.inline-circuit{
  overflow: hidden
}
.nested-circuit-container.odd_nesting{
    --current-circuit-background: var(--paper);
}
.theme_variables.dark .nested-circuit-container:not(.parent){
    box-shadow: 0 0 0 1px var(--paper-dark) inset;
}
.navigator-content .nested-circuit-container.parent{
  overflow: hidden;
}
.nested-circuit-container:focus,
.nested-circuit-container:focus-visible {
    box-shadow: inset 0 0 0 6px var(--primary-alpha, #ccffcc);
}

.circuit-inner-scroll{
    overflow: visible;
    width: -moz-fit-content;
    width: fit-content;
    margin: auto 0;
}

.inline-circuit > .circuit-inner-scroll,
.parent > .circuit-inner-scroll{
  padding-left: 2.5em;
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

.circuit-info-button{
  padding: 0.2em;
  border-radius: 0.5em;
  background: var(--paper-dark);
  color: var(--box-text-col);
  display: flex;
  justify-content: stretch;
}
.circuit-info-button > svg{
  height: 1.5em;
  width: 1.5em;
}
.circuit-info-button:hover{
  cursor: pointer
}
</style>

<style lang="scss">
@import "./circuitDisplay.scss";
</style>
