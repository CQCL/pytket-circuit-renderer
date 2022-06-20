<script>
import wire from './wire';

export default {
  name: "gate-component",
  components: {
    wire,
  },
  props: {
    arg: {type: Object, required: true},
    command: {type: Object, required: true},
    linkVertical: {type: Boolean, default: false},
    renderOptions: {type: Object, required: true},
  },
  computed: {
    opType () {
      return this.command.op.type;
    },
    specialGateClasses () {
      return {
        "gate_top": !this.arg.flags.single && this.arg.flags.first,
        "gate_bottom": !this.arg.flags.single && this.arg.flags.last,
        "gate_box": this.command.args.length === 1 || this.arg.flags.single,
        "classical": this.arg.flags.classical,
        "condensed": this.arg.flags.condensed,
        "connected": this.arg.pos !== -1,
        "gate_reset": this.opType === "Reset",
        "zx-hadamard": this.opType === "H" && this.renderOptions.zxStyle,
        "zx-spider": this.renderOptions.zxStyle && this.asSpider(this.opType),
      };
    },
    specialGateContentClasses () {
      if (this.opType === 'Reset') {
        return ["gate", "gate_box", {'zx-spider x': this.renderOptions.zxStyle}];
      }
      return ["gate_name"];
    },
    gateColor () {
      // Returns the zx gate colour class for preset gate types where applicable.
      if (this.opType === "H") {
        return "h";
      }
      if (["X", "Rx", "V", "Vdg", "SX", "SXdg",
        "XXPhase", "XXPhase3", "PhasedX", "NPhasedX"
      ].includes(this.opType)) {
        return "x";
      }
      if (["Y", "Ry", "YYPhase"].includes(this.opType)) {
        return "y"
      }
      if (["Z", "S", "Sdg", "T", "Tdg", "Rz", "U1",
        "PhasedISWAP", "ZZPhase", "ZZMax", "Measure",
        "Reset"].includes(this.opType)) {
        return "z";
      }
      return "";
    },
    name () {
      // Name of this gate.
      let name = this.opType;
      let op = this.command.op;

      if (this.opType === "CircBox" && "box" in op && "circuit" in op.box) {
        name = "name" in op.box.circuit ? op.box.circuit.name : "Circuit";
      }
      if (["Custom", "Composite", "CompositeGate"].includes(this.opType)
          && "box" in op && "gate" in op.box) {
        name = "name" in op.box.gate ? op.box.gate.name : "Parametrised Circuit";
      }
      if (["ExplicitPredicate", "ExplicitModifier"].includes(this.opType)
          && "classical" in op) {
        name = "name" in op.classical ? op.classical.name : "Classical";
      }
      if (this.opType === "MultiBit" && "classical" in op) {
        name = `Multi-${"name" in op.classical ?  op.classical.name : "Classical"}`;
      }

      // If this should be a spider, return the phase to display.
      let phase = this.spiderPhase(this.opType, this.paramStr);
      if (phase && this.renderOptions.zxStyle) {
        return phase;
      }
      return name + this.paramStr;
    },
    paramStr () {
      let op = this.command.op;
      let params = "params" in op && op.params ? op.params : [];
      params = params.concat("box" in op && op.box.params ? op.box.params : []);
      params = params.map((p) => {
        const num = Number(p);
        if (isNaN(p)){
          return p.length > 5 ? p.slice(0, 4) + "..." : p;
        } else {
          return Math.round(num * 1000) / 1000;
        }
      });
      return params.length > 0
          ? (params.length > 3 ? `(${params.slice(0,4)}...)` : `(${params})`)
          : "";
    }
  },
  methods: {
    asSpider (opType) {
      return [
          "X", "U1", "V", "Vdg", "Y", "Z", "S", "Sdg", "T", "Tdg"
      ].includes(opType);
    },
    spiderPhase (opType, paramStr) {
      const convert = {
        X: "π",
        U1: paramStr + "π",
        V: "π/2",
        Vdg: "-π/2",
        Y: "π",
        Z: "π",
        S: "π/2",
        Sdg: "-π/2",
        T: "π/4",
        Tdg: "-π/4",
        Reset: "0",
        H: " ",
      };
      if (opType in convert) {
        return convert[opType];
      } else {
        return false;
      }
    },
  }
}

</script>

<template>
  <div :data-gate-component="opType">
    <!-- Barrier requires special rendering -->
    <div v-if="opType === 'Barrier'" :class="{'gate_container nested': arg.flags.single }" style="height:var(--block-height)">
      <wire :classical="arg.flags.classical" :condensed="arg.flags.condensed"></wire>
      <div class="gate_container" :class="[gateColor]">
        <div v-if="arg.pos > -1" class="barrier" :class="[arg.flags.first ? 'link-bottom edge-link' : 'link-top', {'edge-link': arg.flags.last}]"></div>
      </div>
    </div>

    <!-- Generic single block gate -->
    <div v-else class="gate_container nested" style="height:var(--block-height)">
      <wire v-if="arg.pos !== -1" class="wire_in" :class="{flex_wire: arg.flags.single}" :classical="arg.flags.classical" :condensed="arg.flags.condensed"></wire>

      <div class="gate_container" :class="[gateColor, {'generic': !arg.flags.single}]">
        <div class="gate" :class="specialGateClasses">
          <span v-if="arg.pos !== -1 && !arg.flags.single" class="wire-label">
              [[# arg.pos #]]
          </span>
          <span :class="specialGateContentClasses" :style="[opType === 'Reset'? {margin: 0} : {}]">
            [[# arg.flags.last ? name : '' #]]
          </span>
        </div>
        <div v-if="linkVertical" class="link-top"></div>
      </div>

      <wire v-if="arg.pos !== -1" class="wire_in" :class="{flex_wire: arg.flags.single}" :classical="arg.flags.classical" :condensed="arg.flags.condensed"></wire>
    </div>

  </div>
</template>

<style scoped>
</style>
