// Classify ops by type.
const MULTIPLEXED_OPS = [
  'MultiplexorBox', 'MultiplexedRotationBox',
  'MultiplexedU2Box', 'MultiplexedTensoredU2Box',
]
const CONDITION_OPS = [
  'Conditional', 'Condition'
]
const CONTROLLED_OPS = [
  'CX', 'CY', 'CZ', 'CH', 'CS', 'CSdg',
  'CRx', 'CRy', 'CRz', 'CU1', 'CU3',
  'CV', 'CVdg', 'CSX', 'CSXdg', 'CSWAP',
  'CnRx', 'CnRy', 'CnRz', 'CnX', 'CnY', 'CnZ', 'CCX',
  'Control', 'QControlBox',
  ...CONDITION_OPS, ...MULTIPLEXED_OPS,
]
const NESTED_CIRCUIT_OPS = [
  'CircBox', 'ConjugationBox','Custom',
  'CustomGate', 'Composite', 'CompositeGate'
]
const CLASSICAL_OPS = [
  'ClassicalExpBox', 'ClassicalTransform',
  'RangePredicate', 'ExplicitPredicate',
  'ExplicitModifier', 'SetBits', 'CopyBits',
  'MultiBit',
]
const MATRIX_OPS = [
  'Unitary1qBox', 'Unitary2qBox', 'Unitary3qBox',
  'ProjectorAssertionBox',
]
const INFO_CONTENT_OPS = [
  'ExpBox', 'PauliExpBox', 'PauliExpPairBox',
  'PauliExpCommutingSetBox', 'PhasePolyBox',
  'Custom', 'CustomGate', 'Composite', 'CompositeGate',
  'StabiliserAssertionBox', 'StatePreparationBox',
  'UnitaryTableauBox', 'WASM', 'ToffoliBox',
  'DiagonalBox', 'TermSequenceBox',
  'DummyBox', ...MULTIPLEXED_OPS, ...CONDITION_OPS,
  ...CLASSICAL_OPS
]
const PARAM_OPS = [
    'Rx', 'Ry', 'Rz', 'U1', 'U2', 'U3',
    'GPI', 'GPI2', 'AAMS', 'TK1', 'TK2',
    'CRx', 'CRy', 'CRz', 'CnRx', 'CnRy', 'CnRz',
    'CU1', 'CU2', 'CU3',
    'ISWAP', 'PhasedISWAP', 'ESWAP', 'FSim',
    'XXPhase', 'YYPhase', 'ZZPhase', 'XXPhase3',
    'PhasedX', 'NPhasedX',
]

// Any op known to possibly generate a tooltip.
const POSSIBLE_TOOLTIP_OPS = [].concat(
    INFO_CONTENT_OPS, PARAM_OPS,
    MATRIX_OPS, NESTED_CIRCUIT_OPS,
)

const SPLIT_RENDERING = {
  none: 'none',
  start: 'start',
  middle: 'middle',
  end: 'end'
}

export {
  MULTIPLEXED_OPS,
  CONTROLLED_OPS,
  NESTED_CIRCUIT_OPS,
  MATRIX_OPS,
  CLASSICAL_OPS,
  INFO_CONTENT_OPS,
  CONDITION_OPS,
  PARAM_OPS,
  POSSIBLE_TOOLTIP_OPS,
  SPLIT_RENDERING,
}
