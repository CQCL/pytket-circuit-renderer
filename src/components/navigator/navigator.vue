<script>
import { navigator } from './provideKeys'
import { computed } from 'vue'

const MAX_COEFF = 100 // (content takes up at least a 1/100 of the available space)
const MIN_COEFF = 0.02 // (content zooms to at most one 20th)

export default {
  name: 'navigator-controller',
  components: {
  },
  props: {
    navigatorPreviews: { type: Array, default: () => { return [] } },
    extZoomX: { type: Number, default: 1 },
    extZoomY: { type: Number, default: 1 },
    extOffsetX: { type: Number, default: 0 },
    extOffsetY: { type: Number, default: 0 },
    extContentX: { type: Number },
    extContentY: { type: Number },
    options: {
      type: Object,
      default: () => {
        return {
          externalContent: false, // Report independent content size
          externalZooming: true, // Parent handles zooming
          externalScrolling: false, // Parent handles scrolling
          overrideStyle: false // whether to override default display configuration
        }
      }
    }
  },
  emits: ['update:extZoomX', 'update:extZoomY', 'update:extOffsetX', 'update:extOffsetY'],
  provide () {
    return {
      [navigator.styles]: computed(() => this.styles)
    }
  },
  data () {
    return {
      self: { x: undefined, y: undefined },
      previews: { x: undefined, y: undefined },
      internalContent: { x: undefined, y: undefined },
      internalOffset: { x: 0, y: 0 },
      internalZoom: { x: 1, y: 1 },
      scrolling: {
        direction: undefined,
        x: undefined,
        y: undefined
      },
      zooming: {
        direction: undefined,
        position: undefined,
        x: undefined,
        y: undefined
      }
    }
  },
  computed: {
    zoomX: {
      get () {
        if (this.options.externalZooming) {
          return this.extZoomX
        }
        return this.internalZoom.x
      },
      set (newValue) {
        if (this.options.externalZooming) {
          this.$emit('update:extZoomX', newValue)
        }
        this.internalZoom.x = newValue
      }
    },
    zoomY: {
      get () {
        if (this.options.externalZooming) {
          return this.extZoomY
        }
        return this.internalZoom.y
      },
      set (newValue) {
        if (this.options.externalZooming) {
          this.$emit('update:extZoomY', newValue)
        }
        this.internalZoom.y = newValue
      }
    },
    offsetX: {
      get () {
        if (this.options.externalScrolling) {
          return this.extOffsetX
        }
        return this.internalOffset.x
      },
      set (newValue) {
        if (this.options.externalScrolling) {
          this.$emit('update:extOffsetX', newValue)
        }
        this.internalOffset.x = newValue
      }
    },
    offsetY: {
      get () {
        if (this.options.externalScrolling) {
          return this.extOffsetY
        }
        return this.internalOffset.y
      },
      set (newValue) {
        if (this.options.externalScrolling) {
          this.$emit('update:extOffsetY', newValue)
        }
        this.internalOffset.y = newValue
      }
    },
    content () {
      if (this.options.externalContent) {
        return { x: this.extContentX, y: this.extContentY }
      }
      return { x: this.internalContent.x, y: this.internalContent.y }
    },
    coeffs () {
      // Proportion of content we can see.
      return {
        x: this.self.x / (this.content.x * this.zoomX),
        y: this.self.y / (this.content.y * this.zoomY)
      }
    },
    styles () {
      return {
        x: {
          left: `${this.offsetX * 100}%`,
          width: `${Math.min(this.coeffs.x, 1) * 100}%`
        },
        y: {
          top: `${this.offsetY * 100}%`,
          height: `${Math.min(this.coeffs.y, 1) * 100}%`
        },
        xPreview: {
          left: 0,
          height: '100%',
          width: `${100 / Math.max(this.coeffs.x, 1)}%`
        },
        yPreview: {
          top: 0,
          width: '100%',
          height: `${100 / Math.max(this.coeffs.y, 1)}%`
        },
        content: {
          height: this.options.externalContent ? '100%' : 'fit-content',
          width: this.options.externalContent ? '100%' : 'fit-content',
          transform: (
            this.options.externalZooming ? '' : `scale(${this.zoomX}, ${this.zoomY})`
          ) + (
            this.options.externalScrolling ? '' : `translate(-${this.offsetX * (this.content.x * this.zoomX)}px, -${this.offsetY * (this.content.y * this.zoomY)}px)`
          ),
          transformOrigin: 'top left'
        }
      }
    }
  },
  mounted () {
    this.initDimensions()
    window.addEventListener('resize', this.initDimensions)
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.initDimensions)
  },
  methods: {
    initDimensions () {
      this.navigatorPreviews.forEach((preview) => {
        if (preview) {
          const property = preview.direction === 'x' ? 'clientWidth' : 'clientHeight'
          this.previews[preview.direction] = preview.$el[property]
        }
      })
      this.self.x = this.$refs.contentSize?.clientWidth
      this.self.y = this.$refs.contentSize?.clientHeight
      this.internalContent.x = this.$refs.content?.clientWidth
      this.internalContent.y = this.$refs.content?.clientHeight
    },
    startZooming (direction, position, e) {
      this.zooming.x = e.clientX
      this.zooming.y = e.clientY
      this.zooming.direction = direction
      this.zooming.position = position
      document.addEventListener('mouseup', this.stopZooming)
      document.addEventListener('mousemove', this.zoom)
    },
    zoom (e) {
      const mouseOffsets = {
        x: e.clientX,
        y: e.clientY
      }
      const direction = this.zooming.direction
      const zoomKey = direction === 'x' ? 'zoomX' : 'zoomY'
      const diff = (mouseOffsets[direction] - this.zooming[direction]) / this.previews[direction]
      const zoom = this.adjustCoeff(
        this.coeffs[direction] + ((this.zooming.position === 'start' ? -1 : 1) * diff),
        direction,
        true,
        diff
      )

      // Update reference point
      this.zooming.x = mouseOffsets.x
      this.zooming.y = mouseOffsets.y

      // Update the zoom value
      this[zoomKey] = zoom
    },
    wheelZoom (e) {
      // Zoom all directions equally.
      this.incrementZoom(
        this.self.x ? e.deltaY * 0.01 : 0,
        this.self.y ? e.deltaY * 0.01 : 0
      )
    },
    incrementZoom (xDiff, yDiff) {
      this.zoomX = this.adjustCoeff(this.coeffs.x + xDiff, 'x', false)
      this.zoomY = this.adjustCoeff(this.coeffs.y + yDiff, 'y', false)
    },
    resetZoom (direction) {
      const zoomKey = direction === 'x' ? 'zoomX' : 'zoomY'
      this[zoomKey] = this.adjustCoeff(this.self[direction] / this.content[direction], direction, false)
    },
    fitZoom (direction) {
      const zoomKey = direction === 'x' ? 'zoomX' : 'zoomY'
      this[zoomKey] = this.adjustCoeff(1, direction, false)
    },
    stopZooming () {
      document.removeEventListener('mouseup', this.stopZooming)
      document.removeEventListener('mousemove', this.zoom)
    },
    startScrolling (direction, e) {
      this.scrolling.x = e.clientX
      this.scrolling.y = e.clientY
      this.scrolling.direction = direction
      document.addEventListener('mouseup', this.stopScrolling)
      document.addEventListener('mousemove', this.scroll)
    },
    scroll (e) {
      const mouseOffsets = {
        x: e.clientX,
        y: e.clientY
      }

      this.intervalScroll(
        this.scrolling.direction === 'x' ? (mouseOffsets.x - this.scrolling.x) / this.previews.x : 0,
        this.scrolling.direction === 'y' ? (mouseOffsets.y - this.scrolling.y) / this.previews.y : 0
      )

      // Update reference point
      this.scrolling[this.scrolling.direction] = mouseOffsets[this.scrolling.direction]
    },
    wheelScroll (e) {
      const noChange = this.intervalScroll(e.deltaX * 0.001, e.deltaY * 0.001)
      if (!noChange) {
        e.stopPropagation()
        e.preventDefault()
      }
    },
    intervalScroll (xDiff, yDiff) {
      const offsetX = this.adjustOffset(
        Math.max(0, Math.min(this.offsetX + xDiff, 1)),
        'x'
      )
      const offsetY = this.adjustOffset(
        Math.max(0, Math.min(this.offsetY + yDiff, 1)),
        'y'
      )
      if (this.offsetX === offsetX && this.offsetY === offsetY) {
        return true
      }
      this.offsetX = offsetX
      this.offsetY = offsetY
    },
    jumpScroll (direction, e) {
      // Jump the scrollbar to the clicked point.
      const mouseOffsets = {
        x: e.offsetX,
        y: e.offsetY
      }
      const offsetKey = direction === 'x' ? 'offsetX' : 'offsetY'
      this[offsetKey] = this.adjustOffset(mouseOffsets[direction] / this.previews[direction], direction)
    },
    stopScrolling () {
      document.removeEventListener('mouseup', this.stopScrolling)
      document.removeEventListener('mousemove', this.scroll)
    },
    adjustCoeff (newCoeff, direction, zooming, diff) {
      const offsetKey = direction === 'x' ? 'offsetX' : 'offsetY'
      newCoeff = Math.max(MIN_COEFF, Math.min(newCoeff, MAX_COEFF))

      // Adjust display
      if (zooming && this.zooming.position === 'start') {
        this[offsetKey] += diff
      }
      if (newCoeff >= 1) {
        this[offsetKey] = 0
      }

      return (this.self[direction] / newCoeff) / this.content[direction]
    },
    adjustOffset (newOffset, direction) {
      // Can't scroll past end or before start
      const scrollCoeff = Math.min(this.coeffs[direction], 1)
      if (newOffset + scrollCoeff >= 1) {
        newOffset = 1 - scrollCoeff
      }
      newOffset = Math.max(0, newOffset)
      return newOffset
    }
  }
}

