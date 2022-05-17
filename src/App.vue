<script>
import circuitDisplayContainer from "@/main"

export default {
  name: 'App',
  components: {
    circuitDisplayContainer,
  },
  data () {
    return {
      circuitJSON: undefined,
    }
  },
  computed: {
    circuit () {
      try {
        let circ = JSON.parse(this.circuitJSON);
        return circ;
      } catch (e) {
        console.log(e);
      }
      return undefined;
    }
  }
}
</script>

<template>
  <div>
    <h1>Sample Circuit display app.</h1>

    <h4>Circuit input</h4>
    <textarea v-model="circuitJSON"></textarea>

    <circuit-display-container :circuit-raw="circuit"></circuit-display-container>

    <h4>Static input</h4>
    <div id="circuit-json-to-display">
      {"phase":"0.5","commands":[{"op":{"type":"Measure"},"args":[["q",[1]],["c",[1]]]},{"op":{"type":"U3","params":["1.0","-0.5","0.5"]},"args":[["q",[0]]]},{"op":{"type":"Measure"},"args":[["q",[0]],["c",[0]]]}],"qubits":[["q",[0]],["q",[1]]],"bits":[["c",[0]],["c",[1]]],"implicit_permutation":[[["q",[0]],["q",[0]]],[["q",[1]],["q",[1]]]]}
    </div>

    <circuit-display-container :circuit-element-str="'#circuit-json-to-display'"></circuit-display-container>
  </div>
</template>

<style>
</style>
