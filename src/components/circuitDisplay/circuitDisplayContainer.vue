<script>
import circuitDisplay from './circuitDisplay'
import infoModal from './infoModal'
import exportImage from '@/components/exportImage/exportImage'

export default {
  name: 'circuit-display-container',
  components: {
    circuitDisplay,
    infoModal,
    exportImage
  },
  props: {
    circuitRaw: { type: Object, default: undefined },
    circuitElementStr: { type: String, default: undefined }
  },
  data () {
    return {
      embeddedCircuit: undefined,
      zoom: 1,
      renderOptions: {
        zxStyle: true,
        condenseCBits: true,
        recursive: false,
        condensed: true
      },
      zoomOptions: {
        zoomOut: -0.1,
        zoomIn: 0.1
      },
      circuitEl: undefined,
      circuitDimensions: {
        width: undefined,
        height: undefined
      },
      exportImageModal: false, // toggle export dialog
      options: {
        zxStyle: {
          title: 'Render gates using zx styles',
          icon: '<svg width="16" height="16"  viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-width=".5"><path stroke-linecap="round" fill="none" d="M7.532 3.88h7.859M6.736 5.634l4.205 5.225M.667 11.58H15.39"/><circle fill="currentColor" cy="11.577" cx="11.141" r="1.936"/><circle cy="3.777" cx="5.212" fill="none" r="1.936"/><path stroke-linecap="round" fill="none" d="M.667 3.88h2.321"/></g></svg>'
        },
        condenseCBits: {
          title: 'Collapse classical registers together',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-arrows-collapse"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 8zm7-8a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 4.293V.5A.5.5 0 0 1 8 0zm-.5 11.707-1.146 1.147a.5.5 0 0 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 11.707V15.5a.5.5 0 0 1-1 0v-3.793z"/></svg>'
        },
        recursive: {
          title: 'Render nested circuits recursively',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-list-nested"><path fill-rule="evenodd" d="M4.5 11.5A.5.5 0 0 1 5 11h10a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm-2-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm-2-4A.5.5 0 0 1 1 3h10a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5z"/></svg>'
        },
        condensed: {
          title: 'Render on one line only',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-arrows-angle-contract"><path fill-rule="evenodd" d="M.172 15.828a.5.5 0 0 0 .707 0l4.096-4.096V14.5a.5.5 0 1 0 1 0v-3.975a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0 0 1h2.768L.172 15.121a.5.5 0 0 0 0 .707zM15.828.172a.5.5 0 0 0-.707 0l-4.096 4.096V1.5a.5.5 0 1 0-1 0v3.975a.5.5 0 0 0 .5.5H14.5a.5.5 0 0 0 0-1h-2.768L15.828.879a.5.5 0 0 0 0-.707z"/></svg>'
        },
        zoomIn: {
          title: 'Zoom in',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-zoom-in" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/><path d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1 6.538 6.538 0 0 1-1.398 1.4z"/><path fill-rule="evenodd" d="M6.5 3a.5.5 0 0 1 .5.5V6h2.5a.5.5 0 0 1 0 1H7v2.5a.5.5 0 0 1-1 0V7H3.5a.5.5 0 0 1 0-1H6V3.5a.5.5 0 0 1 .5-.5z"/></svg>'
        },
        zoomOut: {
          title: 'Zoom out',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-zoom-out" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/><path d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1 6.538 6.538 0 0 1-1.398 1.4z"/><path fill-rule="evenodd" d="M3 6.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/></svg>'
        },
        save: {
          title: 'Export',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>'
        }
      }
    }
  },
  computed: {
    circuit () {
      if (this.circuitElementStr) {
        return this.embeddedCircuit
      } else {
        return this.circuitRaw
      }
    },
    disabledOptions () {
      return {
        zxStyle: false,
        condenseCBits: false,
        recursive: !this.renderOptions.condensed,
        condensed: this.renderOptions.recursive,
        zoomOut: this.zoom <= 0.2,
        zoomIn: this.zoom >= 1
      }
    },
    zoomStyling () {
      return {
        transform: `scale(${this.zoom})`,
        transformOrigin: '0% 0% 0px',
        width: `calc(100% / ${this.zoom})`
      }
    }
  },
  watch: {
    circuitElementStr () {
      this.getCircuitFromDOM()
    }
  },
  mounted () {
    // Collect the circuit from a designated element
    this.getCircuitFromDOM()
  },
  methods: {
    getCircuitFromDOM () {
      if (this.circuitElementStr) {
        const circuitJson = document.querySelector(this.circuitElementStr).innerText
        let circuit
        try {
          circuit = circuitJson ? JSON.parse(circuitJson) : undefined
        } catch (e) {
          circuit = undefined
        }
        this.embeddedCircuit = circuit
      }
    },
    onWheelZoom (e) {
      if (e.deltaY < 0) {
        this.zoom = Math.min(1, this.zoom - e.deltaY * 0.01)
      } else if (e.deltaY > 0) {
        this.zoom = Math.max(0.2, this.zoom - e.deltaY * 0.01)
      }
    },
    prepareExport () {
      this.$refs.imageExport.resetState()
      const { circuit, width, height } = this.$refs.circuitDisplay.getRenderedCircuitEl()
      this.circuitEl = circuit
      this.circuitDimensions.width = width
      this.circuitDimensions.height = height
      this.exportImageModal = true
    },
    modalContentUpdate (targetRef) {
      this.$refs[targetRef].onResize()
    }
  }
}
</script>