</script>

<template>
  <div :class="{ 'navigator-container': !options.overrideStyle }"
       tabindex="0"
       @keydown.up="() => intervalScroll(0,-0.02)"
       @keydown.down="() => intervalScroll(0,0.02)"
       @keydown.left="() => intervalScroll(-0.02,0)"
       @keydown.right="() => intervalScroll(0.02,0)"
       @keydown.+="() => incrementZoom(-0.1,-0.1)"
       @keydown.-="() => incrementZoom(0.1,0.1)"
       @keydown.0.exact="() => resetZoom('x')"
       @keydown.0.ctrl="() => fitZoom('x')"
  >
    <slot>
      <!--  Put previews in here for correct styling.  -->
    </slot>

    <div class="navigator-content" ref="contentSize"
         @wheel.ctrl.prevent.stop="wheelZoom"
         @wheel.exact="wheelScroll"
    >
      <div ref="content" class="no-text-highlighting" :style="styles.content">
        <slot name="content">
          <!--
            Content of the slot can implement methods for
            zooming/scrolling in x and y directions,
            triggered by v-model update events.
          -->
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.navigator-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "..... nav-x"
    "nav-y preview";
  grid-gap: 0.25em;
  padding: 0.25em;
}

.navigator-content {
  grid-area: preview;
  border-radius: 0.25em;
  overflow: hidden;
}

.no-text-highlighting {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
}
</style>
