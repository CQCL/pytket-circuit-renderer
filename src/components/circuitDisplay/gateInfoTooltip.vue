<script>
import { teleportConfig } from './provideKeys'
import infoModal from "@/components/circuitDisplay/infoModal";
import {teleportFrom} from "@/components/teleport/init";

export default {
  name: 'gate-info-tooltip',
  props: {
    shouldDisplay: {type: Boolean, default: false},
    refString: {type: String, required: true}
  },
  components: {
    infoModal,
    teleportFrom,
  },
  inject: {
    teleportId: { from: teleportConfig.to }
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
  <div v-if="shouldDisplay">
    <div
        @click="visible = true"
        role="button"
        :data-cy="'open-tool-tip-' + refString"
        data-cy-tooltip="open"
    >
      <slot name="trigger">
        <div
            class="tool-tip-container"
        ></div>
      </slot>
    </div>

    <!-- content to be rendered in the info modal -->
    <div style="display: none">
      <teleport-from :to="visible ? teleportToId : ''">
        <info-modal ref="infoModal" v-model="visible" class="tool-tip-content" :data-cy="'teleported-'+refString">
          <template #title><slot name="title"></slot></template>
          <!-- Defer rendering contents until modal is opened -->
          <template #content v-if="visible"><slot name="content"></slot></template>
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
