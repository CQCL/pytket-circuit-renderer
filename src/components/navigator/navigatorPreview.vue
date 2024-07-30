<script>
import { navigator } from './provideKeys'
import { getScroll, initSelf } from './utils'

export default {
  name: 'navigator-preview',
  components: {
  },
  props: {
    direction: { type: String, required: true, validator: (val) => val === 'x' || val === 'y' },
    fitZoom: { type: Boolean, default: false },
    resetZoom: { type: Boolean, default: false }
  },
  inject: {
    offset: { from: navigator.offset },
    coeff: { from: navigator.coeff },
    zoom: { from: navigator.zoom }
  },
  emits: ['update:preview-x', 'update:preview-y', 'action'],
  data () {
    return {
      scrolling: false,
      zooming: false,
      self: {
        x: undefined,
        y: undefined
      }
    }
  },
  computed: {
    len () {
      return Math.min(this.coeff[this.direction], 1)
    },
    scroll () {
      return this.getScroll([this.direction])
    },
    scrollbarThumbStyle () {
      const len = this.len * 100
      const start = this.scroll * 100
      return this.direction === 'x'
        ? { left: start + '%', width: len + '%' }
        : { top: start + '%', height: len + '%' }
    }
  },
  mounted () {
    window.addEventListener('resize', this.initSelf)
    this.$nextTick(() => this.initSelf())
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.initSelf)
  },
  methods: {
    startZooming (position, e) {
      this.$emit('action', { type: 'zoom', args: [this.direction, position, e] })
      this.zooming = true
      document.addEventListener('mouseup', () => {
        this.zooming = false
      })
    },
    startScrolling (e) {
      if (this.len < 1) {
        // Only allow scrolling when content isn't taking up the whole space.
        this.$emit('action', { type: 'scroll', args: [this.direction, e] })
        this.scrolling = true
        document.addEventListener('mouseup', () => {
          this.scrolling = false
        })
      }
    },
    getScroll,
    initSelf
  },
  watch: {
    'self.x' (newVal) {
      this.$emit('update:preview-x', newVal)
    },
    'self.y' (newVal) {
      this.$emit('update:preview-y', newVal)
    }
  }
}

</script>

