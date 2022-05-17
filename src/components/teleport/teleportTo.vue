<script>
import { h } from 'vue';

export default {
    name: "teleport-to",
    props: {
        name: {type: String, required: true},
    },
    data () {
      return {
          children: {}, // Maintain list of elements targeting this one
      }
    },
    render () {
        // Render all child slots in this one.
        let renderChildren = [];
        for (let name in this.children) {
            if (!this.children[name].disabled) {
                renderChildren.push(this.children[name].$slots.default());
            }
        }
        return h('div', renderChildren);
    },
    methods: {
        registerChild (child) {
            this.children[child.uid] = child;
        },
        removeChild (child) {
            delete this.children[child.uid];
        },
    },
}
</script>
