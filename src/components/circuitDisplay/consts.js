const CONTROLLED_OPS = [
  'CX', 'CY', 'CZ', 'CH',
  'CRx', 'CRy', 'CRz', 'CU1', 'CU3',
  'CV', 'CVdg', 'CSx', 'CSXdg', 'CSWAP',
  'CnRy', 'CnX', 'CnY', 'CnZ', 'CCX',
  'Control', 'QControlBox',
  'Condition', 'Conditional'
]

const SPLIT_RENDERING = {
  none: 'none',
  start: 'start',
  middle: 'middle',
  end: 'end'
}

export { CONTROLLED_OPS, SPLIT_RENDERING }
