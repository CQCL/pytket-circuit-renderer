import InfoModal from "@/components/circuitDisplay/infoModal"
import { ref } from 'vue'

export default {
  title: 'Basic/InfoModal',
  component: InfoModal,
  args: {
    modelValue: true, // toggles whether the modal is displayed
    slots: { title: '', content: '' }
  }
}

const Template = (args) => ({
  components: { InfoModal },
  setup () {
    const showModal = ref(args.modelValue)
    return { showModal, slots: args.slots }
  },
  template: `<div class="circuit-display-container theme_variables">
    <info-modal v-model="showModal">
      <template #title>{{ slots.title }}</template>
      <template #content>{{ slots.content }}</template>
    </info-modal>
    <button @click="showModal = true">Open modal</button>
  </div>`
})

export const Basic = Template.bind({})
Basic.args = {
  slots: {
    title: 'Modal title',
    content: 'This is the contents of the modal.'
  }
}