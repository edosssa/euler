(function() {
  const path = require("path");
  const amdLoader = require("monaco-editor/min/vs/loader");
  const amdRequire = amdLoader.require;
  const amdDefine = amdLoader.require.define;
  function uriFromPath(_path) {
    var pathName = path.resolve(_path).replace(/\\/g, "/");
    if (pathName.length > 0 && pathName.charAt(0) !== "/") {
      pathName = "/" + pathName;
    }
    return encodeURI("file://" + pathName);
  }
  amdRequire.config({
    baseUrl: uriFromPath(
      path.join(__dirname, "./node_modules/monaco-editor/min")
    )
  });
  // workaround monaco-css not understanding the environment
  self.module = undefined;
  amdRequire(["vs/editor/editor.main"], function() {
    const opts = {
      value:
        "// First line\nfunction hello() {\n\talert('Hello world!');\n}\n// Last line",
      language: "javascript",

      lineNumbers: "off",
      roundedSelection: false,
      scrollBeyondLastLine: false,
      readOnly: false,
      theme: "vs-dark",
      fontLigatures: true,
      automaticLayout: true,
      fontSize: 16,
      fontFamily: '"Fira code", monospace'
    };
    var editor = monaco.editor.create(
      document.getElementById("container"),
      opts
    );
  });
})();
