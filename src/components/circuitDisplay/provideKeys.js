// List of keys used by the circuit renderer components

export const renderOptions = {
  condenseCBits: Symbol('Render option: condense classical bits.'),
  zxStyle: Symbol('Render option: display zx style gates.'),
  condensed: Symbol('Render option: condense circuit into one line.'),
  recursive: Symbol('Render option: display nested circuits recursively.'),
  nested: Symbol('Render option: circuit is nested.')
}

export const teleportConfig = {
  parent: Symbol('Root teleport container ref'),
  to: Symbol('Teleport-to id to send modals to')
}
