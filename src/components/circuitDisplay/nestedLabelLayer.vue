<script>
import { formatPosStr } from './utils'

export default {
  name: 'nested-label-layer',
  props: {
    args: { type: Array, default: () => [] }
  },
  computed: {
    posStrs () {
      return this.args.map(arg => arg.pos !== -1 ? this.formatPosStr(arg.pos) : '')
    }
  },
  methods: {
    formatPosStr
  }
}
</script>

<template>
    <div class="nested-label-layer">
        <slot>
            <div v-for="(posStr, i) in posStrs" :key="i" class="wire-label">
                [[# posStr #]]
            </div>
        </slot>
    </div>
</template>

<style scoped>
.nested-label-layer{
    background: var(--box-col);
    padding: 0 0.4em;
    flex-shrink: 0;
}
.nested-label-layer:deep() .wire-label{
    padding: calc(var(--box-margin) + var(--box-padding)) 0;
    height: var(--block-height);
    margin: auto;
}
.nested-label-layer.as-height{
    padding: 0;
}
</style>
