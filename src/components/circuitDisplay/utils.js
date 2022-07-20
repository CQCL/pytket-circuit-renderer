import {CONTROLLED_OPS} from "./consts";

const registerEquality = function (reg1, reg2) {
    return JSON.stringify(reg1) === JSON.stringify(reg2);
}

// Deal with potentially condensed classical wires. Granularity is by register name.
const getIndexedArgs = function () {
  let nClassicalBits = 0;
  let classicalBitsPos = { global: [], names: {} };
  let classicalBitsOrder = {global: undefined, names: {}};
  let classicalBits = { global: [], names: {} };

  let indexedArgs = this.args.map((arg, i) => {
    const argName = arg[0];
    const pos = this.command.args.findIndex(reg => registerEquality(reg, arg));
    const classical = this.isClassicalWire(arg);
    if (classical) {
      if (!classicalBits.names[argName]) {
        classicalBits.names[argName] = [];
        classicalBitsPos.names[argName] = [];
        classicalBitsOrder.names[argName] = i;
      }
      if (typeof classicalBitsOrder.global === "undefined") classicalBitsOrder.global = i;
      if (pos > -1) nClassicalBits ++;  // Count number of classical bits that actually feature in the command.
      classicalBits.global.push(arg);
      classicalBitsPos.global.push(pos);
      classicalBits.names[argName].push(arg);
      classicalBitsPos.names[argName].push(pos);
    }
    return {
      name: arg,
      pos: pos, // index of this arg in the command
      order: i, // index of this arg in the display order
      flags: {
        first: i === 0,
        last: i === this.args.length - 1,
        single: this.command.args.length === 1,
        classical: classical,
        condensed: false,
        globalClassical: false,
      },
    };
  });

  // Add condensed classical register if relevant.
  if (nClassicalBits > 0) {
    for (let registerName of Object.keys(classicalBits.names)) {
      const nBits = classicalBits.names[registerName].length
      indexedArgs.push({
        name: [registerName, [nBits], "condensed"],
        pos: classicalBitsPos.names[registerName].filter(pos => pos > -1).length > 0 ? classicalBitsPos.names[registerName] : -1,
        order: classicalBitsOrder.names[registerName],
        bits: classicalBits.names[registerName],
        flags: {
          first: classicalBitsOrder.names[registerName] === 0,
          last: classicalBitsOrder.names[registerName] >= this.args.length - nBits,
          single: this.args.length === nBits,
          classical: true,
          condensed: true,
          globalClassical: false,
        },
      });
    }
    // Global register
    indexedArgs.push({
      name: ["Global Classical", ['n'], "condensed"],
      pos: classicalBitsPos.global,
      order: classicalBitsOrder.global,
      bits: classicalBits.global,
      flags: {
        first: classicalBitsOrder.global === 0,
        last: true, // bits displayed after qubits.
        single: this.command.args.length === nClassicalBits,
        classical: true,
        condensed: true,
        globalClassical: true,
      },
    });
  }
  // Need to sort the args according to order to ensure condensed registers are in the right place:
  indexedArgs.sort((arg1, arg2) => arg1.order - arg2.order);
  return indexedArgs;
}

const renderIndexedArgs = function () {
  return this.indexedArgs.filter((arg) => {
    return arg.flags.classical
      ? (
        this.renderOptions.condenseCBits
          ? arg.flags.globalClassical  // Condensing to a single global classical wire
          : this.condensedRegisters[arg.name[0]]  // Check if this particular register is to be condensed.
            ? arg.flags.condensed : !arg.flags.condensed
      ) : true;  // Quantum wire
  });
}

// Deal with nested circuits.
const extractSubCircuit = function (operation) {
  if (["Custom", "CustomGate", "Composite", "CompositeGate"].includes(operation.type)) {
    return operation.box.gate.definition;
  }
  if (operation.type === 'CircBox') {
    return operation.box.circuit;
  }
  return false;
}

