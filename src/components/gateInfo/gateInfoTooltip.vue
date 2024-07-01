<script>
import {renderOptions, teleportConfig} from '@/components/circuitDisplay/provideKeys'
import { teleportFrom } from '@/components/teleport/init'
import infoModal from './infoModal'

export default {
  name: 'gate-info-tooltip',
  props: {
    ifDisplay: {type: Boolean, default: false},
    showDisplay: {type: Boolean, default: false},
    refString: {type: String, required: true},
    nBlocks: {type: Number, default: 1},
  },
  components: {
    infoModal,
    teleportFrom,
  },
  inject: {
    teleportId: { from: teleportConfig.to },
    nested: { from: renderOptions.nested },

  },
  emits: ['register-teleport', 'updated'],
  data () {
    return {
      visible: false,
      teleportToId: this.teleportId,
    }
  },
}
</script>

<template>
  <div v-if="ifDisplay" v-show="showDisplay">
    <div
        @click="visible = true"
        role="button"
        :data-cy="'open-tool-tip-' + refString"
        :data-cy-nesting="nested"
        :data-cy-tooltip="ifDisplay && showDisplay ? 'active' : 'hidden'"
    >
      <slot name="trigger">
        <div :style="{
          paddingTop: `calc(var(--block-height) * ${nBlocks})`,
          margin: `calc(0px - var(--block-height) * ${nBlocks}) auto 0`,
        }" class="tool-tip-container"></div>
      </slot>
    </div>

    <!-- content to be rendered in the info modal -->
    <div style="display: none">
      <teleport-from :to="visible ? teleportToId : ''">
        <info-modal ref="infoModal" v-model="visible" class="tool-tip-content" :data-cy="'teleported-'+refString">
          <template #title><slot name="title"></slot></template>
          <!-- Defer rendering contents until modal is opened -->
          <template #content v-show="visible"><slot name="content"></slot></template>
          <template #buttons><slot name="buttons"></slot></template>
        </info-modal>
      </teleport-from>
    </div>
  </div>
</template>

<style scoped>
.tool-tip-container{
    margin: calc(0px - var(--block-height) / 2) auto 0;
    padding-top: calc(var(--block-height) / 2);
    position: relative;
    bottom: 0;
    left: 0;
    right: 0;
    height: 0;
    width: 100%;
    z-index: 1;
    overflow: hidden;
}
.tool-tip-container:hover {
    cursor: pointer;
}
.tool-tip-content{
    cursor: auto;
}
.tool-tip-content > .gate_container.nested{
    width: 100%;
    min-width: unset;
    max-width: 400px;
    overflow: scroll;
}
</style>
