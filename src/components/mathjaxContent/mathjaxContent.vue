<script>
// Vue wrapper for Mathjax.
// Must use this if the formula can change dynamically.
import './mathjaxLoader'

let nMJC = 0

export default {
  name: 'mathjax-content',
  delimiters: ['[[#', '#]]'],
  props: {
    formula: { type: String, default: '' },
    safe: { type: Boolean, default: true }
  },
  data () {
    nMJC++
    return {
      uid: 'mathjax-content-' + nMJC
    }
  },
  watch: {
    formula () {
      this.renderMathJax()
    }
  },
  mounted () {
    this.renderMathJax()
  },
  methods: {
    renderContent () {
      if (this.safe) {
        this.$refs.mathJaxEl.textContent = this.formula
      } else {
        this.$refs.mathJaxEl.innerHTML = this.formula
      }
    },
    renderMathJax () {
      this.renderContent()
      if (!!window.MathJax && !!window.MathJax.typeset) {
        window.MathJax.typeset(['[data-uid=' + this.uid + ']'])
      }
    }
  }
}
</script>

<template>
  <span ref="mathJaxEl" :data-uid="uid" class="mathjax-content">
      [[# formula #]]
  </span>
</template>

<style>
/* Override default styles */
.mathjax-content > mjx-container[jax="CHTML"][display="true"] {
  text-align: inherit;
  margin: 0;
  overflow: auto;
}

</style>
