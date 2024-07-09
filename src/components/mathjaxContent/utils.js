// Sympy to mathjax friendly coersion
// Upgrade special symbols and (basic) functions
const SYMBOLS = [
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lamda', 'mu', 'nu', 'xi',
  'omicron', 'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega'
]
const FUNCTIONS = [
  'asinh', 'acosh', 'atanh', 'acoth', 'asech', 'acsch',
  'asin', 'acos', 'atan2', 'atan', 'acot', 'asec', 'acsc',
  'sinc',
  're', 'im', 'sign', 'arg', 'conjugate'
]
const TRANSLATIONS_ASCIIMATH = [
  ['Abs', 'abs'],
  ['ceiling', 'ceil'],
  ['cbrt', 'root(3)'],
  ['**', '^']
]

// todo: symbolic matrices
// todo: proper parser
export const coerceSympyAsciimath = function (formula) {
  // Recognised functions get put in quotemarks.
  // This is intended as an intermediate measure before we have a custom parser.
  const regex = new RegExp(FUNCTIONS.join('|'), 'g')
  let coerced = formula.replaceAll(regex, '"$&"')
  for (const [match, replacement] of TRANSLATIONS_ASCIIMATH) {
    coerced = coerced.replaceAll(match, replacement)
  }
  return coerced
}
