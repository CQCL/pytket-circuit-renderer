<script>
import circuitDisplay from "./circuitDisplay";

export default {
  name: "circuit-display-container",
  components: {
    circuitDisplay,
  },
  props: {
    circuitRaw: { type: Object, default: undefined },
    circuitElementStr: { type: String, default: undefined },
  },
  data() {
    return {
      embeddedCircuit: undefined,
      renderOptions: {
        zxStyle: true,
        condenseCBits: true,
        recursive: false,
        condensed: true,
      },
      options: {
        zxStyle: {
          title: "Render gates using zx styles",
          icon: `<svg width="16" height="16"  viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-width=".5"><path stroke-linecap="round" fill="none" d="M7.532 3.88h7.859M6.736 5.634l4.205 5.225M.667 11.58H15.39"/><circle fill="currentColor" cy="11.577" cx="11.141" r="1.936"/><circle cy="3.777" cx="5.212" fill="none" r="1.936"/><path stroke-linecap="round" fill="none" d="M.667 3.88h2.321"/></g></svg>`,
        },
        condenseCBits: {
          title: "Collapse classical registers together",
          icon: `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-arrows-collapse"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 8zm7-8a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 4.293V.5A.5.5 0 0 1 8 0zm-.5 11.707-1.146 1.147a.5.5 0 0 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 11.707V15.5a.5.5 0 0 1-1 0v-3.793z"/></svg>`,
        },
        recursive: {
          title: "Render nested circuits recursively",
          icon: `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-list-nested"><path fill-rule="evenodd" d="M4.5 11.5A.5.5 0 0 1 5 11h10a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm-2-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm-2-4A.5.5 0 0 1 1 3h10a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5z"/></svg>`,
        },
        condensed: {
          title: "Render on one line only",
          icon: `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-arrows-angle-contract"><path fill-rule="evenodd" d="M.172 15.828a.5.5 0 0 0 .707 0l4.096-4.096V14.5a.5.5 0 1 0 1 0v-3.975a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0 0 1h2.768L.172 15.121a.5.5 0 0 0 0 .707zM15.828.172a.5.5 0 0 0-.707 0l-4.096 4.096V1.5a.5.5 0 1 0-1 0v3.975a.5.5 0 0 0 .5.5H14.5a.5.5 0 0 0 0-1h-2.768L15.828.879a.5.5 0 0 0 0-.707z"/></svg>`,
        },
      },
    };
  },
  computed: {
    circuit() {
      if (this.circuitElementStr) {
        return this.embeddedCircuit;
      } else {
        return this.circuitRaw;
      }
    },
  },
  mounted() {
    // Collect the circuit from a designated element
    if (this.circuitElementStr) {
      console.log("query", this.circuitElementStr);

      const circuitJson = document.querySelector(
        this.circuitElementStr
      ).innerText;
      let circuit;
      try {
        circuit = circuitJson ? JSON.parse(circuitJson) : undefined;
      } catch (e) {
        circuit = undefined;
      }
      this.embeddedCircuit = circuit;
    }
  },
};
</script>

<template>
  <div class="circuit-display-container">
    <div class="display-options-container" v-if="circuit">
      <div v-for="(val, option) in renderOptions" :key="option">
        <div
          :title="options[option].title"
          class="icon"
          :class="{ active: renderOptions[option] }"
          role="checkbox"
          @click="renderOptions[option] = !renderOptions[option]"
          @keyup.space="renderOptions[option] = !renderOptions[option]"
          v-html="options[option].icon"
        ></div>
      </div>
    </div>
    <circuit-display
      style="flex-grow: 1"
      :circuit="circuit"
      :render-options="renderOptions"
    ></circuit-display>
  </div>
</template>

