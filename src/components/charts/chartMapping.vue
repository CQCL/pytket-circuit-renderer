<script>
import ChartMatrix from '@/components/charts/chartMatrix'

export default {
  name: 'chart-mapping',
  delimiters: ['[[#', '#]]'],
  components: {
    ChartMatrix
  },
  props: {
    mapping: { type: Array, required: true },
    coerceFrom: { default: false },
    coerceTo: { default: false },
    vertical: { type: Boolean, default: false }
  },
  data () {
    return {
      coerceMaps: {
        [false]: x => x,
        register: (reg) => `${reg[0]}[${reg[1].join(',')}]`,
        bool: (x) => x ? '1' : '0',
        boolList: (xs) => xs.map(x => x ? 1 : 0)
      }
    }
  }
}
</script>

<template>
  <div class="chart-list-container mapping-container" :class="{'vertical': vertical}">
    <div v-for="(entry, i) in mapping" :key="i" class="mapping-item complex-number">
      <chart-matrix v-if="coerceFrom === 'state'" :matrix="entry[0]" entry-type="boolStr" :depth="1" :displayTitle="false"></chart-matrix>
      <span v-else>[[# coerceMaps[coerceFrom](entry[0]) #]]</span>
      <span :style="{padding: '0 0.5em'}">→</span>
      <chart-matrix v-if="coerceTo === 'state'" :matrix="entry[1]" entry-type="boolStr" :depth="1" :displayTitle="false"></chart-matrix>
      <span v-else>[[# coerceMaps[coerceTo](entry[1]) #]]</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .mapping-container {
    display: flex;
    flex-wrap:wrap;
    justify-content: end;

    &.vertical {
      flex-direction: column;

      & .complex-number {
        border-left: none;
        padding-bottom: 0.5em;
      }
    }
  }
  .mapping-item {
    display: flex;
    flex-wrap: nowrap;
  }
</style>
