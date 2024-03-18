import { CONTROLLED_OPS } from './consts'

const registerEquality = function (reg1, reg2) {
  return JSON.stringify(reg1) === JSON.stringify(reg2)
}

// Deal with potentially condensed classical wires. Granularity is by register name.
const getIndexedArgs = function () {
  let nClassicalBits = 0
  const classicalBitsPos = { global: [], names: {} }
  const classicalBitsOrder = { global: undefined, names: {} }
  const classicalBits = { global: [], names: {} }

  const indexedArgs = this.args.map((arg, i) => {
    const argName = arg[0]
    const pos = this.command.args.findIndex(reg => registerEquality(reg, arg))
    const classical = this.isClassicalWire(arg)
    if (classical) {
      if (!classicalBits.names[argName]) {
        classicalBits.names[argName] = []
        classicalBitsPos.names[argName] = []
        classicalBitsOrder.names[argName] = i
      }
      if (typeof classicalBitsOrder.global === 'undefined') classicalBitsOrder.global = i
      if (pos > -1) nClassicalBits++ // Count number of classical bits that actually feature in the command.
      classicalBits.global.push(arg)
      classicalBitsPos.global.push(pos)
      classicalBits.names[argName].push(arg)
      classicalBitsPos.names[argName].push(pos)
    }
    return {
      name: arg,
      pos, // index of this arg in the command
      order: i, // index of this arg in the display order
      flags: {
        first: i === 0,
        last: i === this.args.length - 1,
        single: this.command.args.length === 1,
        classical,
        condensed: false,
        globalClassical: false
      }
    }
  })

  // Add condensed classical register if relevant.
  if (nClassicalBits > 0) {
    for (const registerName of Object.keys(classicalBits.names)) {
      const nBits = classicalBits.names[registerName].length
      indexedArgs.push({
        name: [registerName, [nBits], 'condensed'],
        pos: classicalBitsPos.names[registerName].filter(pos => pos > -1).length > 0 ? classicalBitsPos.names[registerName] : -1,
        order: classicalBitsOrder.names[registerName],
        bits: classicalBits.names[registerName],
        flags: {
          first: classicalBitsOrder.names[registerName] === 0,
          last: classicalBitsOrder.names[registerName] >= this.args.length - nBits,
          single: this.args.length === nBits,
          classical: true,
          condensed: true,
          globalClassical: false
        }
      })
    }
    // Global register
    indexedArgs.push({
      name: ['Global Classical', ['n'], 'condensed'],
      pos: classicalBitsPos.global,
      order: classicalBitsOrder.global,
      bits: classicalBits.global,
      flags: {
        first: classicalBitsOrder.global === 0,
        last: true, // bits displayed after qubits.
        single: this.command.args.length === nClassicalBits,
        classical: true,
        condensed: true,
        globalClassical: true
      }
    })
  }
  // Need to sort the args according to order to ensure condensed registers are in the right place:
  indexedArgs.sort((arg1, arg2) => arg1.order - arg2.order)
  return indexedArgs
}

const renderIndexedArgs = function () {
  return this.indexedArgs.filter((arg) => {
    return arg.flags.classical
      ? (
          this.condenseCBits
            ? arg.flags.globalClassical // Condensing to a single global classical wire
            : this.condensedRegisters[arg.name[0]] // Check if this particular register is to be condensed.
              ? arg.flags.condensed
              : !arg.flags.condensed
        )
      : true // Quantum wire
  })
}

// Deal with nested circuits.
const extractSubCircuit = function (operation) {
  if (['Custom', 'CustomGate', 'Composite', 'CompositeGate'].includes(operation.type)) {
    return operation.box.gate.definition
  }
  if (operation.type === 'CircBox') {
    return operation.box.circuit
  }
  return false
}

