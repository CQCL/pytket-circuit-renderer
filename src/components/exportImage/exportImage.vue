<script>
import domToImage from 'dom-to-image'

export default {
  name: 'export-image',
  emits: ['updated'],
  props: {
    defaultFileName: { type: String, required: false },
    elementToRender: { type: Object, required: true },
    baseDimensions: { type: Object, default: () => { return { width: false, height: false } } }

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
        bgcolor: this.options.fileType.value === 'jpeg' ? '#ffffff' : 'transparent',
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
    <div class="download-image-container" :class="{rendering: rendering}">
      <form>
        <div class="flex" v-for="(option, name) in options" :key="name">
          <span class="tab-option-label">[[# option.title #]]</span>
          <div class="flex tab-options">
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
        <div class="row">
          <button class="row-item button" :class="{disabled: typeof elementToRender === 'undefined'}" @click.prevent.stop="renderImage">
            Generate
          </button>
        </div>
      </form>
      <div>
        <h4>Image</h4>
        <div class="image-preview" v-if="!!imageUrl">
          <img :src="imageUrl" alt="Image Preview" />
        </div>
        <div class="flex">
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
.flex{
  display: flex;
}
.disabled{
  cursor: default !important;
  color: var(--mid-col) !important;
  background: var(--faint-col) !important;
}
.tab-options{
  border: 1px solid var(--accent-col-fill);
  box-shadow: 0 0 5px 0px var(--faint-col) inset;
  margin-bottom: 5px;
  flex-grow: 1;
  border-radius: 5px;
  overflow: hidden;
}
.tab-option-label{
  padding: 10px 10px 10px 0;
  width: 6em;
}
.tab-option{
  padding: 10px;
  flex-grow: 1;
  text-align: center;
  text-transform: capitalize;
}

.tab-option.selected{
  background: var(--accent-col-fill)
}

.extra-info{
  font-size: 0.8em;
}

.image-preview{
  width: 100%;
  height: 10em;
  margin: 1em 0;
}

.image-preview img{
  max-width: 100%;
  max-height: 100%;
}

</style>
