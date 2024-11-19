<script>
import domToImage from 'dom-to-image'
import { RefValidator } from '@/components/propValidators'

export default {
  name: 'export-image',
  emits: ['updated'],
  props: {
    defaultFileName: { type: String, required: false },
    elementsToRender: { validator: RefValidator, required: true },
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
      batchExport: false,
      methods: {
        png: 'toPng',
        jpeg: 'toJpeg',
        svg: 'toSvg'
      },
      imageUrls: [],
      fileName: this.defaultFileName ? this.defaultFileName : 'image',
      rendering: false
    }
  },
  computed: {
    resolution () {
      return this.elementsToRender?.map((elementToRender) => {
        const width = this.baseDimensions.width ? this.baseDimensions.width : elementToRender.clientWidth
        const height = this.baseDimensions.height ? this.baseDimensions.height : elementToRender.clientHeight
        return {
          width: Math.ceil(width * this.options.scale.value),
          height: Math.ceil(height * this.options.scale.value)
        }
      })
    },
    renderOptions () {
      return {
        cacheBust: true,
        quality: this.options.quality.value,
        bgcolor: this.options.fileType.value === 'jpeg' ? this.defaultBackground : 'transparent',
        style: {
          transform: `scale(${this.options.scale.value})`,
          transformOrigin: 'top left'
        }
      }
    }
  },
  updated () {
    // If this is in a modal we need to update it explicitly when the image changes.
    this.$nextTick(() => this.$emit('updated', this.imageUrls))
  },
  methods: {
    download (i) {
      if (this.imageUrls[i] && this.fileName) {
        const link = document.createElement('a')
        link.download = `${this.fileName}${this.batchExport ? i : ''}.${this.options.fileType.value}`
        link.href = this.imageUrls[i]
        link.click()
        link.remove()
      }
    },
    renderImage () {
      this.rendering = true
      this.$nextTick(async () => {
        const dataUrls = await Promise.all(
          this.elementsToRender.map((elementToRender, i) => {
            return domToImage[this.methods[this.options.fileType.value]](
              elementToRender,
              { ...this.renderOptions, ...this.resolution[i] }
            )
          })
        )
        this.rendering = false
        this.imageUrls = dataUrls.filter(url => !!url)
      })
    },
    resetState () {
      this.imageUrls = []
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
                 :data-cy="`option-${name}`"
                 @click="option.value = value"
                 @keyup.space="option.value = value"
            >[[# name #]]</div>
          </div>
        </div>
        <div v-if="resolution && resolution.length > 0" class="extra-info">
          Image size: [[# resolution[0].width #]]*[[# resolution[0].height #]]
        </div>
        <div class="row" :style="{borderBottom: 0}">
          <button title="Generate Image" class="row-item button" :class="{disabled: elementsToRender?.length === 0}" @click.prevent.stop="renderImage">
            Generate
          </button>
        </div>
      </form>
    </div>
    <div v-if="rendering || imageUrls.length > 0" :class="{rendering: rendering}">
      <div>
        <div class="row-heading">Images</div>
        <p style="display: flex; gap: 1em; align-items: center">
          <label>File prefix</label>
          <input style="flex-grow: 1" class="row-item" type="text" v-model="fileName" placeholder="File name" data-cy="filename"/>
        </p>
        <div style="display: flex; gap: 1em; align-items: center; padding-bottom: 1em">
          Number images
          <div class="icon" style="border: 1px solid hsl(var(--border));padding: 0" title="Number exported files" data-cy="number_images" aria-role="checkbox" @click="batchExport = !batchExport">
            <svg v-if="batchExport" title="check icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2" viewBox="0 0 16 16">
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
            </svg>
          </div>
        </div>

        <p v-if="rendering && imageUrls.length === 0">Rendering...</p>

        <div v-for="(imageUrl, i) in imageUrls" :key="i" style="padding: 1em 0">
          <div class="image-preview">
            <img :src="imageUrl" alt="Image Preview" />
          </div>
            <button
                style="width: 100%; display: flex; gap: 1em; justify-content: center; align-items: center"
                :class="{disabled: !imageUrl || !fileName}"
                @click="() => download(i)"
                title="Export circuit"
                :data-cy="`${fileName}${batchExport ? i : ''}.${options.fileType.value}`"
            >
              <div class="icon" style="color: var(--background); padding: 0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>
              </div>
              <div>
                [[# fileName #]]<span v-if="batchExport">[[# i #]]</span>.[[# options.fileType.value #]]
              </div>
            </button>
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
  height: 10em;
  margin-top: 1em;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-preview img{
  max-width: 100%;
  max-height: 100%;
}

</style>
