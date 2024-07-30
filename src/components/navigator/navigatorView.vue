<script>
import navigatorViewInner from './navigatorViewInner'

export default {
  name: 'navigator-view',
  components: {navigatorViewInner},
  props: {
    active: {type: Boolean, default: true},
    // Optionally override the content dimensions
    extContentX: { type: Number, default: undefined },
    extContentY: { type: Number, default: undefined },
    // Optional, if the styling is to be implemented by the parent.
    getStyle: { type: Function, default: undefined },
  },
  emits: [
    'update:display',
    'update:self-x',
    'update:self-y',
    'update:content-x',
    'update:content-y'
  ]
}
</script>

<template>
  <navigator-view-inner v-if="active"
      :ext-content-x="extContentX"
      :ext-content-y="extContentY"
      :get-style="getStyle"
      v-bind="$attrs"
      @update:display="(...params) => $emit('update:display', ...params)"
      @update:content-x="(...params) => $emit('update:content-x', ...params)"
      @update:content-y="(...params) => $emit('update:content-y', ...params)"
      @update:self-x="(...params) => $emit('update:self-x', ...params)"
      @update:self-y="(...params) => $emit('update:self-y', ...params)"
  >
    <slot></slot>
  </navigator-view-inner>

  <slot v-else v-bind="$attrs" style="{width: 100%; height: 100%}"></slot>
</template>

<style scoped lang="scss">
</style>
