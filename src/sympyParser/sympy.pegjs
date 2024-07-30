// Sympy Expression grammar (approx). Converts to tex strings
{{/* eslint-disable */}}

{
    const flat = options.flat ?? false;
    const crop = options.crop ?? false;
    const brackets = {
        l: flat ? '(' : '\\left(',
        r: flat ? ')' : '\\right)',
        lvert: flat ? '\\lvert' : '\\left\\lvert',
        mvert: flat ? '|' : '\\middle|',
        rvert: flat ? '\\rvert' : '\\right\\rvert',
        lceil: flat ? '\\lceil' : '\\left\\lceil',
        rceil: flat ? '\\rceil' : '\\right\\rceil',
        lfloor: flat ? '\\lfloor' : '\\left\\lfloor',
        rfloor: flat ? '\\rfloor' : '\\right\\rfloor',
        lcurly: flat ? '\\{' : '\\left\\{',
        rcurly: flat ? '\\}' : '\\right\\}',
    }

    const displaySqrt = function (n, x) {
        if (typeof n === "undefined") {
            return flat ? '\\sqrt{}' + brackets.l + x + brackets.r : ` {\\sqrt{${x}}} `
        }
        return flat ? `\\sqrt[${n}]{}` + brackets.l + x + brackets.r : ` {\\sqrt[${n}]{${x}}} `
    }
}

// todo: fallback not working properly to catch logical/set expressions if best match looks like a variable?
// todo: can we get logical exp nested inside a mathexp? eg in a summation boundary?
Expression =
    MathExpr
    / LogicalExpr
    / SetExpr
