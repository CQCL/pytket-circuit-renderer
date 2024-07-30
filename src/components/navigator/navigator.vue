<script>
import { navigator } from './provideKeys'
import { computed } from 'vue'
import { getCoeff, initSelf } from './utils'

const MAX_COEFF = 100 // (content takes up at least a 1/100 of the available space)
const MIN_COEFF = 0.02 // (content zooms to at most one 20th)

/*
Some defs:
 offset: A number in the range [0, 1]. The thumb-width independent proportion of the content scrolled.
 scroll: A number in the range [0, 1]. The distance from the start of the track at which the scrollbar
         thumb is to be displayed, as a proportion of the track size. Takes into account the width of the scrollbar-thumb.
         Equivalently, the offset for the displayed content (accounting for the currently visible content)
 zoom: The zooming factor to be applied to the content.
 coeff: A number in the range [MIN_COEFF, MAX_COEFF]. The proportion of the viewport taken up by the zoomed content.
 self: The unscaled size (in px) of the viewport.
 content: The unscaled size (in px) of the content to be displayed.
 preview: The size (in px) of the scrollbar tracks.

 zoom = self / (content * coeff)
 scroll = offset * (1 - Min(coeff, 1))

 The state of the navigator is tracked by (offset, coeff), from which zoom and scroll values are derived.
*/

