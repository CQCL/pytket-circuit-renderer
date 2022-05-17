// load and configure mathjax

(function () {
  if (!window.MathJax) {
    window.MathJax = {
      loader: {
        load: ['input/asciimath'],
      },
      tex: {
        inlineMath: [['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
      },
      asciimath: {
        delimiters: [['`', '`']],
      },
    };
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
    script.async = true;
    document.head.appendChild(script);
  }
})();