<style scoped>
.circuit-display-container {
  margin: 1em;
  display: flex;
  position: relative;
  padding-left: 2.5em;
  font-family: "roboto", system-ui, sans-serif;
  --accent-col: green;
  --accent-col-fill: darkseagreen;
  --accent-col-alt: #aca;
  --accent-col-emph: limegreen;
  --accent-col-overlay: rgba(130, 255, 140, 0.2);
  --accent-col-outline: rgba(30, 250, 30, 0.2);
  --main-col: black;
  --mid-col: #bbb;
  --faint-col: #eee;
  --faint-col-overlay: rgba(0, 0, 0, 0.05);
  --main-bg: white;
}
.display-options-container {
  display: flex;
  flex-direction: column;
  align-content: flex-start;
  justify-content: flex-start;
  align-items: center;
  border-right: 1px solid var(--mid-col);
  padding-right: 0.5em;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
}

.icon {
  margin-bottom: 0.3em;
  padding: 0.4em;
  height: 1em;
  width: 1em;
  border-radius: 10%;
  border: 1px solid var(--mid-col);
  color: var(--main-col);
}
.icon.active {
  border-color: var(--accent-col-emph);
  box-shadow: 0 0 0 3px var(--accent-col-overlay) inset;
}

.icon > svg {
  height: 100%;
  width: 100%;
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--faint-col);
  position: relative;
}
.row.paras {
  flex-direction: column;
  text-align: left;
  align-content: stretch;
}
.row-item {
  flex-grow: 1;
}
.row-item-l {
  text-align: left;
  padding-right: 5px;
}
.row-item-c {
  text-align: center;
  padding: 0 5px;
}
.row-item-r {
  text-align: right;
  padding-left: 5px;
}
.row-heading {
  font-weight: bold;
  margin-top: 20px;
  border-bottom: 2px solid var(--accent-col);
}
.row-sub-heading {
  border-color: var(--accent-col-emph);
  width: calc(100% - 20px);
}
:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 6px rgba(30, 250, 30, 0.2);
}
:focus {
  outline: none;
  box-shadow: inset 0 0 0 6px rgba(30, 250, 30, 0.2);
}
button:focus-visible,
.button:focus-visible {
  box-shadow: 0 0 0 6px rgba(30, 250, 30, 0.2);
}
button:focus,
.button:focus {
  box-shadow: 0 0 0 6px rgba(30, 250, 30, 0.2);
}
button,
.button,
[type="button"],
[type="reset"],
[type="submit"] {
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;
  border: none;
  transition: background-color 0.5s ease;
  font: 400 13.3333px Arial;
}

button:hover,
button:focus,
.button:hover,
.button:focus,
[type="button"]:hover,
[type="button"]:focus,
[type="reset"]:hover,
[type="reset"]:focus,
[type="submit"]:hover,
[type="submit"]:focus {
  background: var(--accent-col-fill);
}

.vue-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 999999;
}
.vue-modal-container {
  position: absolute;
  bottom: 10%;
  right: 10%;
  width: -moz-fit-content;
  width: fit-content;
  margin: auto;
  z-index: 1000000;
  border-radius: 8px;
  -webkit-box-shadow: 0 0 20px 10px var(--faint-col-overlay);
  -moz-box-shadow: 0 0 20px 10px var(--faint-col-overlay);
  box-shadow: 0 0 20px 10px var(--faint-col-overlay);
  background: var(--main-bg);
}

.close-modal-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  color: var(--mid-col);
  font-weight: bold;
  font-size: 0.75em;
  z-index: 1;
  cursor: pointer;
}
.modal-title {
  margin: 0;
  padding-top: 0;
}
.modal-content {
  padding: 10px 20px;
}
.hover-highlight tr:nth-child(2n + 1) {
  background: var(--fainter-col-overlay);
}
.no-hover-highlight tr:nth-child(2n + 1) {
  background: revert;
}
td,
th {
  padding: 10px;
  position: relative;
}
.complex-number {
  padding: 10px;
}
.complex-number:nth-child(2n + 1) {
  background: rgba(0, 0, 0, 0.1);
}
.matrix_container {
  border: 2px solid var(--mid-col);
  border-top: 0;
  border-bottom: 0;
  margin: auto;
  border-collapse: collapse;
  text-align: center;
}
.list {
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: stretch;
  padding: 0;
}
.list > * {
  margin: 10px;
}
.list > .row-sub-heading {
  margin: 10px 0;
}
.chart-list-item {
  display: inline-block;
}
</style>
