<script>
import { navigator } from './provideKeys'

export default {
  name: 'navigator-preview',
  components: {
  },
  props: {
    direction: { type: String, required: true }, // 'x' | 'y'
    fitZoom: { type: Boolean, default: false },
    controller: { type: Object, required: true } // Ref to navigator controller
  },
  inject: {
    styles: { from: navigator.styles }
  },
  data () {
    return {
      scrolling: false,
      zooming: false
    }
  },
  methods: {
    startZooming (position, e) {
      this.zooming = true
      this.controller.startZooming(this.direction, position, e)
      document.addEventListener('mouseup', () => { this.zooming = false })
    },
    startScrolling (e) {
      this.scrolling = true
      this.controller.startScrolling(this.direction, e)
      document.addEventListener('mouseup', () => { this.scrolling = false })
    }
  }
}

</script>

<template>
  <div :class="['navigator-preview-block-'+direction]" style="display:flex">
    <div :class="['navigator-preview', 'navigator-preview-'+direction]" :ref="'preview'">
      <div :class="['navigator-controller', 'nav-'+direction, { 'scrolling': scrolling }]"
           :style="styles[direction]"
           @mousedown="startScrolling"
           @dblclick="() => controller.resetZoom(direction)"
      >
        <div :class="['zoom-controller start nav-'+direction]"
             @mousedown.stop.prevent="e => startZooming('start', e)"
        ></div>
        <div :class="['zoom-controller end nav-'+direction]"
             @mousedown.stop.prevent="e => startZooming('end', e)"
        ></div>
      </div>

      <div :class="['navigator-background nav-'+direction]" :style="styles[direction+'Preview']"
           @click="e => controller.jumpScroll(direction, e)">
        <slot></slot>
      </div>
    </div>
    <div v-if="fitZoom" class="icon fit-zoom-icon" @click="controller.fitZoom(direction)" data-cy="fitZoom" title="Fit content to viewport">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrows-angle-expand" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707z"/>
      </svg>
    </div>
  </div>
</template>

<style scoped lang="scss">
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
.navigator-preview-block-x .fit-zoom-icon:last-child {
  margin-left: 0.25em;
}
.navigator-preview-block-y .fit-zoom-icon:last-child {
  margin-top: 0.25em;
}
.navigator-preview-x,
.navigator-preview-y {
  position: relative;
  flex-grow: 1;
  border-radius: 0.25em;
  overflow: hidden;
}
.navigator-preview-x {
  min-height: 2em;
}
.navigator-preview-y {
  min-width: 2em;
}

.navigator-background {
  width: 100%;
  height: 100%;
}

.navigator-controller {
  position: absolute;
  background: rgba(240, 240, 240, 0.5);
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
  background: rgba(240, 240, 240, 0.7);
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
