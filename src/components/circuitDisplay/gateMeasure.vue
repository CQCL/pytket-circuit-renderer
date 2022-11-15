<script>
export default {
  name: 'gate-measure'
}
</script>

<template>
  <div class="gate_measure z">
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 64 64'
      width='64' height='64'
      fill='var(--box-col)'
      stroke="var(--wire-col)"
      stroke-width="calc(var(--spider-border) * 2)"
    >
      <path d='M63,63 C63,32 48,16 32,16 C16,16 1,32 1,63 L63,63' />
      <path d="M32,63 L56,16" />
    </svg>
    <div class="control_index measure z">z</div>
  </div>
</template>

<style>
</style>
