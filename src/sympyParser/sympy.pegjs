// Sympy Expression grammar (approx). Converts to tex strings

{
    const flat = options.flat ?? false;
    const crop = options.crop ?? false;
    const brackets = {
        l: flat ? '(' : '\\left(',
        r: flat ? ')' : '\\right)',
        lvert: flat ? '\\lvert' : '\\left\\lvert',
        rvert: flat ? '\\rvert' : '\\right\\rvert',
        lceil: flat ? '\\lceil' : '\\left\\lceil',
        rceil: flat ? '\\rceil' : '\\right\\rceil',
        lfloor: flat ? '\\lfloor' : '\\left\\lfloor',
        rfloor: flat ? '\\rfloor' : '\\right\\rfloor',
    }

    const displaySqrt = function (n, x) {
        if (typeof n === "undefined") {
            return flat ? '\\sqrt{}' + brackets.l + x + brackets.r : ` {\\sqrt{${x}}} `
        }
        return flat ? `\\sqrt[${n}]{}` + brackets.l + x + brackets.r : ` {\\sqrt[${n}]{${x}}} `
    }
}

// Todo: can't backtrack to logicalExp --> include lookahead to determine which is picked?
// todo: can we get logical exp nested inside a mathexp? eg in a summation boundary?
//Expression = MathExpr / LogicalExpr

MathExpr = AddExpr

// Inline function precedence: **, *, /, +, -
AddExpr "additive"
  = head:MultExpr tail:(_ ("+" / "-") _ MultExpr)* {
      if (crop && tail.length > 0) {
        return head + tail[0][1] + '...'
      }
      return tail.reduce(function(result, element) {
        if (element[1] === "+") { return `${result} + ${element[3]}`; }
        if (element[1] === "-") { return `${result} - ${element[3]}`; }
      }, head);
    }

MultExpr "multiplicative"
  = head:ExpExpr tail:(_ ("*" / "/") _ ExpExpr)* {
      if (crop && tail.length > 0) {
        return head + tail[0][1] + '...'
      }
      return tail.reduce(function(result, element) {
        if (element[1] === "*") { return `${result} \\cdot ${element[3]}`; }
        if (element[1] === "/") {
            if (flat) { return `${result} / ${element[3]}`; }
            return `\\frac{${result}}{${element[3]}}`;
        }
      }, head);
    }

ExpExpr "exponential"
  = head:Factor tail:(_ "**" _ Factor)* {
      if (crop && tail.length > 0) {
        return `${head}^{...}`
      }
      return tail.reduce(function(result, element) {
        return `${result}^{${element[3]}}`;
      }, head);
    }

// Any other bracketed expression, literal or explicit op
Factor
  = "(" _ expr:MathExpr _ ")" { return brackets.l + expr + brackets.r; }
  / Functions
  / Terminals

// Funtions
Functions =
  func:(UnarySpecialFunction / BinarySpecialFunction / Sum / Product / NaryFunction) {return func}

UnarySpecialFunction "special unary func"
    = _ "-" _ expr:Factor {return '-' + expr} // Unary -
	/ "Abs" "(" _ expr:MathExpr _ ")" {return brackets.lvert + expr + brackets.rvert}
	/ "ceiling" "(" _ expr:MathExpr _ ")" {return brackets.lceil+ expr + brackets.rceil}
	/ "floor" "(" _ expr:MathExpr _ ")" {return brackets.lfloor + expr + brackets.rfloor}
    / "factorial" "(" _ expr:MathExpr _ ")" {return brackets.l + expr + brackets.r + '!'}
    / "factorial2" "(" _ expr:MathExpr _ ")" {return brackets.l + expr + brackets.r + '!!'}

Sum "Big Sigma"
    = "Sum" "(" _ f:MathExpr _ "," _ "(" _ i:MathExpr _ "," _ a:MathExpr _ "," _ b:MathExpr _ ")" _ ")" {
        if (flat) {return `${brackets.l} \\sum {}_{${i} = ${a}}^{${b}} \\; ${f}${brackets.r}`}
        return `${brackets.l} \\sum_{${i} = ${a}}^{${b}} ${f}${brackets.r}`
    }

Product "Big Pi"
    = "Product" "(" _ f:MathExpr _ "," _ "(" _ i:MathExpr _ "," _ a:MathExpr _ "," _ b:MathExpr _ ")" _ ")" {
        if (flat) {return `${brackets.l} \\prod {}_{${i} = ${a}}^{${b}} \\; ${f}${brackets.r}`}
        return `${brackets.l} \\prod_{${i} = ${a}}^{${b}} ${f}${brackets.r}`
    }

// Note: order is important for parsing (eg atan2 must be before atan since matching is greedy)
FuncNames "function name"
    = name:(
        "periodic_argument"
        / "asinh" / "acosh" / "sech"
        / "asin" / "acsc" / "acos" / "asec" / "atan2" / "atan" / "acot"
        / "sinh" / "cosh" / "tanh" / "coth" / "csch"
        / "sin" / "csc" / "cos" / "sec" / "cot"
        / "re" / "im" / "sign" / "arg" / "conjugate"/ "polar_lift" / "frac"
        / "exp" / "log" / "Min" / "Max"
    ) {return name}

ArbFuncNames "arbitrary function name" = _ [a-z]i+ { return `{${text()}}` }

BinarySpecialFunction "nth-root"
	= "sqrt(" _ expr:MathExpr _ ")" {return displaySqrt(undefined, expr)}
	/ "cbrt(" _ expr:MathExpr _ ")" {return displaySqrt(3, expr)}
	/ "root(" _ x:MathExpr _ "," n:MathExpr _ ")" {return displaySqrt(n, x)}

NaryFunction "named functions"
    = name:(FuncNames / ArbFuncNames) "(" _ insides: (MathExpr|.., _ "," _|) _ ")" {
        if (crop) {
            return `\\mathrm{${name}}${brackets.l}${insides[0]}${insides.length > 1 ? ', ...' : ''}${brackets.r}`
        }
        return `\\mathrm{${name}}${brackets.l}${insides}${brackets.r}`
    }
