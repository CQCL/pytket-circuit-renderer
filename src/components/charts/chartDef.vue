<script>
export default {
  name: 'chart-def',
  delimiters: ['[[#', '#]]'],
  props: {
    title: { type: String, default: '' },
    vertical: Boolean,
    hover: Boolean,
    heading: Boolean
  }
}
</script>

<template>
  <div :class="['chart-def-container', {'vertical': vertical, 'hover': hover, 'heading': heading}]">
    <div class="row-item row-item-l text-2">
      [[# title #]]
      <slot name="title"></slot>
    </div>
    <div class="row-item row-item-r text-1">
      <!-- Value -->
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .chart-def-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5em;
    flex-direction: row;
    font-size: 0.9rem;
    border-radius: var(--radius);

    > .row-item-l {
      text-align: left;
      padding-right: 5px;
    }
    > .row-item-r {
      text-align: right;
      padding-left: 5px;
    }

    &.vertical {
      flex-direction: column;
      align-items: stretch;
      > .row-item-l {
        padding-right: 0;
        padding-bottom: 0.25em;
      }
      > .row-item-r {
        text-align: center;
        padding-left: 0;
        padding-top: 0.25em;
      }
    }
    &.hover:nth-child(2n) {
      background: var(--paper);
    }
    &.heading {
      font-size: 1rem;
      &.vertical > .row-item-r {
        font-size: 0.9rem;
      }
    }
  }
</style>
