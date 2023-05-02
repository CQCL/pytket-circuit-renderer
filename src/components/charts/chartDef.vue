<script>
export default {
  name: 'chart-def',
  delimiters: ['[[#', '#]]'],
  props: {
    title: { type: String, required: true },
    vertical: Boolean,
    hover: Boolean
  }
}
</script>

<template>
  <div :class="['chart-def-container', {'vertical': vertical, 'hover': hover}]">
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
    &.hover:hover {
      background: var(--paper);
    }
  }
</style>
