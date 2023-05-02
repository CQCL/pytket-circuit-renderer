<script>
import mathjaxContent from '@/components/mathjaxContent/mathjaxContent'

export default {
  name: 'chart-matrix',
  delimiters: ['[[#', '#]]'],
  components: {
    mathjaxContent
  },
  props: {
    depth: { type: Number, default: 2 },
    matrix: { type: Array, required: true },
    entryType: { type: String, required: true },
    displayTitle: { type: Boolean, default: true }
  },
  computed: {
    mathjaxMatrixString () {
      // Assume complex numbers by default
      let numToStr = this.formatComplexNumber
      if (this.entryType === 'bool') {
        numToStr = (num) => num.toString()
      }
      if (this.entryType === 'boolStr') {
        numToStr = (boolStr) => boolStr ? '1' : '0'
      }

      const flattenRow = (row) => {
        return row.reduce((prev, next, i) => {
          return `${prev} ${i === 0 ? '' : '&'} ${numToStr(next)}`
        }, '')
      }
      const stackRows = (rows) => {
        return rows.reduce((prev, next) => {
          return `${prev} \\\\ ${next}`
        })
      }
      const wrapMatrix = (matrixType, matrixInsides) => `\\begin{${matrixType}} ${matrixInsides} \\end{${matrixType}}`
      // depth tells us how far to recurse to find the base entries.
      if (this.depth === 1) {
        // Vector
        return `$$ ${wrapMatrix('bmatrix', flattenRow(this.matrix))} $$`
      } else if (this.depth === 3) {
        // 3D matrix
        return `$$ ${wrapMatrix('matrix', stackRows(this.matrix.map((matrix2D) => {
            return wrapMatrix('bmatrix', stackRows(matrix2D.map(flattenRow)))
        })))} $$`
      } else { // default treat as 2D
        // 2D matrix
        return `$$ ${wrapMatrix('bmatrix', stackRows(this.matrix.map(flattenRow)))} $$`
      }
    }
  },
  methods: {
    formatComplexNumber (num) {
      const [real, imag] = num
      const strImag = imag === 0 ? '' : (Math.abs(imag) === 1 ? 'i' : Math.round(Math.abs(imag) * 1000) / 1000 + 'i')
      const strReal = real === 0 ? '' : Math.round(real * 1000) / 1000
      let sign = real === 0 && imag === 0 ? '0' : (real * imag !== 0 ? ' + ' : '')
      // if both parts are defined, move imag's sign to sign.
      if (imag < 0) sign = ' - '

      return `${strReal}${sign}${strImag}`
    }
  }
}
</script>

<template>
  <div>
    <h4 v-if="displayTitle">Matrix</h4>
    <mathjax-content :formula="mathjaxMatrixString" content-id="tooltip-mathjax" >
    </mathjax-content>
  </div>
</template>
