<script>
export default {
  name: 'chart-list',
  delimiters: ['[[#', '#]]'],
  props: {
    chart: { type: Array, required: true },
    title: { type: String, default: '' },
    displayTitle: { type: Boolean, default: true }
  }
}
</script>

<template>
  <div>
    <div v-if="displayTitle" class="row-sub-heading">[[# title #]]</div>
    <div class="chart-list-container">
      <div v-for="(entry, i) in chart" :key="i"  class="chart-list-item complex-number">[[# entry #]]</div>
    </div>
  </div>
</template>
