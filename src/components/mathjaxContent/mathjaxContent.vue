<script>
// Vue wrapper for Mathjax.
// Must use this if the formula can change dynamically.
import './mathjaxLoader'
import { renderOptions } from "@/components/circuitDisplay/provideKeys";

let nMJC = 0

export default {
  name: 'mathjax-content',
  delimiters: ['[[#', '#]]'],
  props: {
    formula: { type: String, default: '' },
    fallback: { type: String, default: undefined },
    safe: { type: Boolean, default: true },
    inlineCircuit: { type: Boolean, default: false },
  },
  inject: {
    interpretMath: { from: renderOptions.interpretMath },
  },
  data () {
    nMJC++
    return {
      uid: 'mathjax-content-' + nMJC
    }
  },
  watch: {
    shouldReRender () {
      this.renderMathJax()
    },
    formula () {
      this.renderMathJax()
    }
  },
  mounted () {
    this.renderMathJax()
  },
  computed: {
    isRenderingMath () {
      return this.interpretMath || !this.fallback
    },
    shouldReRender () {
      return this.isRenderingMath ? this.formula : this.fallback
    }
  },
  methods: {
    renderContent () {
      if (this.isRenderingMath) {
        if (this.safe) {
          this.$refs.mathJaxEl.textContent = this.formula
        } else {
          this.$refs.mathJaxEl.innerHTML = this.formula
        }
      }
    },
    renderMathJax () {
      if (this.isRenderingMath) {
        this.renderContent()
        if (!!window.MathJax && !!window.MathJax.typeset) {
          window.MathJax.typeset(['[data-uid=' + this.uid + ']'])
        }
      }
    }
  }
}
</script>

<template>
  <span v-show="isRenderingMath" ref="mathJaxEl" :data-uid="uid" :class="['mathjax-content', {'inline-circuit-mathjax': inlineCircuit} ]">
      [[# formula #]]
  </span>
  <span v-show="!isRenderingMath" :data-uid="uid">
      [[# fallback #]]
  </span>
</template>

<style>
.inline-circuit-mathjax{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
/* Override default styles */
.mathjax-content > mjx-container[jax="CHTML"][display="true"] {
  text-align: inherit;
  margin: 0;
  overflow: auto;
}

</style>
