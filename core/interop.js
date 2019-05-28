const PythonInterop = require("./python/python-interop");

module.exports = class InteropHost {
  run(lang, code, scope) {
    return new Promise((resolve, reject) => {
      if (lang === "py") {
        const pythonInterop = new PythonInterop(scope);
        return pythonInterop
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