<template>
  <div class="circuit-display-container theme_variables" @wheel.ctrl.prevent.stop="onWheelZoom">
    <div class="display-options-container" v-if="circuit">
      <div v-for="(val, option) in renderOptions" :key="option">
        <div v-if="option in options"
             :title="options[option].title"
             class="icon" :class="{'active': renderOptions[option], 'disabled': disabledOptions[option]}"
             role="checkbox"
             @click="renderOptions[option] = disabledOptions[option] ? renderOptions[option] : !renderOptions[option]"
             @keyup.space="renderOptions[option] = disabledOptions[option] ? renderOptions[option] : !renderOptions[option]"
             v-html="options[option].icon">
        </div>
      </div>
      <div v-for="(val, option) in zoomOptions" :key="option">
        <div v-if="option in options"
             :title="options[option].title"
             class="icon" :class="{'disabled': disabledOptions[option]}"
             role="button"
             @click="zoom += disabledOptions[option] ? 0 : val"
             @keyup.space="zoom += disabledOptions[option] ? 0 : val"
             v-html="options[option].icon">
        </div>
      </div>
      <div>
        <div :title="options['save'].title"
             class="icon"
             role="button"
             @click="prepareExport"
             @keyup.space="prepareExport"
             v-html="options['save'].icon">
        </div>
      </div>
    </div>
    <div :style="zoomStyling">
      <circuit-display ref="circuitDisplay" style="flex-grow: 1" :circuit="circuit" :render-options="renderOptions"></circuit-display>
    </div>
    <info-modal v-model="exportImageModal" ref="imageExportModal">
      <template #title>Export circuit as an image</template>
      <template #content>
        <export-image ref="imageExport"
                      default-file-name="circuit"
                      :element-to-render="circuitEl"
                      :base-dimensions="circuitDimensions"
                      @updated="modalContentUpdate('imageExportModal')">
        </export-image>
      </template>
    </info-modal>
  </div>
</template>

<style scoped>
.circuit-display-container {
  min-height: 3em;
  padding: 1em;
  display: flex;
  position: relative;
  padding-top: 3.5em;
}

.display-options-container {
  display: flex;
  flex-direction: row;
  align-content: flex-start;
  justify-content: flex-start;
  align-items: center;
  border-bottom: 1px solid var(--mid-col);
  padding-bottom: 0.5em;
  position: absolute;
  top: 1em;
  right: 1em;
  left: 1em;
}
</style>

<style lang="scss">
@import "@/theme.scss";
</style>
