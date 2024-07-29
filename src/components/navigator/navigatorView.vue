<script>
import navigatorViewInner from './navigatorViewInner'

export default {
  name: 'navigator-view',
  components: {navigatorViewInner},
  props: {
    active: {type: Boolean, default: false},
    // Optionally override the content dimensions
    extContentX: { type: Number, default: undefined },
    extContentY: { type: Number, default: undefined },
    // Optional, if the styling is to be implemented by the parent.
    getStyle: { type: Function, default: undefined },
  },
  // emits: ['update:display'],
}
</script>

<template>
  <navigator-view-inner v-if="active"
      :ext-content-x="extContentX"
      :ext-content-y="extContentY"
      :get-style="getStyle"
      v-bind="$attrs"
  >
    <slot></slot>
  </navigator-view-inner>

  <slot v-else v-bind="$attrs" style="{width: 100%; height: 100%}"></slot>
</template>

<style scoped lang="scss">
</style>
