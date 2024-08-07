<script>
import { computed } from 'vue'
import { renderIndexedArgs, extractSubCircuit } from './utils'

import wire from './wire'
import nestedLabelLayer from './nestedLabelLayer'
import circuitLayer from './circuitLayer'
import gateSwap from './gateSwap'
import gateMeasure from './gateMeasure'
import gateComponent from './gateComponent'
import { renderOptions } from './provideKeys'

export default {
  name: 'generic-gate',
  components: {
    wire,
    nestedLabelLayer,
    circuitLayer,
    gateSwap,
    gateMeasure,
    gateComponent
  },
  props: {
    indexedArgs: { type: Array, required: true },
    command: { type: Object, required: true },
    linkVertical: { type: Boolean, default: false },
    split: { type: Boolean, default: false },
    condensedRegisters: { type: Object, required: true },
    posAdjust: { type: Number, default: 0 }
  },
  inject: {
    condenseCBits: { from: renderOptions.condenseCBits },
    zxStyle: { from: renderOptions.zxStyle },
    recursive: { from: renderOptions.recursive },
    condensed: { from: renderOptions.condensed },
    nested: { from: renderOptions.nested }
  },
  provide () {
    // Overwrite child renderOptions if displaying a nested circuit.
    return {
      [renderOptions.condensed]: computed(() => { return this.nestedCircuitGate ? true : this.condensed }),
      [renderOptions.nested]: computed(() => { return this.nestedCircuitGate ? this.nested + 1 : this.nested })
    }
  },
  computed: {
    opType () {
      return this.command.op.type
    },
    renderIndexedArgs,
    special2qGate () {
      // Note: we will only have a controlled operation here if we need to render it specially.
      return ['SWAP', 'Measure', 'CX', 'CZ'].includes(this.opType)
    },
    special0qGate () {
      // Construct a fake arg for display purposes if this gate doesn't have any.
      const flag = !(this.opType === 'ID' || (this.command.args && this.command.args.length > 0))
      if (flag) {
        const fakeArg = this.indexedArgs[0]
        fakeArg.flags.first = true
        fakeArg.flags.last = true
        fakeArg.flags.single = true
        fakeArg.pos = -1
        return {
          flag,
          fakeCommandArgs: [this.indexedArgs[0].name],
          fakeIndexedArg: fakeArg,
          name: this.$refs.special0qGateComponent ? this.$refs.special0qGateComponent.name : this.opType
        }
      }
      return { flag }
    },
    nestedCircuitGate () {
      return this.recursive && this.nestedCircuit
    },
    nestedCircuit () {
      let circuit
      if (this.opType === 'ConjugationBox') {
        circuit = {
          name: 'ConjugationBox',
          qubits: this.command.args,
          bits: [],
          commands: [
            { op: this.command.op.box.compute, args: this.command.args },
            { op: { type: 'Barrier' }, args: this.command.args },
            { op: this.command.op.box.action, args: this.command.args },
            { op: { type: 'Barrier' }, args: this.command.args },
            {
              op: (
                this.command.op.box.uncompute
                  ? this.command.op.box.uncompute
                  : { type: 'compute†' }
              ),
              args: this.command.args
            }
          ]
        }
      } else {
        circuit = extractSubCircuit(this.command.op)
        if (circuit && !circuit.name) {
          circuit.name = this.opType
        }
      }
      return circuit
    }
  },
  beforeCreate () {
    this.$options.components['circuit-display'] = require('./circuitDisplay.vue').default
  }
}

</script>

