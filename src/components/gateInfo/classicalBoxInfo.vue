<script>
import { chartList, chartDef } from '@/components/charts/init'
import { formatClassicalExp } from '@/components/circuitDisplay/utils'

export default {
  name: 'classical-box-info',
  components: {
    chartList,
    chartDef
  },
  props: {
    op: { type: Object, required: true }
  },
  computed: {
    opType () {
      return this.op.type
    },
    classicalTable () {
      const classical = (this.op && 'classical' in this.op) ? this.op.classical : this.op.box
      // Collate the options to be displayed as a simple table
      if (classical) {
        return {
          ...('name' in classical && { Name: classical.name }),
          ...('n_i' in classical && { 'Input bits': classical.n_i }),
          ...('n_io' in classical && { 'Input/Output bits': classical.n_io }),
          ...('n_o' in classical && { 'Output bits': classical.n_o }),
          ...('upper' in classical && { Upper: classical.upper }),
          ...('lower' in classical && { Lower: classical.lower }),
          ...('n' in classical && { Multi: classical.n }),
          ...('op' in classical && { Operation: classical.op.classical.name })
        }
      }
      return {}
    },
    hasClassicalTable () {
      return Object.values(this.classicalTable).reduce((prev, next) => prev || (typeof next !== 'undefined'), false)
    }
  },
  methods: {
    formatClassicalExp
  }
}
</script>

<template>
  <chart-def v-if="opType === 'ClassicalExpBox'" title="Expression" vertical hover>
    [[# formatClassicalExp(op.box.exp) #]]
  </chart-def>

  <div v-if="hasClassicalTable">
    <chart-def v-for="key in Object.keys(classicalTable)" :key="key" :title="key" hover>
      [[# classicalTable[key] #]]
    </chart-def>
  </div>

  <chart-def v-if="'classical' in op && 'values' in op.classical" title="Values" hover>
    <chart-list :chart="op.classical.values"></chart-list>
  </chart-def>
</template>

<style>
</style>
