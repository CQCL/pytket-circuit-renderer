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

<style>
</style>
