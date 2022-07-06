import {CONTROLLED_OPS} from "./consts";

const registerEquality = function (reg1, reg2) {
    return JSON.stringify(reg1) === JSON.stringify(reg2);
}

// Deal with potentially condensed classical wires
const getIndexedArgs = function () {
  let nClassicalBits = 0;
  let classicalBitsPos = [];
  let classicalBits = [];

  let indexedArgs = this.args.map((arg, i) => {
    let pos = this.command.args.findIndex(reg => registerEquality(reg, arg));
    let classical = this.isClassicalWire(arg);
    if (classical) {
      classicalBits.push(arg);
      if (pos > -1) {
        nClassicalBits ++;
        classicalBitsPos.push(pos);
      }
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
      },
    };
  });

  // Add condensed classical register if relevant
  if (nClassicalBits > 0) {
    indexedArgs.push({
      name: ["C", [nClassicalBits]],
      pos: classicalBitsPos,
      order: this.command.args.length - nClassicalBits,
      bits: classicalBits,
      flags: {
        first: this.command.args.length - nClassicalBits === 0,
        last: true, // bits displayed after qubits.
        single: this.command.args.length === nClassicalBits,
        classical: true,
        condensed: true,
      },
    });
  }
  return indexedArgs;
}

const renderIndexedArgs = function () {
  return this.indexedArgs.reduce((filtered, arg) => {
    if (this.renderOptions.condenseCBits) {
      if (arg.flags.condensed || !arg.flags.classical) filtered.push(arg);
    } else {
      if (!arg.flags.condensed) filtered.push(arg);
    }
    return filtered;
  }, []);
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
const extractControlledCommand = function (controlledCommand) {
  function convert (command) {
    // Generate a command for the nested op.
    // Overload for when we only care about the op, and set args to false.
    if (["CX", "CY", "CZ", "CH", "CSWAP",
      "CRx", "CRy", "CRz", "CU1", "CU3",
      "CV", "CVdg", "CSx", "CSXdg"].includes(command.op.type)) {
      return {
        op: {
          type: command.op.type.slice(1),
          params: command.op.params,
        },
        args: command.args ? command.args.slice(1) : false,
      };
    }
    if (command.op.type === "CCX") {
      return {
        op: {type: "X"},
        args: command.args ? command.args.slice(2) : false,
      };
    }
    if (["CnRy", "CnX"].includes(command.op.type)) {
      return {
        op: {
          type: command.op.type.slice(2),
          params: command.op.params
        },
        args: command.args ? [command.args[command.args.length - 1]] : false,
      };
    }
    if (["Control", "QControlBox"].includes(command.op.type)) {
      return {
        op: command.op.box.op,
        args: command.args ? command.args.slice(command.op.box.n_controls) : false,
      }
    }
    if (["Condition", "Conditional"].includes(command.op.type)) {
      return {
        op: command.op.conditional.op,
        args: command.args ? command.args.slice(command.op.conditional.width) : false
      }
    }
    return {op: {type: "Unknown"}, args: command.args ? [] : false};
  }

  let cc = { ...controlledCommand};
  while (CONTROLLED_OPS.includes(cc.op.type)) {
    cc = convert(cc);
  }

  return cc;
}


export {
  registerEquality,
  getIndexedArgs,
  renderIndexedArgs,
  extractSubCircuit,
  extractControlledCommand,
};
