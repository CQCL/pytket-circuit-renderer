import { provide } from 'vue'
import MathjaxContent from './mathjaxContent.vue'
import { renderOptions } from '@/components/circuitDisplay/provideKeys'
import sympyParser from '@/sympyParser/sympy'

export default {
  components: { MathjaxContent },
  title: 'Mathjax',
  component: MathjaxContent,
  excludeStories: [],
  args: {
    interpretMath: true,
    inlineCircuit: true,
    formula: '$$\\pi$$'
  }
}

export const Default = (args) => ({
  components: { MathjaxContent },
  setup () {
    provide(renderOptions.interpretMath, args.interpretMath)
    return { formula: args.formula, inlineCircuit: args.inlineCircuit }
  },
  template: `
    <div class="theme-mode-light">
      <div class="circuit-display-container theme_variables">
          <mathjax-content 
              :formula="formula" 
              :fallback="formula" 
              :inline-circuit="inlineCircuit"
          />
      </div>
    </div>`
})

export const WithParser = (args) => ({
  components: { MathjaxContent },
  setup () {
    provide(renderOptions.interpretMath, args.interpretMath)
    let parsedFormula = ''
    let parseError = false
    try {
      parsedFormula = sympyParser.parse(args.formula, {
        crop: args.crop,
        flat: args.flat
      })
    } catch (e) {
      parseError = e
    }
    return { formula: args.formula, parsedFormula, parseError, inlineCircuit: args.inlineCircuit }
  },
  template: `
    <div class="theme-mode-light">
      <div class="circuit-display-container theme_variables">
          <div style="display: flex; gap: 1em; flex-direction: column; padding: 2em">
            <div>SOURCE:</div>
            <div style="color: var(--text-primary)">{{ formula }}</div>
            <div>RESULT:</div>
            <div style="color: var(--text-primary)">{{ parsedFormula }}</div>
            <div>ERRORS:</div>
            <div style="color: var(--text-primary)">{{ parseError }}</div>
            <div>DISPLAY:</div>
            <div style="color: var(--text-primary)">
              <mathjax-content
                  :formula="'$$' + parsedFormula + '$$'" 
                  :fallback="formula" 
                  :inline-circuit="inlineCircuit"
              />
            </div>
          </div>
      </div>
    </div>`
})
WithParser.args = {
  formula: 'cosh(phi)',
  crop: true,
  flat: true
}
