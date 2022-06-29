import {CONTROLLED_OPS} from "./consts";

const registerEquality = function (reg1, reg2) {
    return JSON.stringify(reg1) === JSON.stringify(reg2);
}

// Deal with potentially condensed classical wires. Granularity is by register name.
const getIndexedArgs = function () {
  let nClassicalBits = 0;
  let classicalBitsPos = { global: [], names: {} };
  let classicalBitsOrder = {};
  let classicalBits = { global: [], names: {} };

  let indexedArgs = this.args.map((arg, i) => {
    const argName = arg[0];
    const pos = this.command.args.findIndex(reg => registerEquality(reg, arg));
    const classical = this.isClassicalWire(arg);
    if (classical) {
      if (!classicalBits.names[argName]) {
        classicalBits.names[argName] = [];
        classicalBitsPos.names[argName] = [];
        classicalBitsOrder[argName] = i;
      }
      classicalBits.global.push(arg);
      classicalBits.names[argName].push(arg);
      if (pos > -1) {
        nClassicalBits ++;
        classicalBitsPos.global.push(pos);
        classicalBitsPos.names[argName].push(pos);
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
        globalClassical: false,
      },
    };
  });

  // Add condensed classical register if relevant
  if (nClassicalBits > 0) {
    for (let registerName of Object.keys(classicalBits.names)) {
      const nBits = classicalBits.names[registerName].length
      indexedArgs.push({
        name: [registerName, [nBits]],
        pos: classicalBitsPos.names[registerName].length > 0 ? classicalBitsPos.names[registerName] : -1,
        order: classicalBitsOrder[registerName],
        bits: classicalBits.names[registerName],
        flags: {
          first: classicalBitsOrder[registerName] === 0,
          last: classicalBitsOrder[registerName] >= this.args.length - nBits,
          single: this.args.length === nBits,
          classical: true,
          condensed: true,
          globalClassical: false,
        },
      });
    }
    // Global register
    indexedArgs.push({
      name: ["C", [nClassicalBits]],
      pos: classicalBitsPos.global,
      order: this.args.length, // classical bits are always last in display order
      bits: classicalBits.global,
      flags: {
        first: this.command.args.length - nClassicalBits === 0,
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
