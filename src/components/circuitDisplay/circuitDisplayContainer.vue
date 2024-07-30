<script>
import { computed } from 'vue'
import circuitDisplay from './circuitDisplay'
import { infoModal } from '@/components/gateInfo/init'
import exportImage from '@/components/exportImage/exportImage'
import { navigatorController, navigatorPreview, navigatorView } from '@/components/navigator/init'
import { renderOptions } from './provideKeys'

export default {
  name: 'circuit-display-container',
  components: {
    circuitDisplay,
    infoModal,
    exportImage,
    navigatorController,
    navigatorPreview,
    navigatorView,
  },
  props: {
    circuitRaw: { type: Object, required: false, default: undefined },
    circuitElementStr: { type: String, required: false, default: undefined },
    initRenderOptions: { type: Object, default: () => { return {} } },
    viewFormat: { validator (value) { return ['row', 'column'].includes(value) }, default: 'row'}
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
        zxStyle: this.initRenderOptions.zxStyle ?? false,
        condenseCBits: this.initRenderOptions.condenseCBits ?? true,
        recursive: this.initRenderOptions.recursive ?? false,
        wrap: !(this.initRenderOptions.condensed ?? true),
        darkTheme: this.initRenderOptions.darkTheme ?? false,
        systemTheme: this.initRenderOptions.systemTheme ?? true,
        transparentBg: this.initRenderOptions.transparentBg ?? false,
        interpretMath: this.initRenderOptions.interpretMath ?? true,
        cropParams: this.initRenderOptions.cropParams ?? true
      },
      renderOptionGroups: {
        layout: ['zxStyle', 'condenseCBits', 'recursive', 'wrap'],
        theme: ['darkTheme', 'systemTheme', 'transparentBg'],
        params: ['interpretMath', 'cropParams']
      },
      themeChanged: 0,
      // Image export
      circuitEl: null,
      circuitDimensions: {
        width: undefined,
        height: undefined
      },
      backgroundCol: '#ffffff', // default background for jpeg image export.
      // Displayed content
      circuitDisplayRefs: [],
      displayedCircuitDimensions: {
        x: [],
        y: []
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
        systemTheme: {
          title: 'Use system Theme',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-laptop" viewBox="0 0 16 16"><path d="M13.5 3a.5.5 0 0 1 .5.5V11H2V3.5a.5.5 0 0 1 .5-.5h11zm-11-1A1.5 1.5 0 0 0 1 3.5V12h14V3.5A1.5 1.5 0 0 0 13.5 2h-11zM0 12.5h16a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5z"/></svg>'
        },
        transparentBg: {
          title: 'Remove Background',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-droplet-half" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M7.21.8C7.69.295 8 0 8 0c.109.363.234.708.371 1.038.812 1.946 2.073 3.35 3.197 4.6C12.878 7.096 14 8.345 14 10a6 6 0 0 1-12 0C2 6.668 5.58 2.517 7.21.8zm.413 1.021A31.25 31.25 0 0 0 5.794 3.99c-.726.95-1.436 2.008-1.96 3.07C3.304 8.133 3 9.138 3 10c0 0 2.5 1.5 5 .5s5-.5 5-.5c0-1.201-.796-2.157-2.181-3.7l-.03-.032C9.75 5.11 8.5 3.72 7.623 1.82z"/><path fill-rule="evenodd" d="M4.553 7.776c.82-1.641 1.717-2.753 2.093-3.13l.708.708c-.29.29-1.128 1.311-1.907 2.87l-.894-.448z"/></svg>'
        },
        interpretMath: {
          title: 'Interpret parameters as math',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-slash-minus" viewBox="0 0 16 16"><path d="m1.854 14.854 13-13a.5.5 0 0 0-.708-.708l-13 13a.5.5 0 0 0 .708.708M4 1a.5.5 0 0 1 .5.5v2h2a.5.5 0 0 1 0 1h-2v2a.5.5 0 0 1-1 0v-2h-2a.5.5 0 0 1 0-1h2v-2A.5.5 0 0 1 4 1m5 11a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5A.5.5 0 0 1 9 12"/></svg>'
        },
        cropParams: {
          title: 'Crop long parameters',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-text-lambda" viewBox="0 0 16 16" ><path fill-rule="evenodd" clip-rule="evenodd" d="M14 9C14.5523 9 15 8.55228 15 8C15 7.44772 14.5523 7 14 7C13.4477 7 13 7.44772 13 8C13 8.55228 13.4477 9 14 9ZM14 10C15.1046 10 16 9.10457 16 8C16 6.89543 15.1046 6 14 6C12.8954 6 12 6.89543 12 8C12 9.10457 12.8954 10 14 10Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M2 9C2.55228 9 3 8.55228 3 8C3 7.44772 2.55228 7 2 7C1.44772 7 1 7.44772 1 8C1 8.55228 1.44772 9 2 9ZM2 10C3.10457 10 4 9.10457 4 8C4 6.89543 3.10457 6 2 6C0.895431 6 0 6.89543 0 8C0 9.10457 0.895431 10 2 10Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 2.5C1.5 1.67157 2.17157 1 3 1H13C13.8284 1 14.5 1.67157 14.5 2.5V6.5H13.5V2.5C13.5 2.22386 13.2761 2 13 2H3C2.72386 2 2.5 2.22386 2.5 2.5V6.5H1.5V2.5ZM2.5 9.5V13.5C2.5 13.7761 2.72386 14 3 14H13C13.2761 14 13.5 13.7761 13.5 13.5V9.5H14.5V13.5C14.5 14.3284 13.8284 15 13 15H3C2.17157 15 1.5 14.3284 1.5 13.5V9.5H2.5Z" /> <path d="M5.9795 12.144C6.0915 12.192 6.1755 12.216 6.2315 12.216C6.2635 12.216 6.2995 12.184 6.3395 12.12C6.3795 12.064 6.4155 12 6.4475 11.928C6.4795 11.856 6.4995 11.808 6.5075 11.784C6.6435 11.536 6.7915 11.264 6.9515 10.968C7.1195 10.664 7.2795 10.36 7.4315 10.056C7.5915 9.752 7.7355 9.468 7.8635 9.204C7.9915 8.932 8.0915 8.708 8.1635 8.532C8.1795 8.5 8.1915 8.488 8.1995 8.496C8.2155 8.496 8.2275 8.512 8.2355 8.544C8.2755 8.816 8.3235 9.128 8.3795 9.48C8.4435 9.824 8.5155 10.168 8.5955 10.512C8.6755 10.856 8.7555 11.16 8.8355 11.424C8.9235 11.72 9.0475 11.92 9.2075 12.024C9.3755 12.128 9.5595 12.18 9.7595 12.18C9.8875 12.18 10.0115 12.152 10.1315 12.096C10.2515 12.04 10.3595 11.96 10.4555 11.856C10.5515 11.752 10.6275 11.632 10.6835 11.496C10.7395 11.36 10.7675 11.212 10.7675 11.052C10.7675 11.02 10.7515 10.996 10.7195 10.98C10.6955 10.956 10.6675 10.944 10.6355 10.944C10.5875 10.944 10.4915 10.98 10.3475 11.052C10.2115 11.116 10.0355 11.144 9.8195 11.136C9.7235 11.136 9.5995 11.1 9.4475 11.028C9.2955 10.948 9.1835 10.784 9.1115 10.536C9.0315 10.24 8.9515 9.936 8.8715 9.624C8.7995 9.304 8.7315 8.984 8.6675 8.664C8.6115 8.344 8.5555 8.036 8.4995 7.74C8.3555 6.908 8.2035 6.184 8.0435 5.568C7.8915 4.944 7.6955 4.464 7.4555 4.128C7.2235 3.784 6.9075 3.612 6.5075 3.612C6.3395 3.612 6.1715 3.656 6.0035 3.744C5.8355 3.824 5.6795 3.928 5.5355 4.056C5.3995 4.176 5.2875 4.3 5.1995 4.428C5.1115 4.548 5.0675 4.648 5.0675 4.728C5.0675 4.784 5.0755 4.82 5.0915 4.836C5.1075 4.852 5.1355 4.86 5.1755 4.86C5.2075 4.86 5.2435 4.852 5.2835 4.836C5.3315 4.812 5.3835 4.78 5.4395 4.74C5.5675 4.652 5.6915 4.584 5.8115 4.536C5.9395 4.488 6.0595 4.464 6.1715 4.464C6.5635 4.464 6.8835 4.584 7.1315 4.824C7.3795 5.064 7.5675 5.384 7.6955 5.784C7.8315 6.176 7.9275 6.6 7.9835 7.056C7.9995 7.152 8.0035 7.22 7.9955 7.26C7.9875 7.292 7.9635 7.364 7.9235 7.476C7.8355 7.764 7.6955 8.092 7.5035 8.46C7.3195 8.82 7.1115 9.188 6.8795 9.564C6.6555 9.94 6.4315 10.296 6.2075 10.632C5.9915 10.96 5.8075 11.24 5.6555 11.472C5.5995 11.56 5.5635 11.612 5.5475 11.628C5.5395 11.644 5.5355 11.696 5.5355 11.784C5.5355 11.856 5.5795 11.924 5.6675 11.988C5.7635 12.052 5.8675 12.104 5.9795 12.144Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M3 1C2.17157 1 1.5 1.67157 1.5 2.5V6.06301C0.637386 6.28503 0 7.06808 0 8C0 8.93192 0.637386 9.71497 1.5 9.93699V13.5C1.5 14.3284 2.17157 15 3 15H13C13.8284 15 14.5 14.3284 14.5 13.5V9.93699C15.3626 9.71497 16 8.93192 16 8C16 7.06808 15.3626 6.28503 14.5 6.06301V2.5C14.5 1.67157 13.8284 1 13 1H3ZM13.5 6.06301V2.5C13.5 2.22386 13.2761 2 13 2H3C2.72386 2 2.5 2.22386 2.5 2.5V6.06301C3.36261 6.28503 4 7.06808 4 8C4 8.93192 3.36261 9.71497 2.5 9.93699V13.5C2.5 13.7761 2.72386 14 3 14H13C13.2761 14 13.5 13.7761 13.5 13.5V9.93699C12.6374 9.71497 12 8.93192 12 8C12 7.06808 12.6374 6.28503 13.5 6.06301ZM2 9C2.55228 9 3 8.55228 3 8C3 7.44772 2.55228 7 2 7C1.44772 7 1 7.44772 1 8C1 8.55228 1.44772 9 2 9ZM14 9C14.5523 9 15 8.55228 15 8C15 7.44772 14.5523 7 14 7C13.4477 7 13 7.44772 13 8C13 8.55228 13.4477 9 14 9Z" /></svg>'
        }
      },
    }
  },
  provide () {
    return {
      [renderOptions.condenseCBits]: computed(() => this.renderOptions.condenseCBits),
      [renderOptions.zxStyle]: computed(() => this.renderOptions.zxStyle),
      [renderOptions.recursive]: computed(() => this.renderOptions.recursive),
      [renderOptions.condensed]: computed(() => !this.renderOptions.wrap),
      [renderOptions.cropParams]: computed(() => this.renderOptions.cropParams),
      [renderOptions.interpretMath]: computed(() => this.renderOptions.interpretMath),
      [renderOptions.nested]: 0
    }
  },
  computed: {
    circuits () {
      if (this.circuitElementStr) {
        return Array.isArray(this.embeddedCircuit) ? this.embeddedCircuit : [this.embeddedCircuit]
      } else {
        return Array.isArray(this.circuitRaw) ? this.circuitRaw : [this.circuitRaw]
      }
    },
    nCircuits () {
      return this.circuits.length
    },
    disabledOptions () {
      return {
        zxStyle: false,
        condenseCBits: false,
        recursive: this.renderOptions.wrap,
        condensed: this.renderOptions.recursive,
        wrap: this.renderOptions.recursive,
        darkTheme: this.renderOptions.systemTheme
      }
    },
    themeMode () {
      const isDark = this.themeChanged > -1 && (
        this.renderOptions.systemTheme
          ? this.isSystemDarkMode()
          : this.renderOptions.darkTheme
      )
      return isDark ? 'theme-mode-dark' : 'theme-mode-light'
    }
  },
  watch: {
    circuitElementStr () {
      this.watchCircuitFromDOM(true)
    }
  },
  mounted () {
    // Collect the circuit from a designated element. Make sure we watch for changes.
    this.watchCircuitFromDOM(false)

    // Detect system theme if not overriden
    if (!('darkTheme' in this.initRenderOptions)) {
      this.darkTheme = this.isSystemDarkMode()
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.themeChanged = 1 - this.themeChanged
    })
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
    getCircuitDims (i) {
      const { circuit, width, height } = this.circuitDisplayRefs[i].getRenderedCircuitEl()
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
      this.getCircuitDims(0)
      this.getDefaultBackground()
      this.exportImageModal = true
    },
    modalContentUpdate (targetRef) {
      this.$refs[targetRef].onResize()
    },
    appendCircuitRef (i, el) {
      while (this.circuitDisplayRefs.length < i) {
        this.circuitDisplayRefs.push(undefined)
      }
      this.circuitDisplayRefs[i] = el
    },
    isSystemDarkMode () {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }
}
</script>

