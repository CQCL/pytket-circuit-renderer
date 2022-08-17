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
}
.nested-label-layer:deep() .wire-label{
    padding: var(--box-margin) 0;
    height: var(--block-height);
    margin: auto;
}
.nested-label-layer.as-height{
    padding: 0;
}
</style>
