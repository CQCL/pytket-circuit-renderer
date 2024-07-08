<script>
import { regToStr, registerEquality } from './utils'

export default {
  name: 'circuit-layer',
  emits: ['toggle'],
  props: {
    qubits: { type: Boolean, default: false },
    argList: { type: Array, default () { return [] } },
    permutation: { type: Array, default () { return [] } },
    condensedRegisters: { type: Object, default () { return {} } }
  },
  computed: {
    permutationSources () {
      return this.permutation.map(entry => entry[0])
    },
    permutationTargets () {
      return this.permutation.map(entry => entry[1])
    },
    permutedArgList () {
      if (this.permutation.length === 0) return this.argList
      return this.argList.map(arg => {
        const index = this.permutationSources.findIndex(reg => registerEquality(reg, arg))
        return index > -1 ? this.permutationTargets[index] : arg
      })
    }
  },
  methods: {
    toggleRegister (name) {
      if (name in this.condensedRegisters) {
        this.$emit('toggle', name)
      }
    },
    regToStr
  }
}
</script>

<template>
  <div class="circuit-layer" :class="{'qubits': qubits}">
    <slot>
      <!--  Default is the wire name list  -->
      <div
          v-for="(wire, i) in permutedArgList"
          :key="i"
          :class="{'qubit': qubits, 'toggle' : wire[0] in condensedRegisters}"
          @click="toggleRegister(wire[0])">
        [[# regToStr(wire) #]]
      </div>
    </slot>
  </div>
</template>

<style scoped>
.circuit-layer{
    min-width: var(--block-height);
    width: max-content;
    display: flex;
    flex-flow: column nowrap;
    flex-grow: 1;
    justify-content: space-between;
    align-items: stretch;
    margin-bottom: 20px;
}
.circuit-layer.qubits{
    flex-grow: 0;
}
.toggle{
    cursor: ns-resize;
}
</style>