<template>
  <div :class="['navigator-preview-block-'+direction]" style="display:flex">
    <div :class="['navigator-preview', 'navigator-preview-'+direction]" :ref="'contentSelf'">
      <div :class="['navigator-controller', 'nav-'+direction, { 'scrolling': scrolling }]"
           :style="scrollbarThumbStyle"
           @mousedown="startScrolling"
           @dblclick="() => $emit('action', {type: 'resetZoom', args: [direction]})"
      >
        <div :class="['zoom-controller start nav-'+direction]"
             @mousedown.stop.prevent="e => startZooming('start', e)"
        ></div>
        <div :class="['zoom-controller end nav-'+direction]"
             @mousedown.stop.prevent="e => startZooming('end', e)"
        ></div>
      </div>

      <div :class="['navigator-background nav-'+direction]"
           @click="e => $emit('action', {type: 'jumpScroll', args: [direction, e]})">
        <slot></slot>
      </div>
    </div>
    <div v-if="fitZoom" class="icon zoom-control-icon"
         :class="{'active': coeff[direction] === 1}"
         @click="() => $emit('action', {type: 'fitZoom', args: [direction]})"
         data-cy="fitZoom"
         title="Fit content to viewport"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-zoom-fit" viewBox="0 0 16 16">
        <path d="M7.79645 3.94645C7.99171 3.75118 8.30829 3.75118 8.50355 3.94645L10.7036 6.14645C10.7973 6.24021 10.85 6.36739 10.85 6.5C10.85 6.63261 10.7973 6.75979 10.7036 6.85355L8.50355 9.05355C8.30829 9.24882 7.99171 9.24882 7.79645 9.05355C7.60118 8.85829 7.60118 8.54171 7.79645 8.34645L9.64289 6.5L7.79645 4.65355C7.60118 4.45829 7.60118 4.14171 7.79645 3.94645Z"/>
        <path d="M5.20355 4.65355C5.39882 4.45829 5.39882 4.14171 5.20355 3.94645C5.00829 3.75118 4.69171 3.75118 4.49645 3.94645L2.29645 6.14645C2.10118 6.34171 2.10118 6.65829 2.29645 6.85355L4.49645 9.05355C4.69171 9.24882 5.00829 9.24882 5.20355 9.05355C5.39882 8.85829 5.39882 8.54171 5.20355 8.34645L3.35711 6.5L5.20355 4.65355Z"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M13 6.5C13 7.9382 12.5329 9.2673 11.7422 10.3439C11.7822 10.3734 11.8204 10.4062 11.8566 10.4424L15.7071 14.2929C16.0976 14.6834 16.0976 15.3166 15.7071 15.7071C15.3166 16.0976 14.6834 16.0976 14.2929 15.7071L10.4424 11.8566C10.4062 11.8204 10.3734 11.7822 10.3439 11.7422L10.3448 11.7415C9.26801 12.5327 7.93858 13 6.5 13C2.91015 13 0 10.0899 0 6.5C0 2.91015 2.91015 0 6.5 0C10.0899 0 13 2.91015 13 6.5ZM6.5 12C9.53757 12 12 9.53757 12 6.5C12 3.46243 9.53757 1 6.5 1C3.46243 1 1 3.46243 1 6.5C1 9.53757 3.46243 12 6.5 12Z"/>
      </svg>
    </div>
    <div v-if="resetZoom" class="icon zoom-control-icon"
         :class="{'active': zoom[direction] === 1}"
         @click="() => $emit('action', {type: 'resetZoom', args: [direction]})"
         data-cy="resetZoom"
         title="Reset zoom to 100%"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-zoom-reset" viewBox="0 0 16 16">
        <path d="M10.3282 2.92184C8.21396 0.807621 4.78614 0.807622 2.67193 2.92184L3.79452 4.04443C3.9568 4.20671 3.85617 4.48463 3.62762 4.50541L0.315731 4.80649C0.14738 4.8218 0.00634227 4.68076 0.0216471 4.51241L0.322728 1.20052C0.343506 0.971963 0.62143 0.871341 0.783712 1.03362L1.9063 2.15621C4.44336 -0.380847 8.55674 -0.380847 11.0938 2.15621C13.3467 4.40915 13.599 7.90512 11.8507 10.4365C11.8527 10.4384 11.8547 10.4404 11.8567 10.4424L15.7072 14.2929C16.0977 14.6834 16.0977 15.3166 15.7072 15.7071C15.3167 16.0976 14.6835 16.0976 14.293 15.7071L10.4752 11.8893C7.92687 13.8654 4.24617 13.6836 1.9063 11.3437C1.22298 10.6604 0.722968 9.86149 0.407503 9.00932C0.303703 8.72892 0.446864 8.41747 0.727263 8.31366C1.00766 8.20986 1.31912 8.35303 1.42292 8.63342C1.68528 9.34216 2.1012 10.0074 2.67193 10.5781C4.78614 12.6923 8.21396 12.6923 10.3282 10.5781C12.4424 8.46387 12.4424 5.03605 10.3282 2.92184Z"/>
      </svg>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/themeVariables.scss";

.navigator-preview-block-x {
  grid-area: nav-x;
  display: flex;
  flex-direction: row;
}
.navigator-preview-block-y {
  grid-area: nav-y;
  display: flex;
  flex-direction: column;
}
.navigator-preview-block-x .zoom-control-icon {
  margin-left: 0.25em;
}
.navigator-preview-block-y .zoom-control-icon {
  margin-top: 0.25em;
}
.navigator-preview-x,
.navigator-preview-y {
  position: relative;
  flex-grow: 1;
  border-radius: 0.25em;
  overflow: hidden;
}
.navigator-preview {
  min-height: 2em;
  min-width: 2em;
}

.navigator-background {
  width: 100%;
  height: 100%;
}

.navigator-controller {
  position: absolute;
  background: var(--paper);
  cursor: grab;
  border-radius: 0.25em;
  overflow: hidden;
}
.navigator-controller.nav-x {
  top: 0;
  bottom: 0;
  min-width: 1.5em;
}
.navigator-controller.nav-y {
  left: 0;
  right: 0;
  min-height: 1.5em;
}
.navigator-controller.scrolling {
  cursor: grabbing;
}

.zoom-controller {
  background: var(--paper-dark);
  opacity: 1;
  position: absolute;
}
.zoom-controller.nav-x{
  width: 0.5em;
  height: 100%;
  cursor: col-resize;
  top: 0;
}
.zoom-controller.nav-x.start{
  left: 0;
}
.zoom-controller.nav-x.end{
  right: 0;
}
.zoom-controller.nav-y{
  height: 0.5em;
  width: 100%;
  cursor: row-resize;
  left: 0;
}
.zoom-controller.nav-y.start{
  top: 0;
}
.zoom-controller.nav-y.end{
  bottom: 0;
}
</style>
