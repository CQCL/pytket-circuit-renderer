<script>
import { renderIndexedArgs, extractSubCircuit } from './utils'

import wire from './wire'
import nestedLabelLayer from './nestedLabelLayer'
import circuitLayer from './circuitLayer'
import gateSwap from './gateSwap'
import gateMeasure from './gateMeasure'
import gateComponent from './gateComponent'

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
    renderOptions: { type: Object, required: true },
    condensedRegisters: { type: Object, required: true },
    posAdjust: { type: Number, default: 0 }
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
    nestedCircuitGate () {
      return this.renderOptions.recursive && this.nestedCircuit
    },
    nestedRenderOptions () {
      const newOptions = { ...this.renderOptions }
      newOptions.condensed = true
      newOptions.nested = true
      return newOptions
    },
    nestedCircuit () {
      return extractSubCircuit(this.command.op)
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
        <wire :classical="arg.flags.classical" :condensed="arg.flags.condensed"></wire>
        <div v-if="linkVertical" class="link link-top" :class="{'classical': arg.flags.classical}"></div>
      </div>
    </div>

    <!-- Special -->
    <div v-if="special2qGate" data-gate="Special">
      <div v-for="(arg, i) in renderIndexedArgs" :key="i"
          class="gate_container nested" style="height:var(--block-height)"
      >
        <div v-if="!arg.flags.first" class="link link-top" :class="{classical: opType === 'Measure'}"></div>
        <div v-if="arg.flags.first && linkVertical" class="link link-top" :class="{'classical': arg.flags.classical}"></div>

        <wire class="wire_in flex_wire" :classical="arg.flags.classical" :condensed="arg.flags.condensed"></wire>

        <div v-if="opType === 'SWAP'">
          <gate-swap v-if="arg.pos !== -1" class="gate gate_connection"></gate-swap>
          <div v-else class="gate gate_connection"></div>
        </div>

        <div v-if="opType === 'CX' && renderOptions.zxStyle" class="gate"
             :class="[arg.pos !== -1 ? 'gate_box zx-spider zx-cx' : 'gate_connection', {z: arg.pos === 0, x: arg.pos === 1 }]">
        </div>
        <div v-if="opType === 'CX' && !renderOptions.zxStyle" class="gate"
             :class="{'z gate_control': arg.pos === 0, 'x gate_box': arg.pos === 1, gate_connection: arg.pos === -1 }">
             <span class="gate_name">[[# arg.pos === 1 ? 'X' : '' #]]</span>
        </div>

        <div v-if="opType === 'CZ' && renderOptions.zxStyle" class="gate"
             :class="[arg.pos !== -1 ? 'gate_box zx-spider z zx-cz' : 'gate_connection']">
          <div v-if="arg.flags.last" class="gate gate-box h zx-hadamard"></div>
        </div>
        <div v-if="opType === 'CZ' && !renderOptions.zxStyle" class="gate"
              :class="[arg.pos !== -1 ? 'z gate_control' : 'gate_connection']">
        </div>

        <div v-if="opType === 'Measure'">
          <gate-measure v-if="arg.pos + posAdjust === 0" class="gate gate_connection"></gate-measure>
          <div v-else class="gate gate_connection"></div>
        </div>

        <wire class="wire_in flex_wire" :classical="arg.flags.classical" :condensed="arg.flags.condensed"></wire>
      </div>
    </div>

    <!-- Nested -->
    <div v-if="nestedCircuitGate" class="gate_container nested">
      <circuit-layer :nested="true">
        <div v-for="(arg, i) in renderIndexedArgs" :key="i" class="gate_container">
          <wire v-if="arg.pos !== -1" :classical="arg.flags.classical" :condensed="arg.flags.condensed"></wire>
          <div v-else class="wire transparent-wire"></div>
        </div>
      </circuit-layer>
      <nested-label-layer :args="renderIndexedArgs"></nested-label-layer>

      <circuit-display v-if="nestedCircuit" :circuit="nestedCircuit" :render-options="nestedRenderOptions"></circuit-display>

      <nested-label-layer :args="renderIndexedArgs"></nested-label-layer>
      <circuit-layer :nested="true">
        <div v-for="(arg, i) in renderIndexedArgs" :key="i" class="gate_container">
          <wire v-if="arg.pos !== -1" :classical="arg.flags.classical" :condensed="arg.flags.condensed"></wire>
          <div v-else class="wire transparent-wire"></div>
        </div>
      </circuit-layer>
    </div>

    <!-- Generic -->
    <div v-if="opType !== 'ID' && !special2qGate && !nestedCircuitGate">
      <gate-component v-for="(arg, i) in renderIndexedArgs" :key="i"
              :arg="arg"
              :pos-adjust="posAdjust"
              :split="split"
              :command="command"
              :link-vertical="linkVertical"
              :render-options="renderOptions">
      </gate-component>
    </div>
  </div>
</template>

<style>
</style>
