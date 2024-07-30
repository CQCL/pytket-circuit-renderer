// Sets
SetExpr = SetFunctionExpr / SetComprehension / ExplicitSet / NamedSet

// Functions over sets
NamedSetFunctions =
    "Union" / "Intersection" / "ProductSet" / "Complement" / "SymmetricDifference" / "DisjointUnion" / "PowerSet"
SetFunctionExpr = _ name:NamedSetFunctions "(" _ sets:(SetExpr|.., _ "," _|) _ ")" {
  if (name === "Union") { return sets.join(" \\cup ")}
  if (name === "Intersection") { return sets.join(" \\cap ")}
  if (name === "ProductSet") { return sets.join(" \\times ")}
  if (name === "Complement") { return sets.join(" \\setminus ")}
  if (name === "SymmetricDifference") { return sets.join(" \\oplus ")}
  if (name === "DisjointUnion") { return sets.join(" \\sqcup ")}
  if (name === "PowerSet") { return `\\mathcal{P} ${brackets.l} ${sets.join(" , ")} ${brackets.r}`}
  return `${name}( ${sets.join(", ")} )`
}

// Set comprehensions
SetComprehension =
    "ImageSet" _ "(" _ "Lambda(" sig:LambdaSignature _ "," _ func:MathExpr ")" _"," _ origin:SetExpr _ ")" {
      return `${brackets.lcurly} ${func} \\; ${brackets.mvert} \\; ${sig} \\in ${origin} ${brackets.rcurly}`
    }
LambdaSignature "Lambda Signature" =
    "(" _ sig: (Variable|.., _ "," _|) _ ")" {return sig.join(', ')}
    / Variable

// Enumerated sets
TupleExpr = "(" _ sig: (MathExpr|.., _ "," _|) _ ")" {return brackets.l + sig.join(', ') + brackets.r}
ExplicitSet "Explititly enumerated set" =
    "{" _ insides: ((MathExpr / TupleExpr)|.., _ "," _|) _ "}" { return brackets.lcurly + insides + brackets.rcurly}

// Standard sets
NamedSet "Named Set" = namedSet:(
    EmptySet / UniversalSet / Complexes / Reals / Rationals / Integers / Naturals0 / Naturals / Variable
  ) {return namedSet}

EmptySet = "EmptySet" {return '\\emptyset'}
UniversalSet = "UniversalSet" {return '\\mathfrak{U}'}

Complexes = "Complexes" {return '\\mathbb{C}'}
Reals = "Reals" {return '\\mathbb{R}'}
Rationals = "Rationals" {return '\\mathbb{Q}'}
Integers = "Integers" {return '\\mathbb{Z}'}
Naturals = "Naturals" {return '\\mathbb{N}'}
Naturals0 = "Naturals0" {return '\\mathbb{N}_0'}
