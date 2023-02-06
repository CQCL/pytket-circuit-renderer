<script>
import { computed } from 'vue'
import circuitDisplay from './circuitDisplay'
import infoModal from './infoModal'
import exportImage from '@/components/exportImage/exportImage'
import { navigatorController, navigatorPreview } from '@/components/navigator/init'
import { renderOptions } from './provideKeys'

export default {
  name: 'circuit-display-container',
  components: {
    circuitDisplay,
    infoModal,
    exportImage,
    navigatorController,
    navigatorPreview
  },
  props: {
    circuitRaw: { type: Object, required: false, default: undefined },
    circuitElementStr: { type: String, required: false, default: undefined },
    initRenderOptions: { type: Object, default: () => { return {} } }
  },
  data () {
    return {
      embeddedCircuit: undefined,
      embeddedCircuitObserver: new MutationObserver((mutationList) => {
        for (const mutation of mutationList) {
          if (mutation.addedNodes.length > 0) {
            this.getCircuitFromDOM()
          }
        }
      }),
      zoom: 1,
      scrollX: 0,
      scrollY: 0,
      width: 0,
      renderOptions: {
        zxStyle: 'zxStyle' in this.initRenderOptions ? this.initRenderOptions.zxStyle : true,
        condenseCBits: 'condenseCBits' in this.initRenderOptions ? this.initRenderOptions.condenseCBits : true,
        recursive: 'recursive' in this.initRenderOptions ? this.initRenderOptions.recursive : false,
        wrap: 'condensed' in this.initRenderOptions ? !this.initRenderOptions.condensed : false,
        darkTheme: 'darkTheme' in this.initRenderOptions ? this.initRenderOptions.darkTheme : false,
        transparentBg: 'transparentBg' in this.initRenderOptions ? this.initRenderOptions.transparentBg : false
      },
      circuitEl: null,
      circuitDimensions: {
        width: undefined,
        height: undefined
      },
      backgroundCol: '#ffffff', // default background for jpeg image export.
      displayedCircuitDimensions: {
        x: undefined,
        y: undefined
      },
      exportImageModal: false, // toggle export dialog
      menuOptions: false, // toggle display options menu
      options: {
        zxStyle: {
          title: 'Render gates using zx styles',
          icon: '<svg width="16" height="16"  viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-width=".5"><path stroke-linecap="round" fill="none" d="M7.532 3.88h7.859M6.736 5.634l4.205 5.225M.667 11.58H15.39"/><circle fill="currentColor" cy="11.577" cx="11.141" r="1.936"/><circle cy="3.777" cx="5.212" fill="none" r="1.936"/><path stroke-linecap="round" fill="none" d="M.667 3.88h2.321"/></g></svg>'
        },
        condenseCBits: {
          title: 'Collapse classical registers together',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-arrows-collapse"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 8zm7-8a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 4.293V.5A.5.5 0 0 1 8 0zm-.5 11.707-1.146 1.147a.5.5 0 0 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 11.707V15.5a.5.5 0 0 1-1 0v-3.793z"/></svg>'
        },
        recursive: {
          title: 'Render nested circuits recursively',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-list-nested"><path fill-rule="evenodd" d="M4.5 11.5A.5.5 0 0 1 5 11h10a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm-2-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm-2-4A.5.5 0 0 1 1 3h10a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5z"/></svg>'
        },
        wrap: {
          title: 'Wrap circuit to fit display',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-text-wrap" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M2 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5Zm0 4a.5.5 0 0 1 .5-.5h9a2.5 2.5 0 0 1 0 5h-1.293l.647.646a.5.5 0 0 1-.708.708l-1.5-1.5a.5.5 0 0 1 0-.708l1.5-1.5a.5.5 0 0 1 .708.708l-.647.646H11.5a1.5 1.5 0 0 0 0-3h-9a.5.5 0 0 1-.5-.5Zm0 4a.5.5 0 0 1 .5-.5H7a.5.5 0 0 1 0 1H2.5a.5.5 0 0 1-.5-.5Z"/></svg>'
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
        },
        menu: {
          title: 'Display Options',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/></svg>'
        },
        darkTheme: {
          title: 'Dark Mode',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-moon-fill" viewBox="0 0 16 16"><path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/></svg>'
        },
        transparentBg: {
          title: 'Remove Background',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-droplet-half" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M7.21.8C7.69.295 8 0 8 0c.109.363.234.708.371 1.038.812 1.946 2.073 3.35 3.197 4.6C12.878 7.096 14 8.345 14 10a6 6 0 0 1-12 0C2 6.668 5.58 2.517 7.21.8zm.413 1.021A31.25 31.25 0 0 0 5.794 3.99c-.726.95-1.436 2.008-1.96 3.07C3.304 8.133 3 9.138 3 10c0 0 2.5 1.5 5 .5s5-.5 5-.5c0-1.201-.796-2.157-2.181-3.7l-.03-.032C9.75 5.11 8.5 3.72 7.623 1.82z"/><path fill-rule="evenodd" d="M4.553 7.776c.82-1.641 1.717-2.753 2.093-3.13l.708.708c-.29.29-1.128 1.311-1.907 2.87l-.894-.448z"/></svg>'
        }
      },
      navPreviews: []
    }
  },
  provide () {
    return {
      [renderOptions.condenseCBits]: computed(() => this.renderOptions.condenseCBits),
      [renderOptions.zxStyle]: computed(() => this.renderOptions.zxStyle),
      [renderOptions.recursive]: computed(() => this.renderOptions.recursive),
      [renderOptions.condensed]: computed(() => !this.renderOptions.wrap),
      [renderOptions.nested]: false
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
        recursive: this.renderOptions.wrap,
        condensed: this.renderOptions.recursive,
        wrap: this.renderOptions.recursive
      }
    },
    zoomStyling () {
      if (this.renderOptions.wrap) {
        return {
          width: `calc(100% / ${this.zoom})`,
          transform: `scale(${this.zoom}) translate(-${this.scrollX * 100}%, -${this.scrollY * 100}%)`,
          transformOrigin: 'top left'
        }
      }
      return {
        transform: `scale(${this.zoom}) translate(-${this.scrollX * 100}%, -${this.scrollY * 100}%)`,
        transformOrigin: 'top left'
      }
    }
  },
  watch: {
    circuitElementStr () {
      this.watchCircuitFromDOM(true)
    },
    zoomStyling () {
      this.updateNav()
    }
  },
  mounted () {
    // Collect the circuit from a designated element. Make sure we watch for changes.
    this.watchCircuitFromDOM(false)
    this.navPreviews = [this.$refs.navX, this.$refs.navY]
    this.updateNav()

    // Detect system theme if not overriden
    if (!('darkTheme' in this.initRenderOptions)) {
      this.renderOptions.darkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  },
  beforeUnmount () {
    this.embeddedCircuitObserver.disconnect()
  },
  methods: {
    watchCircuitFromDOM (changedRef) {
      if (this.circuitElementStr) {
        this.getCircuitFromDOM()
        // Update the mutation observer to the new element
        if (changedRef) {
          this.embeddedCircuitObserver.disconnect()
        }
        this.embeddedCircuitObserver.observe(document.querySelector(this.circuitElementStr), {
          characterData: false,
          attributes: false,
          childList: true,
          subtree: false
        })
      }
    },
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
    getCircuitDims () {
      const { circuit, width, height } = this.$refs.circuitDisplay.getRenderedCircuitEl()
      this.circuitEl = circuit
      this.circuitDimensions.width = width
      this.circuitDimensions.height = height
    },
    getDefaultBackground () {
      if (this.circuitEl) { // compute the current background variable value
        this.backgroundCol = getComputedStyle(this.circuitEl).getPropertyValue('--background')
      } else { // fallback to theme-relative default
        this.backgroundCol = this.renderOptions.darkTheme ? '#000000' : '#ffffff'
      }
    },
    prepareExport () {
      this.$refs.imageExport.resetState()
      this.getCircuitDims()
      this.getDefaultBackground()
      this.exportImageModal = true
    },
    modalContentUpdate (targetRef) {
      this.$refs[targetRef].onResize()
    },
    updateNav () {
      if (this.$refs.circuitDisplay) {
        const { x, y } = this.$refs.circuitDisplay.getDisplayedCircuitDimensions()
        this.displayedCircuitDimensions.x = x
        this.displayedCircuitDimensions.y = y
        this.$refs.navController.initDimensions()
      }
    }
  }
}
</script>

