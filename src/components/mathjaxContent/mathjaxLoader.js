// load and configure mathjax

export async function loadMathjax () {
  if (!window.isLoadingMathjaxPromise) {
    window.isLoadingMathjaxPromise = new Promise((resolve) => {
      window.MathJax = {
        loader: {
          load: ['input/asciimath', 'input/tex']
        },
        tex: {
          inlineMath: [['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']]
        },
        asciimath: {
          delimiters: [['`', '`']]
        },
        startup: {
          async ready () {
            window.MathJax.startup.defaultReady()
            await window.MathJax.startup.promise
            resolve(true)
          },
          pageReady () {
            // Don't typeset entire page on initial load. Instead we return a dummy promise that resolves immediately.
            // (Instead we expect any maths to be handled by the mathjax-content component)
            return async () => true
          }
        }
      }
      const script = document.createElement('script')
      script.id = 'mathjax-load-script'
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js'
      script.async = true
      document.head.appendChild(script)
    })
  }
  return await window.isLoadingMathjaxPromise
}
