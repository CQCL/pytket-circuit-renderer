<script>
export default {
  name: "nested-label-layer",
  components: {
  },
  props: {
    args: {type: Array, default: () => []},
  }
}
</script>

<template>
    <div class="nested-label-layer">
        <slot>
            <div v-for="(arg, i) in args" :key="i" class="wire-label">
                [[#arg.pos !== -1 ? arg.pos : '' #]]
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
}
.nested-label-layer.as-height{
    padding: 0;
}
</style>
