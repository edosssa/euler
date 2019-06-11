const PythonInterop = require("./lang/python/python-interop");
const JavaInterop = require("./lang/java/java-interop");

module.exports = class InteropHost {
  run(lang, code, scope) {
    return new Promise((resolve, reject) => {
      if (lang === "py") {
        const pythonInteropHost = new PythonInterop(scope);
        return pythonInteropHost
          .run(code)
          .then(() => resolve())
          .catch(error => reject(error));
      }
      else if (lang === "java") {
        const javaInteropHost = new JavaInterop(scope);
        return javaInteropHost
          .run(code)
          .then(() => resolve())
          .catch(error => reject(error));
      } else {
        /* Support other languages here */
        reject(new Error(`Lanaguage '${lang}' not supported`));
      }
    });
  }
};