export default {
  name: 'navigator-controller',
  props: {
    nViews: { type: Number, default: 1 },
    keepAspectRatio: { type: Boolean, default: true},
    overrideStyle: { type: Boolean, default: false},
    viewFormat: { validator (value) { return ['row', 'column'].includes(value) }, default: 'row'}
  },
  provide () {
    return {
      [navigator.offset]: computed(() => this.offset),
      [navigator.coeff]: computed(() => this.coeff),
      [navigator.zoom]: computed(() => this.zoom),
    }
  },
  data () {
    return {
      previews: { x: undefined, y: undefined },
      views: { x: [], y: [] },
      contents: { x: [], y: [] },
      offset: { x: 0, y: 0 },
      zoom: { x: 1, y: 1 },
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
    content () {
      if (this.nViews > 0) {
        return {
          x: Math.max(...this.contents.x.slice(0, this.nViews), 1),
          y: Math.max(...this.contents.y.slice(0, this.nViews), 1),
        }
      }
      return {x: undefined, y: undefined}
    },
    self () {
      if (this.nViews > 0) return { x: this.views.x[0], y: this.views.y[0] }
      return {x: undefined, y: undefined}
    },
    previewLen () {
      // The max offset (px) of the preview bar.
      return {
        x: this.previews.x * (1 - Math.min(this.coeff.x, 1)),
        y: this.previews.y * (1 - Math.min(this.coeff.y, 1)),
      }
    },
    coeff () {
      return {
        x: this.getCoeff('x'),
        y: this.getCoeff('y')
      }
    }
  },
  methods: {
    getCoeff,
    updatePreview (val, direction) {
      this.previews[direction] = val
    },
    updateList (key, val, direction, index) {
      while (this[key][direction].length < this.nViews) {
        this[key][direction].push(0)
      }
      this[key][direction][index] = val
    },
    handleAction ({type, args}) {
      switch (type) {
        case 'scroll':
          this.startScrolling(...args)
          break
        case 'zoom':
          this.startZooming(...args)
          break
        case 'resetZoom':
          this.resetZoom(...args)
          break
        case 'fitZoom':
          this.fitZoom(...args)
          break
        case 'jumpScroll':
          this.jumpScroll(...args)
          break
        default:
          break
      }
    },
    startZooming (direction, position, e) {
      this.zooming.x = e.clientX
      this.zooming.y = e.clientY
      this.zooming.direction = direction
      this.zooming.position = position
      document.addEventListener('mouseup', this.stopZooming)
      document.addEventListener('mousemove', this.zoomFn)
    },
    zoomFn (e) {
      const mouseOffsets = {
        x: e.clientX,
        y: e.clientY
      }
      const direction = this.zooming.direction
      const diff = (mouseOffsets[direction] - this.zooming[direction]) / this.previews[direction]

      // Update reference point
      this.zooming.x = mouseOffsets.x
      this.zooming.y = mouseOffsets.y

      // Update the zoom value
      this.updateZoom(
        this.adjustZoom(
          this.coeff[direction] + ((this.zooming.position === 'start' ? -1 : 1) * diff),
          direction,
          true,
          diff
        ),
        direction
      )
    },
    wheelZoom (e) {
      // Zoom all directions equally.
      this.incrementZoom(
        this.self.x ? e.deltaY * 0.01 : 0,
        this.self.y ? e.deltaY * 0.01 : 0
      )
    },
    incrementZoom (xDiff, yDiff) {
      this.updateZoom(this.adjustZoom(this.coeff.x + xDiff, 'x', false), 'x')
      this.updateZoom(this.adjustZoom(this.coeff.y + yDiff, 'y', false), 'y')
    },
    resetZoom (direction) {
      this.updateZoom(1, direction)
    },
    fitZoom (direction) {
      this.updateZoom(this.adjustZoom(1, direction, false), direction)
    },
    stopZooming () {
      document.removeEventListener('mouseup', this.stopZooming)
      document.removeEventListener('mousemove', this.zoomFn)
    },
    startScrolling (direction, e) {
      this.scrolling.x = e.clientX
      this.scrolling.y = e.clientY
      this.scrolling.direction = direction
      document.addEventListener('mouseup', this.stopScrolling)
      document.addEventListener('mousemove', this.scrollFn)
    },
    scrollFn (e) {
      const mouseOffsets = {
        x: e.clientX,
        y: e.clientY
      }

      this.intervalScroll(
        this.scrolling.direction === 'x' ? (mouseOffsets.x - this.scrolling.x) / this.previewLen.x : 0,
        this.scrolling.direction === 'y' ? (mouseOffsets.y - this.scrolling.y) / this.previewLen.y : 0
      )

      // Update reference point
      this.scrolling[this.scrolling.direction] = mouseOffsets[this.scrolling.direction]
    },
    wheelScroll (e) {
      const noChange = this.intervalScroll(
          this.previewLen.x !== 0 ? e.deltaX * 0.001 : 0,
          this.previewLen.y !== 0 ? e.deltaY * 0.01 : 0,
      )
      if (!noChange) {
        e.stopPropagation()
        e.preventDefault()
      }
    },
    intervalScroll (xDiff, yDiff) {
      const offsetX = this.adjustOffset(
        Math.max(0, Math.min(this.offset.x + xDiff, 1)),
      )
      const offsetY = this.adjustOffset(
        Math.max(0, Math.min(this.offset.y + yDiff, 1)),
      )
      if (this.offset.x === offsetX && this.offset.y === offsetY) {
        return true
      }
      this.offset.x = offsetX
      this.offset.y = offsetY
    },
    jumpScroll (direction, e) {
      // Jump the scrollbar to the clicked point.
      const mouseOffsets = {
        x: e.offsetX,
        y: e.offsetY
      }
      const thumbAdjust = (this.previews[direction] - this.previewLen[direction]) / 2
      this.offset[direction] = this.adjustOffset(
          Math.max(
            0,
            Math.min(
              (mouseOffsets[direction] - thumbAdjust) / this.previewLen[direction],
              1
            )
          )
      )
    },
    stopScrolling () {
      document.removeEventListener('mouseup', this.stopScrolling)
      document.removeEventListener('mousemove', this.scrollFn)
    },
    adjustZoom (newCoeff, direction, zooming, diff) {
      newCoeff = Math.max(MIN_COEFF, Math.min(newCoeff, MAX_COEFF))

      // Adjust display
      if (zooming && this.zooming.position === 'start') {
        // Dragging the starting point to adjust the zoom level.
        this.offset[direction] += diff
      }
      if (newCoeff >= 1) {
        // Entire content is visible
        this.offset[direction] = 0
      }
      const newZoom = this.self[direction] / (this.content[direction] * newCoeff)
      return newZoom
    },
    updateZoom (newZoom, direction) {
      if (this.keepAspectRatio) {
        this.zoom.x = newZoom
        this.zoom.y = newZoom
      } else {
        this.zoom[direction] = newZoom
      }
    },
    adjustOffset (newOffset) {
      // Offset capped to [0, 1]
      newOffset = Math.max(0, Math.min(newOffset, 1))
      return newOffset
    }
  }
}

</script>

<template>
  <div :class="{ 'navigator-container': !overrideStyle }"
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
    <slot name="menus"
          :updateX="(x) => updatePreview(x, 'x')"
          :updateY="(y) => updatePreview(y, 'y')"
          :onAction="handleAction"
    >
      <!--  Put previews in here for correct styling.  -->
    </slot>

    <div class="navigator-content"
         @wheel.ctrl.prevent.stop="wheelZoom"
         @wheel.exact="wheelScroll"
    >
      <div class="no-text-highlighting navigator-views" :style="{'flex-direction': viewFormat}">
        <slot name="content"
              :updateContent="(...props) => updateList('contents', ...props)"
              :updateView="(...props) => updateList('views', ...props)"
        >
          <!-- Expect navigator-view elements here -->
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

.navigator-views {
  display: flex;
  justify-content: space-between;
  gap: 0.5em;
  width: 100%;
  height: 100%;
  --temp-bg: var(--circuit-background);
  --temp-bg-dark: var(--circuit-background-dark);

  & > :nth-child(n) {
    border-radius: var(--radius);
    overflow: hidden;
  }

  & > :nth-child(2n) {
    --circuit-background-dark: var(--temp-bg);
    --circuit-background: var(--temp-bg-dark);
    background: var(--paper);
  }
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