<template>
  <div :data-gate="opType">
    <!-- ID -->
    <div v-if="opType === 'ID'">
      <div v-for="(arg, i) in renderIndexedArgs" :key="i" class="gate_container">
        <wire :classical="arg.flags.classical" :condensed="arg.flags.condensed" :wasm="arg.flags.wasm"></wire>
        <div v-if="linkVertical" class="link link-top" :class="{'classical': arg.flags.classical}"></div>
      </div>
    </div>

    <!-- Special: 2Q Gate -->
    <div v-if="special2qGate" data-gate="Special">
      <div v-for="(arg, i) in renderIndexedArgs" :key="i"
           class="gate_container nested"
           :class="{'self-controlled-padding': arg.selfControl}"
           style="height:var(--block-height)"
      >
        <div v-if="!arg.flags.first" class="link link-top" :class="{classical: opType === 'Measure'}"></div>
        <div v-if="arg.flags.first && linkVertical" class="link link-top" :class="{'classical': arg.flags.classical}"></div>

        <wire class="wire_in flex_wire" :classical="arg.flags.classical" :condensed="arg.flags.condensed" :wasm="arg.flags.wasm"></wire>

        <div v-if="opType === 'SWAP'">
          <gate-swap v-if="arg.pos !== -1" class="gate gate_connection gate_special"></gate-swap>
          <div v-else class="gate gate_connection"></div>
        </div>

        <div v-if="opType === 'CX' && zxStyle" class="gate"
             :class="[arg.pos !== -1 ? 'gate_box gate_special zx-spider zx-cx' : 'gate_connection', {z: arg.pos === 0, x: arg.pos === 1 }]">
        </div>
        <div v-if="opType === 'CX' && !zxStyle" class="gate"
             :class="{'z gate_control control_1': arg.pos === 0, 'x gate_box': arg.pos === 1, gate_connection: arg.pos === -1 }">
             <span class="gate_name">[[# arg.pos === 1 ? 'X' : '' #]]</span>
        </div>

        <div v-if="opType === 'CZ' && zxStyle" class="gate"
             :class="[arg.pos !== -1 ? 'gate_box gate_special zx-spider z zx-cz' : 'gate_connection']">
          <div v-if="arg.flags.last" class="gate gate-box h zx-hadamard"></div>
        </div>
        <div v-if="opType === 'CZ' && !zxStyle" class="gate"
              :class="[arg.pos !== -1 ? 'z gate_control control_1' : 'gate_connection']">
        </div>

        <div v-if="opType === 'Measure'">
          <gate-measure v-if="arg.pos + posAdjust === 0" class="gate gate_connection"></gate-measure>
          <div v-else class="gate gate_connection"></div>
        </div>

        <wire class="wire_in flex_wire" :classical="arg.flags.classical" :condensed="arg.flags.condensed" :wasm="arg.flags.wasm"></wire>
      </div>
    </div>

    <!-- Special: No args -->
    <div v-if="special0qGate.flag" data-gate="Special:no-args">
      <div v-for="(arg, i) in renderIndexedArgs" :key="i" class="gate_container">
        <gate-component v-if="i === renderIndexedArgs.length - 1" ref="special0qGateComponent"
            :args="[special0qGate.fakeIndexedArg]"
            :pos-adjust="posAdjust"
            :split="split"
            :command="{ op: command.op, args: special0qGate.fakeCommandArgs }"
            :link-vertical="linkVertical">
        </gate-component>
        <wire v-else :classical="arg.flags.classical" :condensed="arg.flags.condensed" :wasm="arg.flags.wasm"></wire>
      </div>
    </div>

    <!-- Special: Nested -->
    <div v-if="nestedCircuitGate" class="gate_container nested">
      <circuit-layer :nested="true">
        <div v-for="(arg, i) in renderIndexedArgs" :key="i" class="gate_container">
          <wire v-if="arg.pos !== -1" :classical="arg.flags.classical" :condensed="arg.flags.condensed" :wasm="arg.flags.wasm" :class="{'self-controlled-padding': arg.selfControl}"></wire>
          <div v-else class="wire transparent-wire"></div>
        </div>
      </circuit-layer>
      <nested-label-layer :args="renderIndexedArgs"></nested-label-layer>

      <circuit-display :circuit="nestedCircuit" :is-inline-circuit="true" :parent-command="command"></circuit-display>

      <nested-label-layer :args="renderIndexedArgs"></nested-label-layer>
      <circuit-layer :nested="true">
        <div v-for="(arg, i) in renderIndexedArgs" :key="i" class="gate_container">
          <wire v-if="arg.pos !== -1" :classical="arg.flags.classical" :condensed="arg.flags.condensed" :wasm="arg.flags.wasm"></wire>
          <div v-else class="wire transparent-wire"></div>
        </div>
      </circuit-layer>
      <div v-if="linkVertical" class="link link-top" :class="{'classical': renderIndexedArgs[0].flags.classical}" style="z-index: -1"></div>
    </div>

    <!-- Generic -->
    <div v-if="opType !== 'ID' && !special2qGate && !special0qGate.flag && !nestedCircuitGate">
      <gate-component
              :args="renderIndexedArgs"
              :pos-adjust="posAdjust"
              :split="split"
              :command="command"
              :link-vertical="linkVertical">
      </gate-component>
    </div>
  </div>
</template>

<style>
</style>
