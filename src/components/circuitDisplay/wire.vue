<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'wire',
  delimiters: ['[[#', '#]]'],
  props: {
    classical: { type: Boolean, default: true },
    condensed: { type: Boolean, default: false }
  }
}
</script>

<template>
  <div class="wire" :class="{classical: classical, condensed: condensed}"></div>
</template>

<style>
</style>
