<script>
export default  {
  name: "circuit-layer",
  props: {
    qubits: {type: Boolean, default: false},
    nested: {type: Boolean, default: false},
    argList: {type: Array, default () { return []} },
  }
}
</script>

<template>
  <div class="circuit-layer" :class="{'qubits': qubits}">
    <slot>
      <!--  Default is the wire name list  -->
      <div v-for="(wire, i) in argList" :key="i" class="wire-label" :class="{'qubit': qubits}">
        [[# wire[0][0] #]][[[# wire[1][0] #]]]
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
</style>
