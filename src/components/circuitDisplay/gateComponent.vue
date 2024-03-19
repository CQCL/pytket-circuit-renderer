<script>
import wire from './wire'
import { formatClassicalExp, formatPosStr } from './utils'
import { renderOptions } from './provideKeys'
import { create, evaluateDependencies, piDependencies, eDependencies, iDependencies } from 'mathjs'

// Must explicitly choose which constants to support: pi, e, i
const { evaluate } = create({
  evaluateDependencies,
  piDependencies,
  eDependencies,
  iDependencies
}, {})

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
    zxStyle: { from: renderOptions.zxStyle },
    cropParams: { from: renderOptions.cropParams }
  },
  computed: {
    opType () {
      return this.command.op.type
    },
    isSpider () {
      return [
        'X', 'U1', 'V', 'Vdg', 'Y', 'Z', 'S', 'Sdg', 'T', 'Tdg'
      ].includes(this.opType)
    },
    specialGateClasses () {
      return {
        gate_top: !this.arg.flags.single && !this.split && this.arg.flags.first,
        gate_mid: !this.arg.flags.single && !this.split && !this.arg.flags.first && !this.arg.flags.last,
        gate_bottom: !this.arg.flags.single && !this.split && this.arg.flags.last,
        gate_box: this.command.args.length === 1 || this.arg.flags.single || this.split,
        classical: this.arg.flags.classical,
        condensed: this.arg.flags.condensed,
        gate_reset: this.opType === 'Reset',
        gate_barrier: this.opType === 'Barrier',
        gate_special: this.zxStyle && (this.opType === 'H' || this.isSpider || this.opType === 'Reset'),
        gate_0q: this.opType === 'Phase',
        'zx-hadamard': this.opType === 'H' && this.zxStyle,
        'zx-spider': this.zxStyle && this.isSpider
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
      if (['X', 'Rx', 'Rxx', 'V', 'Vdg', 'SX', 'SXdg',
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

      // If this box is daggered display it with a dag symbol
      let daggered = this.opType === 'StatePreparationBox' && op.box.is_inverse
      if (['Sdg', 'Tdg', 'Vdg', 'SXdg'].includes(this.opType)) {
        daggered = true
        name = this.opType.slice(0, -2)
      }

      return name + (daggered ? '†' : '') + this.paramStr
    },
    paramStr () {
      const op = this.command.op
      let params = 'params' in op && op.params ? op.params : []
      params = params.concat('box' in op && op.box.params ? op.box.params : [])
      if (this.cropParams) {
        params = params.map((p) => {
          const num = Number(p)
          if (isNaN(p)) {
            try {
              // Evaluate as a number and round that
              const pEval = evaluate(p)
              if (!isNaN(pEval)) {
                return Math.round(pEval * 1000) / 1000
              }
              throw new Error('Can\'t evaluate')
            } catch (e) {
              // Just truncate the string
              return p.length > 5 ? p.slice(0, 4) + '...' : p
            }
          }
          return Math.round(num * 1000) / 1000
        })
      }
      return params.length > 0
        ? ((params.length > 3 && this.cropParams) ? `(${params.slice(0, 4)}...)` : `(${params})`)
        : ''
    },
    posStr () {
      const getMultiPos = (filterFn) => {
          if (this.arg.flags.condensed) {
            let filtered = this.arg.multiPos.map(multiPos => {
              if (Array.isArray(multiPos)) {
                let mp = multiPos.filter(filterFn)
                return mp.length > 0 ? mp : -1
              }
              return multiPos
            })
            const repeats = filtered.reduce(
                (acc, multiPos) => Array.isArray(multiPos) ? Math.max(acc, multiPos.length) : acc,
                1
            )
            const transposed = Array(repeats)
            for (let i = 0; i < repeats; i++) {
              transposed[i] = filtered.map(
                  multiPos => Array.isArray(multiPos) ? (multiPos.length >= i ? multiPos[i] : multiPos[-1]) : multiPos
              )
            }
            return transposed
          }
          // Not condensed so we can filter directly
          return this.arg.multiPos.filter(filterFn)
        }

      let inputs = []
      let outputs = []
      if (this.opType === "WASM" && !this.arg.flags.wasm) {
        // Handle classical wires with wasm boxes specially.
        const inputArgEnd = this.command.op.wasm.width_i_parameter.reduce((acc, i) => i + acc, 0)
        const outputArgEnd = inputArgEnd + this.command.op.wasm.width_o_parameter.reduce((acc, i) => i + acc, 0)

        inputs = getMultiPos(pos => pos < inputArgEnd)
        outputs = getMultiPos(pos => pos >= inputArgEnd && pos < outputArgEnd)
      } else {
        const classical = ('classical' in this.command.op) ? this.command.op.classical :
            'box' in this.command.op ? this.command.op.box : {}

        let outputArgStart = 'n_i' in classical ? classical.n_i : 0
        let inputArgEnd = 'n_io' in classical ? outputArgStart + classical.n_io : outputArgStart
        const outputArgEnd = 'n_o' in classical ? inputArgEnd + classical.n_o : this.command.args.length

        // Want inputs to be defined when not classical
        if (!('n_i' in classical) && !('n_io' in classical) && !('n_o' in classical)) {
          inputArgEnd = this.command.args.length
          outputArgStart = this.command.args.length
        }
        inputs = getMultiPos(pos => pos + this.posAdjust >=0 && pos + this.posAdjust < inputArgEnd)
        outputs = getMultiPos(pos => pos + this.posAdjust >= outputArgStart && pos + this.posAdjust < outputArgEnd)
      }
      return {
        in: inputs.length > 0 ? inputs.map(pos => this.formatPosStr(pos, this.posAdjust)).join(" | ") : "",
        out: outputs.length > 0 ? outputs.map(pos => this.formatPosStr(pos, this.posAdjust)).join(" | ") : "",
      }
    }
  },
  methods: {
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
      <wire :classical="arg.flags.classical" :condensed="arg.flags.condensed" :wasm="arg.flags.wasm"></wire>
      <div class="gate_container" :class="[gateColor]">
        <div v-if="arg.pos !== -1" class="link gate" :class="specialGateClasses"></div>
      </div>
    </div>

    <!-- Generic single block gate -->
    <div v-else class="gate_container nested" style="height:var(--block-height)">
      <wire v-if="arg.pos !== -1" class="wire_in" :class="{flex_wire: arg.flags.single, 'self-controlled-padding-generic': arg.selfControl}" :classical="arg.flags.classical" :condensed="arg.flags.condensed" :wasm="arg.flags.wasm"></wire>
      <wire v-else class="wire_in transparent-wire" :class="{flex_wire: arg.flags.single}" :classical="arg.flags.classical" :condensed="arg.flags.condensed" :wasm="arg.flags.wasm"></wire>

      <!-- StatePreparation with reset requires special resets -->
      <div v-if="opType === 'StatePreparationBox' && command.op.box.with_initial_reset && arg.pos > -1"
           :class="specialGateClasses" class="gate gate_reset"
      ></div>

      <div class="gate_container" :class="[gateColor, {'generic': !arg.flags.single}]">
        <div class="gate connected" :class="specialGateClasses">
          <span v-if="arg.pos !== -1 && !arg.flags.single" class="wire-label">
            [[# posStr.in #]]
          </span>
          <span :class="specialGateContentClasses" :style="[opType === 'Reset'? {margin: 0} : {}]">
            [[# arg.flags.last || split ? name : '' #]]
          </span>
          <span v-if="arg.pos !== -1 && !arg.flags.single" class="wire-label end">
            [[# posStr.out #]]
          </span>
        </div>
        <div v-if="linkVertical" class="link link-top" :class="{'classical': arg.flags.classical}"></div>
      </div>

      <wire v-if="arg.pos !== -1" class="wire_in" :class="{flex_wire: arg.flags.single}" :classical="arg.flags.classical" :condensed="arg.flags.condensed" :wasm="arg.flags.wasm"></wire>
      <wire v-else class="wire_in transparent-wire" :class="{flex_wire: arg.flags.single}" :classical="arg.flags.classical" :condensed="arg.flags.condensed" :wasm="arg.flags.wasm"></wire>
    </div>

  </div>
</template>

<style>
</style>
