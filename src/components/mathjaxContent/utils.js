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

// todo: can't really escape need for a parser: named functions need added brackets to stay as functions...
export const coerceSympyAsciimath = function (formula) {
  // Recognised functions get put in quotemarks.
  // Apply function translations
  const regex = new RegExp(FUNCTIONS.join('|'), 'g')
  let coerced = formula.replaceAll(regex, '"$&"')
  for (const [match, replacement] of TRANSLATIONS_ASCIIMATH) {
    coerced = coerced.replaceAll(match, replacement)
  }
  console.log(formula, '->', coerced)
  return coerced
}
