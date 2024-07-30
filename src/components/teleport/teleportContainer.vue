<script>
export default {
  name: 'teleport-container',
  props: {
    names: { type: Object, required: true } // of the form {teleportName: teleportToComponent}
  },
  methods: {
    registerTeleport (register, name, child) {
      if (name in this.names) {
        if (register) {
          this.names[name].registerChild(child)
        } else {
          this.names[name].removeChild(child)
        }
      }
    }
  }
}
</script>

<template>
  <slot></slot>
</template>
