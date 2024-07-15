import sympyParser from '@/sympyParser/sympy'

// todo: symbolic matrices??
// options: {
//   crop: boolean - whether to try to crop the math expression
//   flat: boolean - attempt to create maths that fits on a single line
// }
export const coerceSympyTex = function (formula, options) {
  try {
    const parsed = sympyParser.parse(formula, options)
    console.log("PARSING SUCCESS", formula, "->", parsed)
    return parsed
  } catch (e) {
    if (typeof e.format === "function") {
      console.warn("PARSING ERROR", formula, e.format([]))
    } else console.warn("PARSING ERROR", formula, e)

    // Escape the original formula as plaintext.
    return `\\text{${formula}}`
  }
}