// Controlled commands
const extractControlledCommand = function (controlCommand, controlArgs) {
  function convert (command, args) {
    // Generate a command for the nested op.
    // Overload for when we only care about the op, and set args to false.
    if (["CX", "CY", "CZ", "CH", "CSWAP",
      "CRx", "CRy", "CRz", "CU1", "CU3",
      "CV", "CVdg", "CSx", "CSXdg"].includes(command.op.type)) {
      args.push(command.args[0]);
      return {
        cc: {
          op: {
            type: command.op.type.slice(1),
            params: command.op.params,
          },
          args: command.args ? command.args.slice(1) : false,
        },
        ca: args,
      };
    }
    if (command.op.type === "CCX") {
      args.push(...command.args.slice(0, 2));
      return {
        cc: {
          op: {type: "X"},
          args: command.args ? command.args.slice(2) : false,
        },
        ca: args,
      };
    }
    if (["CnRy", "CnX"].includes(command.op.type)) {
      args.push(...command.args.slice(0, command.args.length - 1));
      return {
        cc: {
          op: {
            type: command.op.type.slice(2),
            params: command.op.params
          },
          args: command.args ? [command.args[command.args.length - 1]] : false,
        },
        ca: args,
      };
    }
    if (["Control", "QControlBox"].includes(command.op.type)) {
      args.push(...command.args.slice(0, command.op.box.n_controls));
      return {
        cc: {
          op: command.op.box.op,
          args: command.args ? command.args.slice(command.op.box.n_controls) : false,
        },
        ca: args,
      }
    }
    if (["Condition", "Conditional"].includes(command.op.type)) {
      args.push(...command.args.slice(0, command.op.conditional.width));
      return {
        cc: {
          op: command.op.conditional.op,
          args: command.args ? command.args.slice(command.op.conditional.width) : false
        },
        ca: args,
      }
    }
    return {cc: {op: {type: "Unknown"}, args: command.args ? [] : false}, ca: args};
  }

  let converting = {
    cc: { ...controlCommand},
    ca: [...controlArgs],
  };
  while (CONTROLLED_OPS.includes(converting.cc.op.type)) {
    converting = convert(converting.cc, converting.ca);
  }

  return {command: converting.cc, controlArgs: converting.ca};
}

// Classical Expression
const formatClassicalExp = function (expression) {
      let formattedArgs = [];
      for (let arg of expression.args) {
        if (typeof arg == "number") formattedArgs.push(arg);  // constant
        else if (Array.isArray(arg)) formattedArgs.push(`${arg[0]}[${arg[1][0]}]`);  // bit
        else if ("name" in arg) formattedArgs.push(arg.name);  // bit register
        else formattedArgs.push(this.formatClassicalExp(arg));  // recursive expression
      }
      // Now get the operation display name
      const op = expression.op.split(".");
      const operation = (op.length > 1) ? op[1] : op[0];
      const n = formattedArgs.length;

      // Display the operation differently based on the number of arguments involved
      // This is so we can write binary operations infix, and omit the brackets for unary or constant operations
      if (n === 0) return operation;  // -> op
      else if (n === 1) return `${operation} ${formattedArgs[0]}`;  // -> op exp
      else if (n === 2) return `(${formattedArgs[0]} ${operation} ${formattedArgs[1]})`;  // -> (exp op exp)
      else return `${operation}(${formattedArgs})`;  // -> op(exp, ... exp)
    }

// Display register index in command
const formatPosStr = function (argPos, posAdjust) {
  if (typeof posAdjust === "undefined") posAdjust = 0;
  if (Array.isArray(argPos)) {
    return argPos.map(pos => pos == -1 ? '-' : (pos + posAdjust)).join(' ');
  }
  return argPos + posAdjust;
}

export {
  registerEquality,
  getIndexedArgs,
  renderIndexedArgs,
  extractSubCircuit,
  extractControlledCommand,
  formatClassicalExp,
  formatPosStr,
};
