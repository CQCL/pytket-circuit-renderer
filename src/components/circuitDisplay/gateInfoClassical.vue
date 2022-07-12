<script>
import { chartList } from '@/components/charts/init'
import { formatClassicalExp } from './utils'

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
    formatClassicalExp: formatClassicalExp,
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
