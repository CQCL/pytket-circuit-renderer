// Sympy Expression grammar (approx). Converts to tex strings
// Leaf types

Terminals =
  term:(Float / Integer / GreekLetter / SpecialSymbol / Variable) {return term}

GreekLetter "greek_letters"
	= _ letter:(
        "alpha" / "beta" / "gamma" / "delta" / "epsilon" / "zeta" / "eta" / "theta" / "iota" / "kappa"
        / "lamda" / "mu" / "nu" / "xi" / "omicron" / "pi" / "rho" / "sigma" / "tau" / "upsilon"
        / "phi" / "chi" / "psi" / "omega"
        // Capitals
        / "Alpha" / "Beta" / "Gamma" / "Delta" / "Epsilon" / "Zeta" / "Eta" / "Theta" / "Iota" / "Kappa"
        / "Lamda" / "Mu" / "Nu" / "Xi" / "Omicron" / "Pi" / "Rho" / "Sigma" / "Tau" / "Upsilon"
        / "Phi" / "Chi" / "Psi" / "Omega"
    ) {return `\\${letter}`}

SpecialSymbol "special symbols"
    = "oo" {return '\\infty'}
    / "EmptySet" {return '\\emptyset'}

Integer "int" = _ [0-9]+ { return parseInt(text(), 10).toString(); }

Float "float" = _ [0-9]* "." [0-9]+ { return parseFloat(text(), 10).toString(); }

Variable "var" = _ [a-z]i+ { return `{${text()}}` }

_ "whitespace"
  = [ \t\n\r]*