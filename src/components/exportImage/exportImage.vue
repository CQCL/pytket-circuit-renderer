<script>
import domToImage from 'dom-to-image'
import { RefValidator } from '@/components/propValidators'

export default {
  name: 'export-image',
  emits: ['updated'],
  props: {
    defaultFileName: { type: String, required: false },
    elementToRender: { validator: RefValidator, required: true },
    baseDimensions: { type: Object, default: () => { return { width: false, height: false } } },
    defaultBackground: { type: String, default: '#ffffff' }
  },
  data () {
    return {
      options: {
        fileType: {
          title: 'File type',
          value: 'png',
          options: {
            PNG: 'png',
            JPEG: 'jpeg',
            SVG: 'svg'
          }
        },
        quality: {
          title: 'Quality',
          value: 1.0,
          options: {
            '25%': 0.25,
            '50%': 0.5,
            '75%': 0.75,
            '100%': 1.0
          }
        },
        scale: {
          title: 'Resolution',
          value: 1.0,
          options: {
            '1x': 1.0,
            '2x': 2.0,
            '4x': 4.0,
            '8x': 8.0
          }
        }
      },
      methods: {
        png: 'toPng',
        jpeg: 'toJpeg',
        svg: 'toSvg'
      },
      imageUrl: undefined,
      fileName: this.defaultFileName ? this.defaultFileName : 'image',
      rendering: false
    }
  },
  computed: {
    resolution () {
      const width = this.baseDimensions.width ? this.baseDimensions.width : this.elementToRender?.clientWidth
      const height = this.baseDimensions.height ? this.baseDimensions.height : this.elementToRender?.clientHeight
      return {
        width: Math.ceil(width * this.options.scale.value),
        height: Math.ceil(height * this.options.scale.value)
      }
    },
    renderOptions () {
      return {
        cacheBust: true,
        quality: this.options.quality.value,
        bgcolor: this.options.fileType.value === 'jpeg' ? this.defaultBackground : 'transparent',
        ...this.resolution,
        style: {
          transform: `scale(${this.options.scale.value})`,
          transformOrigin: 'top left'
        }
      }
    }
  },
  updated () {
    // If this is in a modal we need to update it explicitly when the image changes.
    this.$nextTick(() => this.$emit('updated', this.imageUrl))
  },
  methods: {
    download () {
      if (this.imageUrl && this.fileName) {
        const link = document.createElement('a')
        link.download = `${this.fileName}.${this.options.fileType.value}`
        link.href = this.imageUrl
        link.click()
        link.remove()
      }
    },
    async renderImage () {
      try {
        this.rendering = true
        const dataUrl = await domToImage[this.methods[this.options.fileType.value]](
          this.elementToRender,
          this.renderOptions
        )
        this.imageUrl = dataUrl
        this.rendering = false
      } catch (error) {
        console.error('render error!', error)
        this.rendering = false
      }
    },
    resetState () {
      this.imageUrl = undefined
      this.options.fileType.value = 'png'
      this.options.scale.value = 1.0
      this.options.quality.value = 1.0
    }
  }
}
</script>

<template>
    <div :class="{rendering: rendering}">
      <p>Note: when exporting as an SVG, the image is intended for browser display only, and is not displayed by image editors.</p>
      <p>To get a high quality image for inclusion in slides, you can use a PNG format at higher resolution.</p>
    </div>
    <div :class="{rendering: rendering}">
      <form :style="{paddingTop: '0.5rem'}">
        <div style="display: flex" v-for="(option, name) in options" :key="name">
          <span class="tab-option-label">[[# option.title #]]</span>
          <div class="tab-options">
            <div v-for="(value, name) in option.options" :key="name"
                 class="tab-option" :class="{selected: option.value === value}"
                 tabindex="0" role="radio"
                 @click="option.value = value"
                 @keyup.space="option.value = value"
            >[[# name #]]</div>
          </div>
        </div>
        <div class="extra-info">
          Image size: [[# resolution.width #]]*[[# resolution.height #]]
        </div>
        <div class="row" :style="{borderBottom: 0}">
          <button class="row-item button" :class="{disabled: typeof elementToRender === 'undefined'}" @click.prevent.stop="renderImage">
            Generate
          </button>
        </div>
      </form>
    </div>
    <div :class="{rendering: rendering}">
      <div>
        <div class="row-heading">Image</div>
        <div class="image-preview" v-if="!!imageUrl">
          <img :src="imageUrl" alt="Image Preview" />
        </div>
        <div style="display: flex;padding-top: 1rem">
          <input class="row-item" type="text" v-model="fileName" placeholder="File name"/>
          <div style="padding: 0.5em">.[[# options.fileType.value #]]</div>
          <button :class="{disabled: !imageUrl || !fileName}" @click="download">Save</button>
        </div>
      </div>
    </div>
</template>

<style scoped>
.rendering{
  cursor: wait;
}
.disabled{
  cursor: default !important;
  color: var(--text-disabled) !important;
  background: var(--paper) !important;
}
.tab-options{
  display: flex;
  color: var(--text-primary);
  flex-grow: 1;
  overflow: hidden;
}
.tab-option-label{
  padding: 10px 10px 10px 0;
  width: 6em;
}
.tab-option{
  padding: 10px;
  margin: 0.25rem;
  border-radius: var(--radius);
  flex-grow: 1;
  text-align: center;
  text-transform: capitalize;
}
.tab-option.selected{
  background: var(--paper-dark);
}
.tab-option:hover, .tab-option.selected:hover{
  background: var(--paper);
}
.extra-info{
  font-size: 0.8em;
}

.image-preview{
  width: 100%;
  max-height: 10em;
  margin: 1em 0;
}

.image-preview img{
  max-width: 100%;
  max-height: 100%;
}

</style>