<template>
  <navigator-controller class="circuit-display-container theme_variables"
                        :class="[renderOptions.darkTheme ? 'dark': 'light', { 'transparent_bg': renderOptions.transparentBg }]"
                        ref="navController" :navigator-previews="navPreviews"
                        :options="{ overrideStyle: true, externalZooming: true, externalScrolling: true, externalContent: true }"
                        v-model:ext-zoom-x="zoom" v-model:ext-zoom-y="zoom"
                        v-model:ext-offset-x="scrollX" v-model:ext-offset-y="scrollY"
                        :ext-content-x="displayedCircuitDimensions.x" :ext-content-y="displayedCircuitDimensions.y"
  >
    <div class="display-options-container" v-if="circuit">
      <div class="icon" :class="{'active': menuOptions}" role="checkbox" tabindex="0"
           :title="options.menu.title" v-html="options.menu.icon"
           @click="menuOptions = !menuOptions" @keyup.space="menuOptions = !menuOptions"
      ></div>
      <div v-if="menuOptions" class="display-options-menu">
        <div v-for="(val, option) in renderOptions" :key="option">
          <div v-if="option in options" class="display-options-menu-entry"
               tabindex="0"
               @click="renderOptions[option] = disabledOptions[option] ? renderOptions[option] : !renderOptions[option]"
               @keyup.space="renderOptions[option] = disabledOptions[option] ? renderOptions[option] : !renderOptions[option]"
          >
            <div :title="options[option].title"
                 class="icon" :class="{'active': renderOptions[option], 'disabled': disabledOptions[option]}"
                 role="checkbox"
                 v-html="options[option].icon"
            ></div>
            <div class="icon-label" :class="{'active': renderOptions[option], 'disabled': disabledOptions[option]}">
              [[# options[option].title #]]
            </div>
          </div>
        </div>
      </div>
    </div>

    <navigator-preview ref="navX" :controller="$refs.navController" direction="x" :fit-zoom="!renderOptions.wrap" :reset-zoom="true">
    </navigator-preview>
    <navigator-preview ref="navY" :controller="$refs.navController" direction="y"></navigator-preview>

    <div class="download-button">
        <div :title="options['save'].title"
             class="icon" :class="{'active': exportImageModal}"
             role="button"
             @click="prepareExport"
             @keyup.space="prepareExport"
             v-html="options['save'].icon">
        </div>
    </div>

    <info-modal v-model="exportImageModal" ref="imageExportModal" style="z-index: 10">
      <template #title>Export circuit as an image</template>
      <template #content>
        <export-image ref="imageExport"
                      default-file-name="circuit"
                      :default-background="backgroundCol"
                      :element-to-render="circuitEl"
                      :base-dimensions="circuitDimensions"
                      @updated="modalContentUpdate('imageExportModal')">
        </export-image>
      </template>
    </info-modal>

    <template #content>
      <circuit-display @click="menuOptions = false" @updated="updateNav" ref="circuitDisplay" style="flex-grow: 1"
                       :circuit="circuit" :navigator-styling="zoomStyling">
      </circuit-display>
    </template>
  </navigator-controller>
</template>

<style scoped lang="scss">
@import "@/themeVariables.scss";

.circuit-display-container {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "menu    nav-x   download"
    "preview preview nav-y";
  grid-gap: 0.25em;
  min-height: 3em;
  padding: 1em;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--circuit-background);
}

.download-button {
  grid-area: download;
}

.display-options-container {
  grid-area: menu;
  display: flex;
  flex-direction: row;
  align-content: flex-start;
  justify-content: flex-start;
  align-items: center;
}

.display-options-menu {
  position: absolute;
  top: 3em;
  left: 0;
  margin: 0.6em;
  background: var(--background);
  border-radius: 0.4em;
  box-shadow: 0px 5px 10px 0px rgba($grey900, 0.1);
  border: 1px solid var(--paper);
  overflow: hidden;
  z-index: 1;
}
.display-options-menu-entry {
  display: flex;
  padding: 0.4em;
  border-bottom: 1px solid var(--paper);
}
:last-child > .display-options-menu-entry {
  border-bottom: none;
}
.display-options-menu-entry:hover {
  background: var(--paper);
}
.display-options-menu-entry .icon-label {
  margin: auto 0.4em;
}
</style>

<style lang="scss">
@import "@/theme.scss";
</style>
