<script>
import { chartList } from '@/components/charts/init'

export default  {
  name: "gate-info-classical",
  components: {
    chartList,
  },
  props: {
    op: {type: Object, required: true},
  },
  computed: {
    opType () {
      return this.op.type;
    },
    classicalTable () {
      const classical = (this.op && "classical" in this.op) ? this.op.classical : this.op.box;
      // Collate the options to be displayed as a simple table
      if (classical) {
        return {
          ...("name" in classical && {"Name": classical.name}),
          ...("n_i" in classical && {"Input bits": classical.n_i}),
          ...("n_io" in classical && {"Input/Output bits": classical.n_io}),
          ...("n_o" in classical && {"Output bits": classical.n_o}),
          ...("upper" in classical && {"Upper": classical.upper}),
          ...("lower" in classical && {"Lower": classical.lower}),
        }
      }
      return {};
    },
    hasClassicalTable () {
      return Object.values(this.classicalTable).reduce((prev, next) => prev || (typeof next !== 'undefined'), false);
    },
  },
  methods: {
    formatClassicalExp (expression) {
      let formattedArgs = [];
      for (let arg of expression.args) {
        if (typeof arg == "number") formattedArgs.push(arg);  // constant
        else if (Array.isArray(arg)) formattedArgs.push(`${arg[0]}[${arg[1][0]}]`);  // bit
        else if ("name" in arg) formattedArgs.push(arg.name);  // bit register
        else formattedArgs.push(this.formatClassicalExp(arg));  // recursive expression
      }
      // Now get the operation display name
      const op = expression.op.split(".");
      const operation = (op.length > 1) ? op[1] : op[0];
      const n = formattedArgs.length;

      // Display the operation differently based on the number of arguments involved
      // This is so we can write binary operations infix, and omit the brackets for unary or constant operations
      if (n === 0) return operation;  // -> op
      else if (n === 1) return `${operation} ${formattedArgs[0]}`;  // -> op exp
      else if (n === 2) return `(${formattedArgs[0]} ${operation} ${formattedArgs[1]})`;  // -> (exp op exp)
      else return `${operation}(${formattedArgs})`;  // -> op(exp, ... exp)
    }
  }
}
</script>

<template>
<div v-if="op">
    <div v-if="opType === 'ClassicalExpBox'">
      <h4>Expression</h4>
      <p>[[# formatClassicalExp(op.box.exp) #]]</p>
    </div>

    <table v-if="hasClassicalTable">
      <tr v-for="key in Object.keys(classicalTable)" :key="key">
        <th>[[# key #]]</th>
        <td>[[# classicalTable[key] #]]</td>
      </tr>
    </table>
    <table v-if="'classical' in op">
      <tr v-if="'values' in op.classical">
        <th>Values</th>
        <td>
          <chart-list :chart="op.classical.values"></chart-list>
        </td>
      </tr>

      <tr v-if="'n' in op.classical">
        <th>Multi</th>
        <td> [[# op.classical.n #]]</td>
      </tr>
      <tr v-if="'op' in op.classical">
        <th>Operation</th>
        <td> [[# op.classical.op.classical.name #]]</td>
      </tr>
    </table>
  </div>
</template>

<style>
</style>
