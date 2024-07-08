import { POSSIBLE_TOOLTIP_OPS, CONTROLLED_OPS } from '@/components/circuitDisplay/consts'
import { extractControlledCommand } from '@/components/circuitDisplay/utils'

export const infoComputedBase = {
  opType () {
    return this.command?.op.type
  },
  displayOp () {
    return POSSIBLE_TOOLTIP_OPS.includes(this.controlledCommand?.op.type)
      ? this.controlledCommand?.op
      : this.command?.op
  },
  controlledCommand () {
    if (this.command && CONTROLLED_OPS.includes(this.opType)) {
      return extractControlledCommand(this.command, {}).command
    }
    return undefined
  }
}
