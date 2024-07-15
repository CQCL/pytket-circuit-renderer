// Sympy Expression grammar (approx). Converts to tex strings
// Sets and logical ops
LogicalExpr "logical expression" =
    _ head:LogicalSubExpr tail:(_ ("&" / "|" / "^") _ LogicalSubExpr)* {
      return tail.reduce(function(result, element) {
          if (element[1] === "&") {return `${result} \\wedge ${element[3]}`; }
          if (element[1] === "|") {return `${result} \\vee ${element[3]}`; }
          if (element[1] === "^") {return `${result} \\oplus ${element[3]}`; }
        } , head)
    }

LogicalSubExpr =
    "(" _ expr:LogicalExpr _ ")" { return brackets.l + expr + brackets.r; }
    / "~" _ expr:LogicalExpr { return `\\neg ${expr}`; }
    / "Implies(" _ expr1:LogicalExpr _ "," _ expr2:LogicalExpr _ ")" {return expr1 + "\\implies" + expr2}
    / "Equivalent(" _ expr1:LogicalExpr _ "," _ expr2:LogicalExpr _ ")" {return expr1 + "\\equiv" + expr2}
    / True
    / False
    / Variable

// Logical terminals
True = _ "True" {return "\\top"}
False = _ "False" {return "\\bot"}
