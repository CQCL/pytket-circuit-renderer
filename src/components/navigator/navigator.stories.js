import {computed, ref} from 'vue'
import Navigator from './navigator.vue'
import NavigatorPreview from './navigatorPreview'
import NavigatorView from './navigatorView'
import CircuitDisplay from '@/components/circuitDisplay/circuitDisplay'
import { renderOptions } from '@/components/circuitDisplay/provideKeys'
import { QIR as qirCirc } from '../../../cypress/fixtures/circuits'
import circuitDisplay from "@/components/circuitDisplay/circuitDisplay.vue";

export default {
  components: {circuitDisplay},
  title: 'Utils/Navigator',
  component: Navigator,
  args: {
    nViews: 1,
    keepAspectRatio: true,
    overrideStyle: false,
    viewFormat: 'row',
  }
}

const TemplateGrad = (args) => ({
  components: { Navigator, NavigatorPreview, NavigatorView },
  setup () {
    const nViews = computed(() => args.nViews)
    const keepAspectRatio = computed(() => args.keepAspectRatio)
    const overrideStyle = computed(() => args.overrideStyle)
    const viewFormat = computed(() => args.viewFormat)
    return {nViews, keepAspectRatio, overrideStyle, viewFormat}
  },
  template: `
    <div class="theme_variables">
      <navigator
          :n-views="nViews" 
          :view-format="viewFormat" 
          :keep-aspect-ratio="keepAspectRatio"
          :override-style="overrideStyle"
      >
        <template #menus="{updateX, updateY, onAction}">
          <navigator-preview @action="onAction" direction="x" @update:preview-x="updateX" :fit-zoom="true" :reset-zoom="true">
            <div style="
              background: linear-gradient(90deg, rgba(115,255,163,1) 0%, rgba(109,252,250,1) 50%, rgba(86,202,255,1) 100%);
              height: 100%;
              width: 100%;
            "></div>
          </navigator-preview>
          <navigator-preview @action="onAction" direction="y" @update:preview-y="updateY" :fit-zoom="true">
            <div style="
              background: linear-gradient(180deg, rgba(255,248,115,1) 0%, rgba(252,109,109,1) 50%, rgba(149,86,255,1) 100%);
              height: 100%;
              width: 100%;
            "></div>
          </navigator-preview>
        </template>
        <template #content="{updateContent, updateView}">
          <navigator-view v-for="i in nViews" :key="i" active
           @update:content-x="val => updateContent(val, 'x', i - 1)"
           @update:content-y="val => updateContent(val, 'y', i - 1)"
           @update:self-x="val => updateView(val, 'x', i - 1)"
           @update:self-y="val => updateView(val, 'y', i - 1)"
          >
            <div :style="{
              background: 'linear-gradient(' + 80 * i + 'deg, rgba(144,251,63,1) 0%, rgba(155,155,155,1) 50%, rgba(70,106,252,1) 100%)',
              width: '2000px',
              height: '2000px',
            }"></div>
          </navigator-view>
        </template>
      </navigator>
    </div>`
})
export const Gradient = TemplateGrad.bind({})

const TemplateCirc = (args) => ({
  components: { Navigator, NavigatorPreview, CircuitDisplay },
  setup () {
    const nViews = computed(() => args.nViews)
    const keepAspectRatio = computed(() => args.keepAspectRatio)
    const overrideStyle = computed(() => args.overrideStyle)
    const viewFormat = computed(() => args.viewFormat)
    const circuit = ref(qirCirc)
    return { nViews, keepAspectRatio, overrideStyle, viewFormat, circuit }
  },
  provide () {
    return {
      [renderOptions.condenseCBits]: true,
      [renderOptions.zxStyle]: true,
      [renderOptions.recursive]: false,
      [renderOptions.condensed]: true,
      [renderOptions.cropParams]: true,
      [renderOptions.interpretMath]: true,
      [renderOptions.nested]: 0
    }
  },
  template: `<div class="theme-mode-light">
    <navigator
        class="circuit-display-container theme_variables"
        :n-views="nViews" 
        :view-format="viewFormat" 
        :keep-aspect-ratio="keepAspectRatio"
        :override-style="overrideStyle"
    >
      <template #menus="{updateX, updateY}">
        <navigator-preview direction="x" @update:preview-x="updateX" :fit-zoom="true" :reset-zoom="true">
          <div style="
            background: linear-gradient(90deg, rgba(115,255,163,1) 0%, rgba(109,252,250,1) 50%, rgba(86,202,255,1) 100%);
            height: 100%;
            width: 100%;
          "></div>
        </navigator-preview>
        <navigator-preview direction="y" @update:preview-y="updateY" :fit-zoom="true">
          <div style="
            background: linear-gradient(180deg, rgba(255,248,115,1) 0%, rgba(252,109,109,1) 50%, rgba(149,86,255,1) 100%);
            height: 100%;
            width: 100%;
          "></div>
        </navigator-preview>
      </template>
      
      <template #content="{updateContent, updateView}">
        <circuit-display 
           @update:content-x="val => updateContent(val, 'x', 0)"
           @update:content-y="val => updateContent(val, 'y', 0)"
           @update:self-x="val => updateView(val, 'x', 0)"
           @update:self-y="val => updateView(val, 'y', 0)"
           :circuit="circuit"
        ></circuit-display>
      </template>
    </navigator>
  </div>`
})

export const Circuit = TemplateCirc.bind({})
