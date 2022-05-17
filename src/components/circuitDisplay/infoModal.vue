<script>

export default {
  name: "info-modal",
  props: {
    modelValue: {type: Boolean, required: true},
  },
  emits: ["update:modelValue"],
  data() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      modalWidth: 200,
      modalHeight: 200,
      styles: {
        infoModal: {
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
        infoModalContainer: {
          position: "absolute",
          overflow: "auto",
          padding: "0 20px 20px",
          borderRadius: "5px",
          boxShadow: "0px 5px 20px -10px black",
          background: "var(--main-bg, #fff)",
        },
        infoModalBackdrop: {
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: "black",
          opacity: 0.1,
        }
      }
    };
  },
  computed: {
    modalStyle() {
      return {
        "max-height": (this.height - 80) + "px",
        "max-width": (this.width - 80) + "px",
        left: `calc(50% - ${this.modalWidth / 2}px)`,
        top: `calc(50% - ${this.modalHeight / 2}px)`,
      };
    }
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
      // Init tracking the current size of the modal
      this.modalWidth = this.$refs.modal.clientWidth;
      this.modalHeight = this.$refs.modal.clientHeight;
    })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    closeModal() {
      this.$emit("update:modelValue", false);
    },
    onResize() {
      this.height = window.innerHeight;
      this.width = window.innerWidth;
      this.modalWidth = this.$refs.modal.clientWidth;
      this.modalHeight = this.$refs.modal.clientHeight;
    }
  }
}
</script>

<template>
  <div>
    <div v-show="modelValue" class="info-modal" :style="{zIndex: 1, ...styles.infoModal}">
      <div class="info-modal-backdrop" @click="closeModal" :style="styles.infoModalBackdrop"></div>
      <div class="info-modal-container" :style="{...modalStyle, ...styles.infoModalContainer}" ref="modal">
        <div class="row row-heading"><slot name="title"></slot></div>
        <div class="row paras" style="overflow:auto"><slot name="content"></slot></div>
        <slot name="buttons">
          <div class="row" style="border: none; display: flex">
            <button class="row-item button" role="button" @click="closeModal">Close</button>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>