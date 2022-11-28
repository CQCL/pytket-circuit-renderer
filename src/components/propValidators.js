// Validators for required props that can also be null or undefined

const PendingDataValidator = (dataType) => {
  return (prop) => typeof prop === 'undefined' || prop instanceof dataType
}
const RefValidator = (prop) => prop === null || typeof prop === 'undefined' || prop instanceof Object // vue treats refs as objects

export {
  PendingDataValidator,
  RefValidator
}