<template>
  <div :class=[themeMode]>
  <navigator-controller
      class="circuit-display-container theme_variables"
      :class="[{ 'transparent_bg': renderOptions.transparentBg }]"
      :n-views="nCircuits"
      :ext-content-x="displayedCircuitDimensions.x?.reduce((acc, x) => (acc > x ? acc : x), 0)"
      :ext-content-y="displayedCircuitDimensions.y?.reduce((acc, y) => (acc > y ? acc : y), 0)"
      :view-format="viewFormat"
      override-style
  >
    <template #menus="{updateX, updateY, onAction}">
      <div class="display-options-container" v-if="circuits">
        <div class="icon" :class="{'active': menuOptions}" role="checkbox" tabindex="0"
             :title="options.menu.title" v-html="options.menu.icon"
             @click="menuOptions = !menuOptions" @keyup.space="menuOptions = !menuOptions"
        ></div>
        <div v-if="menuOptions" class="display-options-menu">
          <div v-for="optionGroup in Object.keys(renderOptionGroups)" :key="optionGroup" class="display-options-menu-group">
            <div v-for="option in renderOptionGroups[optionGroup]" :key="option">
              <div v-if="option in options" class="display-options-menu-entry"
                   tabindex="0"
                   @click="renderOptions[option] = disabledOptions[option] ? renderOptions[option] : !renderOptions[option]"
                   @keyup.space="renderOptions[option] = disabledOptions[option] ? renderOptions[option] : !renderOptions[option]"
              >
                <div :title="options[option].title"
                     class="icon" :class="{'selected': renderOptions[option], 'disabled': disabledOptions[option]}"
                     role="checkbox"
                     v-html="options[option].icon"
                ></div>
                <div class="icon-label" :class="{'selected': renderOptions[option], 'disabled': disabledOptions[option]}">
                  [[# options[option].title #]]
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <navigator-preview @action="onAction" @update:preview-x="updateX" direction="x" :fit-zoom="!renderOptions.wrap" :reset-zoom="true">
      </navigator-preview>
      <navigator-preview @action="onAction" @update:preview-y="updateY" direction="y"></navigator-preview>

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
    </template>
    <template #content="{updateContent, updateView}">
      <div v-for="(circuit, i) in circuits" :key="i"
           @click="menuOptions = false"
           :style="{
             [viewFormat == 'row' ? 'width' : 'height']: `calc(100% / ${nCircuits} - 0.5em * ${Math.max(0, nCircuits - 1)})`,
           }"
      >
        <circuit-display
           @update:content-x="val => updateContent(val, 'x', i)"
           @update:content-y="val => updateContent(val, 'y', i)"
           @update:self-x="val => updateView(val, 'x', i)"
           @update:self-y="val => updateView(val, 'y', i)"
           :ref="(el) => appendCircuitRef(i, el)"
           :circuit="circuit"
        ></circuit-display>
      </div>
    </template>
  </navigator-controller>
  </div>
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
  bottom: 0;
  max-height: calc(100% - 5em);
  height: fit-content;
  left: 0;
  margin: 0.6em;
  background: var(--background);
  border-radius: 0.4em;
  box-shadow: 0px 5px 10px 0px rgba($grey900, 0.1);
  border: 1px solid var(--divider);
  overflow: auto;
  z-index: 10;
}
.display-options-menu-group {
  padding: 0.4em;
}
.display-options-menu-group:not(:first-child) {
  border-top: 1px solid var(--divider);
}
.display-options-menu-entry {
  display: flex;
  padding: 0.4em;
  border-radius: var(--radius);
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
