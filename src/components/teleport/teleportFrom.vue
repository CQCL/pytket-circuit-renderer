<script>
let nTeleports = 0;  // teleport-from needs a unique id.

export default {
    name: "teleport-from",
    props: {
        to: {type: String, required: true},
        parent: {required: true}, // Ref to teleport-container. Undefined until parent is mounted.
        disabled: {type: Boolean, default: false},
    },
    data () {
        nTeleports++;
        return {
            uid: "teleport-from-" + nTeleports,
        }
    },
    mounted () {
        this.updateTo(this.to, false);
    },
    watch: {
        to (next, prev) {
            this.updateTo(next, prev);
        },
    },
    methods: {
        updateTo (next, prev) {
            // Register this component as a child of the target
            if (next) {
                this.parent.registerTeleport(true, next, this);
            }
            if (prev) {
                this.parent.registerTeleport(false, prev, this);
            }
        },
    }
}
</script>

<template>
  <div><slot></slot></div>
</template>
