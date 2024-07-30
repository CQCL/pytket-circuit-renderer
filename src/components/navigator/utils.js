// Conversion utils

export function getScroll (direction) {
  const scrollCoeff = Math.min(this.coeff[direction], 1)
  return this.offset[direction] * (1 - scrollCoeff)
}

export function getCoeff (direction) {
  return this.self[direction] / (this.content[direction] * this.zoom[direction])
}

export function initSelf () {
  this.self.x = this.$refs.contentSelf?.clientWidth
  this.self.y = this.$refs.contentSelf?.clientHeight
}
