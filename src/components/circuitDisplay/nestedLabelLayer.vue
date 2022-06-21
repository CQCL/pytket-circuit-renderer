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
</style>
