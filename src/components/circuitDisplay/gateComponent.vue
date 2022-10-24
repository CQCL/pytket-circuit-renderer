<script>
import wire from './wire'
import { formatClassicalExp, formatPosStr } from './utils'
import { renderOptions } from './provideKeys'

export default {
  name: 'gate-component',
  components: {
    wire
  },
  props: {
    arg: { type: Object, required: true },
    posAdjust: { type: Number, required: true },
    split: { type: Boolean, default: false },
    command: { type: Object, required: true },
    linkVertical: { type: Boolean, default: false }
  },
  inject: {
    zxStyle: { from: renderOptions.zxStyle }
  },
  computed: {
    opType () {
      return this.command.op.type
    },
    specialGateClasses () {
      return {
        gate_top: !this.arg.flags.single && !this.split && this.arg.flags.first,
        gate_mid: !this.arg.flags.single && !this.split && !this.arg.flags.first && !this.arg.flags.last,
        gate_bottom: !this.arg.flags.single && !this.split && this.arg.flags.last,
        gate_box: this.command.args.length === 1 || this.arg.flags.single || this.split,
        classical: this.arg.flags.classical,
        condensed: this.arg.flags.condensed,
        connected: this.arg.pos !== -1,
        gate_reset: this.opType === 'Reset',
        gate_barrier: this.opType === 'Barrier',
        'zx-hadamard': this.opType === 'H' && this.zxStyle,
        'zx-spider': this.zxStyle && this.asSpider(this.opType)
      }
    },
    specialGateContentClasses () {
      if (this.opType === 'Reset') {
        return ['gate', 'gate_box', { 'zx-spider x': this.zxStyle }]
      }
      return ['gate_name']
    },
    gateColor () {
      // Returns the zx gate colour class for preset gate types where applicable.
      if (this.opType === 'H') {
        return 'h'
      }
      if (['X', 'Rx', 'V', 'Vdg', 'SX', 'SXdg',
        'XXPhase', 'XXPhase3', 'PhasedX', 'NPhasedX'
      ].includes(this.opType)) {
        return 'x'
      }
      if (['Y', 'Ry', 'YYPhase'].includes(this.opType)) {
        return 'y'
      }
      if (['Z', 'S', 'Sdg', 'T', 'Tdg', 'Rz', 'U1',
        'PhasedISWAP', 'ZZPhase', 'ZZMax', 'Measure',
        'Reset'].includes(this.opType)) {
        return 'z'
      }
      return ''
    },
    name () {
      // Name of this gate.
      let name = this.opType
      const op = this.command.op

      if (this.opType === 'CircBox' && 'box' in op && 'circuit' in op.box) {
        name = 'name' in op.box.circuit ? op.box.circuit.name : 'Circuit'
      }
      if (['Custom', 'CustomGate', 'Composite', 'CompositeGate'].includes(this.opType) &&
          'box' in op && 'gate' in op.box) {
        name = 'name' in op.box.gate ? op.box.gate.name : 'Parametrised Circuit'
      }
      // Display classical op params more directly
      if (['ExplicitPredicate', 'ExplicitModifier'].includes(this.opType) &&
          'classical' in op) {
        name = 'name' in op.classical ? op.classical.name : 'Classical'
      }
      if (this.opType === 'MultiBit' && 'classical' in op) {
        name = `Multi-${'name' in op.classical ? op.classical.name : 'Classical'}`
      }
      if (this.opType === 'SetBits') {
        name = `SetBits(${op.classical.values.map(val => val ? '1' : '0')})`
      }
      if (this.opType === 'RangePredicate') {
        name = `Range[${op.classical.lower}, ${op.classical.upper}]`
      }
      if (this.opType === 'WASM') {
        name = `WASM: ${op.wasm.func_name}`
      }
      if (this.opType === 'ClassicalExpBox') {
        name = this.formatClassicalExp(op.box.exp)
      }

      // If this should be a spider, return the phase to display.
      const phase = this.spiderPhase(this.opType, this.paramStr)
      if (phase && this.zxStyle) {
        return phase
      }
      return name + this.paramStr
    },
    paramStr () {
      const op = this.command.op
      let params = 'params' in op && op.params ? op.params : []
      params = params.concat('box' in op && op.box.params ? op.box.params : [])
      params = params.map((p) => {
        const num = Number(p)
        if (isNaN(p)) {
          return p.length > 5 ? p.slice(0, 4) + '...' : p
        } else {
          return Math.round(num * 1000) / 1000
        }
      })
      return params.length > 0
        ? (params.length > 3 ? `(${params.slice(0, 4)}...)` : `(${params})`)
        : ''
    },
    posStr () {
      return this.formatPosStr(this.arg.pos, this.posAdjust)
    }
  },
  methods: {
    asSpider (opType) {
      return [
        'X', 'U1', 'V', 'Vdg', 'Y', 'Z', 'S', 'Sdg', 'T', 'Tdg'
      ].includes(opType)
    },
    spiderPhase (opType, paramStr) {
      const convert = {
        X: 'π',
        U1: paramStr + 'π',
        V: 'π/2',
        Vdg: '-π/2',
        Y: 'π',
        Z: 'π',
        S: 'π/2',
        Sdg: '-π/2',
        T: 'π/4',
        Tdg: '-π/4',
        Reset: '0',
        H: ' '
      }
      if (opType in convert) {
        return convert[opType]
      } else {
        return false
      }
    },
    formatClassicalExp,
    formatPosStr
  }
}

</script>

<template>
  <div :data-gate-component="opType">
    <!-- Barrier requires special rendering -->
    <div v-if="opType === 'Barrier'" style="height:var(--block-height)">
      <wire :classical="arg.flags.classical" :condensed="arg.flags.condensed"></wire>
      <div class="gate_container" :class="[gateColor]">
        <div v-if="arg.pos !== -1" class="link" :class="specialGateClasses"></div>
      </div>
    </div>

    <!-- Generic single block gate -->
    <div v-else class="gate_container nested" style="height:var(--block-height)">
      <wire v-if="arg.pos !== -1" class="wire_in" :class="{flex_wire: arg.flags.single}" :classical="arg.flags.classical" :condensed="arg.flags.condensed"></wire>

      <div class="gate_container" :class="[gateColor, {'generic': !arg.flags.single}]">
        <div class="gate" :class="specialGateClasses">
          <span v-if="arg.pos !== -1 && !arg.flags.single" class="wire-label">
            [[# posStr #]]
          </span>
          <span :class="specialGateContentClasses" :style="[opType === 'Reset'? {margin: 0} : {}]">
            [[# arg.flags.last || split ? name : '' #]]
          </span>
        </div>
        <div v-if="linkVertical" class="link link-top" :class="{'classical': arg.flags.classical}"></div>
      </div>

      <wire v-if="arg.pos !== -1" class="wire_in" :class="{flex_wire: arg.flags.single}" :classical="arg.flags.classical" :condensed="arg.flags.condensed"></wire>
    </div>

  </div>
</template>

<style>
</style>
