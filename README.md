# pytket-circuit-renderer

This is a Vue 3 component for rendering pytket circuits.

## Installation
Via package manager:
```
npm install pytket-circuit-renderer
```

Or include directly in a script tag. Make sure to also load the css.
```
<script type="application/javascript" src="https://unpkg.com/pytket-circuit-renderer@latest/dist/pytket-circuit-renderer.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/pytket-circuit-renderer@latest/dist/pytket-circuit-renderer.css">
```

## Usage
Note that this component depends on Vue 3.
If using a package manager, simply import and use as normal:
```import { circuitDisplayContainer } from "pytket-circuit-renderer"```

If loading the script directly, locate the module as below:
```const circuitDisplayContainer = window["pytket-circuit-renderer"].default```

You can then include the circuit display as a component in your vue app:
```
const app = {
    components: { circuitDisplayContainer },
    ...
};
```
The component will be exposed as `<circuit-display-component>`.

You can either render json passed directly via the `circuit-raw` prop:
```
<circuit-display-container :circuit-raw="circuitJson"></circuit-display-container>
```

Or collect it from an element on the page by specifying the query string:
```
<circuit-display-container :circuit-element-str="'#circuit-json-to-display'"></circuit-display-container>
```

Note that the display container includes a choice of rendering options. If you would rather specify these yourself,
you can use the `circuit-display` component directly, passing your own render options object.
In this case, you must also pass a parsed version of the circuit as a javascript object.
```
<circuit-display :circuit="circuitObject" :render-options="{'zxStyle': true, ...}"></circuit-display>
```

The render options you can specify are the following:
- `zxStyle`: Render gates as zx-spiders where applicable.
- `condenseCBits`: Display classical wires as a single wire.
- `recursive`: Display nested circuits recursively where possible.
- `condensed`: Display the circuit on one line only, rather than wrapping around.

Check the example folder for a basic sample app that uses this component.