// Controlled commands
const extractControlledCommand = function (controlCommand, argDetails) {
  function convert (command, details) {
    const args = []
    let cc
    // Generate a command for the nested op.
    // Overload for when we only care about the op, and set args to false.
    if (['CX', 'CY', 'CZ', 'CH', 'CSWAP',
      'CRx', 'CRy', 'CRz', 'CU1', 'CU3',
      'CV', 'CVdg', 'CSX', 'CSXdg', 'CS', 'CSdg'].includes(command.op.type)) {
      args.push(command.args[0])
      cc = {
        op: {
          type: command.op.type.slice(1),
          params: command.op.params
        },
        args: command.args ? command.args.slice(1) : false
      }
    }
    if (command.op.type === 'CCX') {
      args.push(...command.args.slice(0, 2))
      cc = {
        op: { type: 'X' },
        args: command.args ? command.args.slice(2) : false
      }
    }
    if (['CnRy', 'CnX', 'CnY', 'CnZ'].includes(command.op.type)) {
      args.push(...command.args.slice(0, command.args.length - 1))
      cc = {
        op: {
          type: command.op.type.slice(2),
          params: command.op.params
        },
        args: command.args ? [command.args[command.args.length - 1]] : false
      }
    }
    if (['Control', 'QControlBox'].includes(command.op.type)) {
      args.push(...command.args.slice(0, command.op.box.n_controls))
      cc = {
        op: command.op.box.op,
        args: command.args ? command.args.slice(command.op.box.n_controls) : false
      }
    }
    if (['Condition', 'Conditional'].includes(command.op.type)) {
      args.push(...command.args.slice(0, command.op.conditional.width))
      cc = {
        op: command.op.conditional.op,
        args: command.args ? command.args.slice(command.op.conditional.width) : false
      }
    }
    const multi = ['MultiplexorBox', 'MultiplexedRotationBox', 'MultiplexedU2Box', 'MultiplexedTensoredU2Box'].includes(command.op.type)
    if (multi) {
      const width = command.op.box.op_map[0][0].length
      args.push(...command.args.slice(0, width))
      // Chop off 'Multiplexed/or' from the name.
      const controlledName = command.op.type.slice(11)
      cc = {
        op: { type: controlledName },
        args: command.args ? command.args.slice(width) : false
      }
    }
    // Mark control args
    if (details) {
      const controlState = command.op.box?.control_state ?? command.op.conditional?.value
      let bitstring = typeof controlState !== 'undefined' ? controlState.toString(2).padStart(args.length, '0') : false
      // Reverse if value was little-endian.
      if (command.op.type == 'Conditional' && bitstring) {
        bitstring = bitstring.split("").reverse().join("")
      }
      args.forEach((arg, i) => {
        if (arg in details) details[arg].control = true
        else details[arg] = { control: true }
        // Mark the value of the control bit. Use -1 for multiplexed controls.
        details[arg].value = multi ? -1 : bitstring === false ? 1 : parseInt(bitstring[i]) // default is 1 for backwards compatibility.
      })
    }

    return { cc: cc || { op: { type: 'Unknown' }, args: command.args ? [] : false }, details }
  }

  let converting = {
    cc: { ...controlCommand },
    details: argDetails ? { ...argDetails } : false
  }
  // Keep converting while the nested command is a control op.
  while (CONTROLLED_OPS.includes(converting.cc.op.type)) {
    converting = convert(converting.cc, converting.details)
  }

  // mark which args are in the final controlled command
  if (argDetails) {
    converting.cc.args.forEach(arg => {
      if (arg in converting.details) converting.details[arg].controlled = true
      else converting.details[arg] = { controlled: true }
    })
    // Can get controlled 0-q gates (eg Phase) which need special handling:
    if (!converting.cc.args || converting.cc.args.length === 0) {
      // Assign the phase to the first register involved.
      converting.details[controlCommand.args[0]].controlled = true
    }
  }

  return { command: converting.cc, argDetails: converting.details }
}

// Classical Expression
const formatClassicalExp = function (expression) {
  const formatting = [{ exp: expression, start: 0 }]
  const formattedArgs = []
  let pos = 0

  while (pos < formatting.length) {
    let { exp, start } = formatting[pos]
    // Get the arg display names
    for (const arg of exp.args) {
      if (typeof arg === 'number') formattedArgs.splice(start, 0, arg) // constant
      else if (Array.isArray(arg)) formattedArgs.splice(start, 0, `${arg[0]}[${arg[1][0]}]`) // bit
      else if ('name' in arg) formattedArgs.splice(start, 0, arg.name) // bit register
      else formatting.push({ exp: arg, start }) // recursive expression
      start++
    }
    pos++
  }
  while (formatting.length > 0) {
    const { exp, start } = formatting.pop()
    // Get the operation display name
    const op = exp.op.split('.')
    const operation = (op.length > 1) ? op[1] : op[0]
    const n = exp.args.length

    // Replace the arg displays with the combined operation display name.
    // Display the operation differently based on the number of arguments involved
    // This is so we can write binary operations infix, and omit the brackets for unary or constant operations
    const args = formattedArgs.splice(start, n)
    if (n === 0) formattedArgs.splice(start, 0, operation) // -> op
    else if (n === 1) formattedArgs.splice(start, 0, `${operation} ${args[0]}`) // -> op exp
    else if (n === 2) formattedArgs.splice(start, 0, `(${args[0]} ${operation} ${args[1]})`) // -> (exp op exp)
    else formattedArgs.splice(start, 0, `${operation}(${args})`) // -> op(exp, ... exp)
  }

  return formattedArgs[0]
}

// Display register index in command
const formatPosStr = function (argPos, posAdjust) {
  if (typeof posAdjust === 'undefined') posAdjust = 0
  if (Array.isArray(argPos)) {
    return argPos.map(pos => pos === -1 ? '-' : (pos + posAdjust)).join(' ')
  }
  return argPos + posAdjust
}

export {
  registerEquality,
  getIndexedArgs,
  renderIndexedArgs,
  extractSubCircuit,
  extractControlledCommand,
  formatClassicalExp,
  formatPosStr
}
