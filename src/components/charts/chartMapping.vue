<script>
export default {
  name: 'chart-mapping',
  delimiters: ['[[#', '#]]'],
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
      [[# coerceMaps[coerceFrom](entry[0]) #]] → [[# coerceMaps[coerceTo](entry[1]) #]]
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
    }
  }
  .mapping-item {
    display: flex;
    flex-wrap: nowrap;
  }
</style>
