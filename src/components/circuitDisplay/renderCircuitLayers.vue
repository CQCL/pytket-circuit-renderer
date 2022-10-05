<script>
import { h } from 'vue'
import CircuitLayer from './circuitLayer'
import CircuitCommand from './command'
import GenericGate from './genericGate'
import GateInfo from './gateInfo'

export default {
  name: 'render-circuit-layers',
  components: {
    CircuitLayer,
    CircuitCommand,
    GenericGate,
    GateInfo
  },
  props: {
    registerOrder: { type: Array, required: true },
    commandRefs: { type: Array, required: true },
    idCommandRef: { type: Object, required: true },
    renderOptions: { type: Object, required: true },
    condensedRegisters: { type: Object, required: true }
  },
  computed: {
    layersToRender () {
      // Arrange the circuit commands into layers we can render.
      let currentPos = 0
      let layer = []
      const layers = []

      // Util for creating ID filler gates.
      const getIdArgList = (start, end) => {
        if (start < 0) {
          start += this.registerOrder.length
          end = this.registerOrder.length
        }
        if (typeof start === 'undefined') start = 0
        if (typeof end === 'undefined') end = this.registerOrder.length

        const condensedArgs = this.idCommandRef.getOverlappingCondensedRegisters(start, end - 1)
        return [
          ...this.registerOrder.slice(start, end),
          ...condensedArgs[this.renderOptions.condenseCBits ? 'global' : 'names']
        ]
          .map(argName => this.idCommandRef.indexedArgDetails.details[argName])
          .sort((arg1, arg2) => arg1.order - arg2.order)
      }
      const idProps = {
        command: { args: [], op: { type: 'ID' } }, // leave args blank since we supply indexed args directly.
        renderOptions: this.renderOptions,
        condensedRegisters: this.condensedRegisters
      }

      // Pad with a layer of ID at start
      layers.push([h(GenericGate, { ...idProps, indexedArgs: this.idCommandRef.indexedArgs })])

      this.commandRefs.forEach((commandRef) => {
        const firstArg = commandRef.adjustedBounds.first

        // If we can't fit this command onto the current layer:
        if (firstArg < currentPos) {
          // Fill the previous layer with ID so we can start a new one.
          layer.push(h(GenericGate, { ...idProps, indexedArgs: getIdArgList(currentPos) }))
          layers.push(layer)
          currentPos = 0
          layer = []
        }
        // now fill with id up to start of current command.
        if (currentPos < firstArg) {
          layer.push(h(
            GenericGate,
            { ...idProps, indexedArgs: getIdArgList(currentPos, firstArg) }
          ))
        }

        // Add in this command
        layer.push(commandRef.renderSelf(h))

        // Adjust current pos to next wire to be filled. Wrap around if necessary:
        currentPos = (commandRef.adjustedBounds.last + 1) % this.registerOrder.length

        // If we wrapped around, push the layer we just completed
        if (currentPos === 0) {
          layers.push(layer)
          layer = []
        }
      })

      // Complete the last layer.
      if (currentPos > 0) {
        layer.push(h(GenericGate, { ...idProps, indexedArgs: getIdArgList(currentPos, this.registerOrder.length) }))
        layers.push(layer)
      }

      // Pad with a layer of ID at end
      layers.push([h(GenericGate, { ...idProps, indexedArgs: this.idCommandRef.indexedArgs })])

      return layers
    }
  },
  render () {
    if (this.layersToRender.length > 0) {
      return this.layersToRender.map((children, i) => {
        return h(
          CircuitLayer,
          { key: i, nested: this.renderOptions.nested },
          { default: () => children }
        )
      })
    }
    return 'The circuit has no commands.'
  }
}
</script>
