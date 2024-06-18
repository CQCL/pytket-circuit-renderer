const CONTROLLED_OPS = [
  'CX', 'CY', 'CZ', 'CH', 'CS', 'CSdg',
  'CRx', 'CRy', 'CRz', 'CU1', 'CU3',
  'CV', 'CVdg', 'CSX', 'CSXdg', 'CSWAP',
  'CnRx', 'CnRy', 'CnRz', 'CnX', 'CnY', 'CnZ', 'CCX',
  'Control', 'QControlBox',
  'Condition', 'Conditional',
  'MultiplexorBox', 'MultiplexedRotationBox',
  'MultiplexedU2Box', 'MultiplexedTensoredU2Box'
]

const SPLIT_RENDERING = {
  none: 'none',
  start: 'start',
  middle: 'middle',
  end: 'end'
}

export { CONTROLLED_OPS, SPLIT_RENDERING }
