# pytket-circuit-renderer

This is a Vue 3 component for rendering pytket circuits.

## Installation
Via package manager:
`npm install pytket-circuit-renderer`

## Usage
Note that this component depends on Vue3. Import as follows:
`import { circuitDisplayContainer } from "pytket-circuit-renderer"`
Then simply register as a component in your app:
` components: {circuitDisplayContainer}`

The component will be exposed as `circuit-display-component`.

You can either render json passed directly via the `circuit-raw` prop,
or collect it from an element on the page by specifying the query string.

`<circuit-display-container :circuit-raw="circuitJson"></circuit-display-container>`
`<circuit-display-container :circuit-element-str="'#circuit-json-to-display'"></circuit-display-container>`

Note that the display container includes a choice of rendering options. If you would rather specify these yourself,
you can use the `circuit-display` component directly, passing your own render options object.
In this case, you must also pass a parsed version of the circuit.

`<circuit-display :circuit="circuitObject" :render-options="{'zxStyle': true}"></circuit-display>`

Accepted render options are the following:
- `zxStyle`: Render gates as zx-spiders where applicable.
- `condenseCBits`: Display classical wires as a single wire.
- `recursive`: Display nested circuits recursively where possible.
- `condensed`: Display the circuit on one line only, rather than wrapping around.

