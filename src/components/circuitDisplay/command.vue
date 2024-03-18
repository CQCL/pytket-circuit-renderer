<script>
import { registerEquality } from './utils'
import { CONTROLLED_OPS } from './consts'

import controlledGate from './controlledGate'
import genericGate from './genericGate'
import { renderOptions } from './provideKeys'

const GLOBAL_CONDENSED_NAME = ['Global Classical', ['n'], 'condensed'] // Name for the global condensed register

export default {
  name: 'circuit-command',
  props: {
    command: { type: Object, required: true },
    registerOrder: { type: Object, required: true },
    classicalThreshold: { type: Number, required: true },
    wasmThreshold: { type: Number, required: true },
    condensedRegisters: { type: Object, required: true }
  },
  inject: {
    condenseCBits: { from: renderOptions.condenseCBits }
  },
  emits: ['mounted'],
  computed: {
    opType () {
      return this.command.op.type
    },
    renderControlGate () {
      return CONTROLLED_OPS.includes(this.opType) && !['CNOT', 'CX', 'CZ'].includes(this.opType)
    },
    commandArgs () {
      const [firstArg, lastArg, argDetails] = [{}, {}, {}]
      if (!this.command.args || this.command.args.length === 0) {
        // There are no args for this command. Render it in the correct layer, but passing through all wires.
        firstArg.order = 0
        firstArg.name = this.registerOrder[0]
        lastArg.order = this.registerOrder.length - 1
        lastArg.name = this.registerOrder[this.registerOrder.length - 1]
        this.registerOrder.forEach((arg, order) => {
          argDetails[arg] = {
            name: arg,
            pos: order,
            order
          }
        })
      } else {
        this.command.args.forEach((arg, pos) => {
          const order = this.registerOrder.findIndex(reg => registerEquality(reg, arg))
          if (order > -1) {
            if (!('order' in firstArg) || order < firstArg.order) {
              firstArg.order = order
              firstArg.name = arg
            }
            if (!('order' in lastArg) || order > lastArg.order) {
              lastArg.order = order
              lastArg.name = arg
            }
            if (argDetails[arg] && argDetails[arg].multiPos) {
              // Arg occurring multiple times in same command. record this separately
              argDetails[arg].multiPos.push(pos)
            } else {
              argDetails[arg] = {
                name: arg,
                pos, // index of arg in the command.
                multiPos: [pos],
                order // index of arg in the display order
              }
            }
          }
        })
      }
      return {
        details: argDetails,
        first: firstArg ? argDetails[firstArg.name] : undefined,
        last: lastArg ? argDetails[lastArg.name] : undefined
      }
    },
    overlappingCondensedRegisters () {
      return this.getOverlappingCondensedRegisters(this.commandArgs.first.order, this.commandArgs.last.order)
    },
    adjustedBounds () {
      const firstArg = this.commandArgs.first.order
      const lastArg = this.commandArgs.last.order

      // Account for condensed registers
      let adjustedFirstArg = firstArg
      let adjustedLastArg = lastArg
      if (this.condenseCBits) {
        adjustedFirstArg = Math.min(firstArg, this.classicalThreshold)
        adjustedLastArg = lastArg >= this.classicalThreshold ? Math.max(lastArg , this.wasmThreshold - 1) : lastArg
      } else {
        for (const regName of this.overlappingCondensedRegisters.names) {
          adjustedFirstArg = Math.min(adjustedFirstArg, this.condensedRegisters.order[regName[0]].first)
          adjustedLastArg = Math.max(lastArg, this.condensedRegisters.order[regName[0]].last)
        }
      }
      return {
        first: adjustedFirstArg,
        last: adjustedLastArg
      }
    },
    argList () {
      return this.registerOrder.slice(this.commandArgs.first.order, this.commandArgs.last.order + 1)
    },
    indexedArgs () {
      // Need to sort the args according to order to ensure condensed registers are in the right place:
      return [
        ...this.argList,
        ...this.overlappingCondensedRegisters[this.condenseCBits ? 'global' : 'names']
      ]
        .map(arg => this.indexedArgDetails.details[arg])
        .sort((arg1, arg2) => arg1.order - arg2.order)
    },
    indexedArgDetails () {
      // Compute necessary info for each arg that could be displayed as part of this command.
      const argDetails = {}
      const condensedArgs = []
      const classicalBitsOrder = { global: undefined, names: {} }
      const classicalBits = { global: [], names: {} }
      let nClassicalBits = 0

      this.registerOrder.forEach((arg, order) => {
        const argName = arg[0]
        const pos = arg in this.commandArgs.details ? this.commandArgs.details[arg].pos : -1
        const multiPos = arg in this.commandArgs.details ? this.commandArgs.details[arg].multiPos : -1
        const classical = order >= this.classicalThreshold && order < this.wasmThreshold
        if (classical) {
          if (!classicalBits.names[argName]) {
            classicalBits.names[argName] = []
            classicalBitsOrder.names[argName] = order
          }
          if (typeof classicalBitsOrder.global === 'undefined') classicalBitsOrder.global = order
          if (pos > -1) nClassicalBits++ // Count number of classical bits that actually feature in the command.
          classicalBits.global.push(arg)
          classicalBits.names[argName].push(arg)
        }
        argDetails[arg] = {
          name: arg,
          pos, // index of this arg in the command
          multiPos,
          order, // index of this arg in the display order
          flags: {
            first: order === this.commandArgs.first.order,
            last: order === this.commandArgs.last.order,
            single: this.command.args && this.command.args.length === 1,
            classical,
            wasm: order >= this.wasmThreshold,
            condensed: false,
            globalClassical: false
          }
        }
      })

      // Add condensed classical register if relevant.
      if (nClassicalBits > 0) {
        for (const registerName of Object.keys(classicalBits.names)) {
          const nBits = classicalBits.names[registerName].length
          const name = [registerName, [nBits], 'condensed']
          const [first, last] = [
            classicalBitsOrder.names[registerName] <= this.commandArgs.first.order
            && this.commandArgs.first.order < classicalBitsOrder.names[registerName] + nBits,
            classicalBitsOrder.names[registerName] <= this.commandArgs.last.order
            && this.commandArgs.last.order < classicalBitsOrder.names[registerName] + nBits
          ]
          argDetails[name] = {
            name,
            pos: classicalBits.names[registerName].map(arg => argDetails[arg].pos),
            multiPos: classicalBits.names[registerName].map(arg => argDetails[arg].multiPos),
            order: classicalBitsOrder.names[registerName],
            bits: classicalBits.names[registerName],
            indexedBits: classicalBits.names[registerName].map(arg => argDetails[arg]),
            flags: {
              first,
              last,
              single: first && last,
              classical: true,
              condensed: true,
              globalClassical: false
            }
          }
          condensedArgs.push(name)
        }
        // Global register
        argDetails[GLOBAL_CONDENSED_NAME] = {
          name: GLOBAL_CONDENSED_NAME,
          pos: classicalBits.global.map(arg => argDetails[arg].pos),
          multiPos: classicalBits.global.map(arg => argDetails[arg].multiPos),
          order: classicalBitsOrder.global,
          bits: classicalBits.global,
          indexedBits: classicalBits.global.map(arg => argDetails[arg]),
          flags: {
            first: this.commandArgs.first.order >= this.classicalThreshold,
            last: this.commandArgs.last.order < this.wasmThreshold, // bits displayed after qubits.
            single: this.commandArgs.first.order >= this.classicalThreshold && this.commandArgs.last.order < this.wasmThreshold,
            classical: true,
            condensed: true,
            globalClassical: true
          }
        }
        condensedArgs.push(GLOBAL_CONDENSED_NAME)
      }
      return { condensedArgList: condensedArgs, details: argDetails }
    }
  },
  mounted () {
    // notify parent when this component is ready
    this.$emit('mounted', this)
  },
  methods: {
    renderSelf (h) {
      // Render the gate for this command
      const gateProps = {
        'data-command': true, // mark this as containing a command from the circuit definition for testing.
        command: this.command,
        indexedArgs: this.indexedArgs,
        condensedRegisters: this.condensedRegisters.toggles
      }
      return [
        h(
          this.renderControlGate ? controlledGate : genericGate,
          gateProps
        ),
        this.$slots['gate-info']()
      ]
    },
    getOverlappingCondensedRegisters (firstArg, lastArg) {
      const globalOrder = {first: this.classicalThreshold, last: this.wasmThreshold }
      return {
        global: (firstArg <= globalOrder.first && globalOrder.first <= lastArg)
            || (firstArg <= globalOrder.last && globalOrder.last <= lastArg)
            ? [GLOBAL_CONDENSED_NAME] : [],
        names: this.indexedArgDetails.condensedArgList.filter(regName => {
          if (regName[0] in this.condensedRegisters.order) {
            const { first, last } = this.condensedRegisters.order[regName[0]]
            return this.condensedRegisters.toggles[regName[0]] && (
              (firstArg <= first && first <= lastArg) || (firstArg <= last && last <= lastArg)
            )
          }
          return false
        })
      }
    },
    registerEquality
  }
}
</script>

<template>
  <!-- Placeholder DOM element; gate will be rendered elsewhere -->
  <div :data-command="opType"></div>
</template>

<style>
</style>
