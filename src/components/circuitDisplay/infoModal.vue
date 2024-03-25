<script>

export default {
  name: 'info-modal',
  props: {
    modelValue: { type: Boolean, required: true }
  },
  emits: ['update:modelValue'],
  data () {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      modalWidth: 200,
      modalHeight: 200
    }
  },
  computed: {
    modalStyle () {
      return {
        'max-height': `calc(${this.height}px - 5%)`,
        'max-width': `calc(${this.width}px - 5%)`,
        left: `calc(50% - ${this.modalWidth / 2}px)`,
        top: `calc(50% - ${this.modalHeight / 2}px)`
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
      // Init tracking the current size of the modal
      this.modalWidth = this.$refs.modal.clientWidth
      this.modalHeight = this.$refs.modal.clientHeight
    })
  },
  updated () {
    this.onResize()
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    closeModal () {
      this.$emit('update:modelValue', false)
    },
    onResize () {
      this.height = window.innerHeight
      this.width = window.innerWidth
      this.modalWidth = this.$refs.modal.clientWidth
      this.modalHeight = this.$refs.modal.clientHeight
    }
  }
}
</script>

<template>
  <div>
    <div v-show="modelValue" class="info-modal">
      <div class="info-modal-backdrop" @click="closeModal"></div>
      <div class="info-modal-container" :style="{...modalStyle}" ref="modal" @wheel.stop>
        <div class="row row-heading" style="margin: 0; padding: 1em"><slot name="title"></slot></div>
        <div class="modal-content" style="overflow:auto"><slot name="content"></slot></div>
        <slot name="buttons">
          <div style="border: none; display: flex; padding: 1em">
            <button class="row-item button" role="button" data-cy-tooltip="close" @click="closeModal">Close</button>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/themeVariables.scss";

.info-modal {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-inddex: 1;
}
.info-modal-backdrop{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000000;
    opacity: 0.1;
    z-index: 999999;
}
.info-modal-container{
    position: absolute;
    text-align: left;
    bottom: 10%;
    right: 10%;
    width: fit-content;
    height: fit-content;
    overflow: auto;
    padding:0;
    border-radius: 5px;
    border: 1px solid var(--divider);
    box-shadow: 0px 5px 20px -10px #000000;
    background: var(--background);
    color: var(--text-secondary);
    z-index: 1000000;
}

.close-modal-btn{
    position: absolute;
    top: 20px;
    right: 20px;
    font-weight: bold;
    font-size: 0.75em;
    z-index: 1;
    cursor: pointer;
}
.modal-title{
    margin: 0;
    padding-top: 0;
    color: var(--text-primary);
}
.modal-content{
  padding: 0.5em 1em;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--divider);
}
</style>
