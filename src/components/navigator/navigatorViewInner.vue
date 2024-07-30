<script>
import { navigator } from './provideKeys'
import { getScroll, getCoeff, initSelf } from './utils'

export default {
  name: 'navigator-view-inner',
  props: {
    // Optionally override the content dimentions
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
  ],
  inject: {
    offset: { from: navigator.offset },
    zoom: { from: navigator.zoom },
  },
  data () {
    return {
      self: { x: undefined, y: undefined },
      internalContent: { x: undefined, y: undefined },
    }
  },
  computed: {
    content () {
      return {
        x: this.extContentX ?? this.internalContent.x,
        y: this.extContentY ?? this.internalContent.y,
      }
    },
    coeff () {
      return {
        x: this.getCoeff('x'),
        y: this.getCoeff('y')
      }
    },
    scroll () {
      return {
        x: this.getScroll('x'),
        y: this.getScroll('y')
      }
    },
    contentStyle () {
      if (this.getStyle) {
        return this.getStyle({
          zoom: this.zoom,
          scroll: this.scroll
        })
      }
      return {
        width: this.extContentX ? '100%' : 'fit-content',
        height: this.extContentY ? '100%' : 'fit-content',
        transform: `scale(${this.zoom.x}, ${this.zoom.y})`
         + `translate(-${this.offset.x * (this.content.x * this.zoom.x)}px, -${this.offset.y * (this.content.y * this.zoom.y)}px)`,
        transformOrigin: 'top left'
      }
    }
  },
  mounted () {
    this.$nextTick( () => this.initDimensions())
    window.addEventListener('resize', this.initDimensions)
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.initDimensions)
  },
  watch: {
    scroll () {
      this.$emit('update:display')
    },
    zoom () {
      this.$emit('update:display')
    },
    'self.x' (newVal) {
      this.$emit('update:self-x', newVal)
    },
    'self.y' (newVal) {
      this.$emit('update:self-y', newVal)
    },
    'content.x' (newVal) {
      this.$emit('update:content-x', newVal)
    },
    'content.y' (newVal) {
      this.$emit('update:content-y', newVal)
    },
  },
  methods: {
    initDimensions () {
      this.initSelf()
      this.internalContent.x = this.$refs.content?.clientWidth
      this.internalContent.y = this.$refs.content?.clientHeight
    },
    getScroll,
    getCoeff,
    initSelf,
  }
}
</script>

<template>
  <div ref="contentSelf"
       style="overflow: hidden; width: 100%; height: 100%;"
  >
    <div ref="content" style="width:fit-content; height: fit-content" :style="contentStyle">
      <slot :onContentUpdate="initDimensions">
        <!--
          Content of the slot can implement methods for
          zooming/scrolling in x and y directions,
          triggered by v-model update events.

          Call onContentUpdate if the content size changes,
          and the content size is not externally controlled.
        -->
      </slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
