import { ref } from 'vue'
import Navigator from './navigator.vue'
import NavigatorPreview from './navigatorPreview'
import CircuitDisplay from '@/components/circuitDisplay/circuitDisplay'
import { renderOptions } from '@/components/circuitDisplay/provideKeys'
import { QIR as qirCirc } from '../../../cypress/fixtures/circuits'

export default {
  title: 'Utils/Navigator',
  component: Navigator,
  args: {
    x: true,
    y: true,
    externalZoom: true,
    externalScroll: false
  }
}

const TemplateGrad = (args) => ({
  components: { Navigator, NavigatorPreview },
  setup () {
    const navigatorPreviews = ref([])
    const options = ref({ externalZooming: args.externalZoom, externalScrolling: args.externalScroll })
    const zoom = ref({ x: 1, y: 1 })
    return { navigatorPreviews, zoom, options }
  },
  computed: {
    styleContent () {
      return {
        transform: `scale(${this.zoom.x},${this.zoom.y})`,
        transformOrigin: 'top left'
      }
    }
  },
  mounted () {
    this.$refs.navController.initDimensions()
    this.navigatorPreviews = [this.$refs.navX, this.$refs.navY]
  },
  updated () {
    this.$refs.navController.initDimensions()
  },
  template: `
    <div>
      <navigator :navigator-previews="navigatorPreviews" v-model:ext-zoom-x="zoom.x" v-model:ext-zoom-y="zoom.y"
                 :options="options" ref="navController">
        <navigator-preview direction="x" :controller="$refs.navController" ref="navY" :fit-zoom="true">
          <div style="
            background: linear-gradient(90deg, rgba(115,255,163,1) 0%, rgba(109,252,250,1) 50%, rgba(86,202,255,1) 100%);
            height: 100%;
            width: 100%;
          "></div>
        </navigator-preview>
        <navigator-preview direction="y" :controller="$refs.navController" ref="navX" :fit-zoom="true">
          <div style="
            background: linear-gradient(180deg, rgba(255,248,115,1) 0%, rgba(252,109,109,1) 50%, rgba(149,86,255,1) 100%);
            height: 100%;
            width: 100%;
          "></div>
        </navigator-preview>
        
        <template #content>
          <div :style="styleContent" style="
            background: linear-gradient(135deg, rgba(144,251,63,1) 0%, rgba(155,155,155,1) 50%, rgba(70,106,252,1) 100%);
            width: 2000px;
            height: 2000px;
          "></div>
        </template>
      </navigator>
    </div>`
})

export const Gradient = TemplateGrad.bind({})

const TemplateCirc = (args) => ({
  components: { Navigator, NavigatorPreview, CircuitDisplay },
  setup () {
    const navigatorPreviews = ref([])
    const options = ref({ externalZooming: true, externalScrolling: false })
    const zoom = ref({ x: 1, y: 1 })
    const offset = ref({ x: 0, y: 0 })
    const circuit = ref(qirCirc)
    return { navigatorPreviews, zoom, offset, options, circuit }
  },
  provide () {
    return {
      [renderOptions.condenseCBits]: true,
      [renderOptions.zxStyle]: true,
      [renderOptions.recursive]: false,
      [renderOptions.condensed]: true,
      [renderOptions.nested]: false
    }
  },
  computed: {
    styleContent () {
      return {
        transform: `scale(${this.zoom.x},${this.zoom.x})`,
        transformOrigin: 'top left',
        flexGrow: 1
      }
    }
  },
  mounted () {
    this.navigatorPreviews = [this.$refs.navX, this.$refs.navY]
    this.initNav()
  },
  methods: {
    initNav () {
      this.$refs.navController.initDimensions()
    }
  },
  template: `<div>
    <navigator :navigator-previews="navigatorPreviews" :options="options"
               v-model:ext-zoom-x="zoom.x" v-model:ext-zoom-y="zoom.x" 
               v-model:ext-offset-x="offset.x" v-model:ext-offset-y="offset.x"
               ref="navController"
    >
      <navigator-preview ref="navX" direction="x" :controller="$refs.navController">
        <div style="
          background: linear-gradient(90deg, rgba(115,255,163,1) 0%, rgba(109,252,250,1) 50%, rgba(86,202,255,1) 100%);
          height: 100%;
          width: 100%;
        "></div>
      </navigator-preview>
      <navigator-preview ref="navY" direction="y" :controller="$refs.navController">
        <div style="
          background: linear-gradient(180deg, rgba(255,248,115,1) 0%, rgba(252,109,109,1) 50%, rgba(149,86,255,1) 100%);
          height: 100%;
          width: 100%;
        "></div>
      </navigator-preview>
      
      <template #content>
        <div class="circuit-display-container theme_variables light">
          <circuit-display :style="styleContent" :circuit="circuit" @updated="initNav">
          </circuit-display>
        </div>
      </template>
    </navigator>
  </div>`
})

export const Circuit = TemplateCirc.bind({})
