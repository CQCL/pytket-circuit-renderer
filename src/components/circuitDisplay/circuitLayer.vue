<script>
export default  {
  name: "circuit-layer",
  emits: ["toggle"],
  props: {
    qubits: {type: Boolean, default: false},
    nested: {type: Boolean, default: false},
    argList: {type: Array, default () {return []}},
    condensedRegisters: {type: Object, default () {return {}}},
  },
  methods: {
    toggleRegister (name) {
      if (name in this.condensedRegisters) {
        this.$emit("toggle", name);
      }
    }
  }
}
</script>

<template>
  <div class="circuit-layer" :class="{'qubits': qubits}">
    <slot>
      <!--  Default is the wire name list  -->
      <div
          v-for="(wire, i) in argList"
          :key="i"
          :class="{'qubit': qubits, 'toggle' : wire[0] in condensedRegisters}"
          @click="toggleRegister(wire[0])">
        [[# wire[0] #]][[[# wire[1].join(',') #]]]
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
