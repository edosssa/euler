const { dialog, Menu, MenuItem, getCurrentWindow } = require('electron').remote;
const customTitlebar = require('custom-electron-titlebar');
const fs = require("fs");
const { Logger } = require("./core/logger");
const Runner = require("./core/runner");
const { addClass, removeClass } = require("./util");
const Scope = require("./core/scope");
const rInjector = require("./core/injectors/rLib-injector");
const stdInjector = require("./core/injectors/std-injector")

/* globals */
let editor;
let activeFilePath;

/* Register injectors */
Scope.registerInjector(rInjector);
Scope.registerInjector(stdInjector);

const evaluatorLogger = new Logger()
const runner = new Runner(evaluatorLogger);

/* Set a custom titlebar */
const titleBar = new customTitlebar.Titlebar({
  icon: "./assets/euler-logo.svg",
  backgroundColor: customTitlebar.Color.fromHex('#2e2e2e')
});

/* Configure output and debug logs */
const debugTerminal = document.querySelector("#debug-terminal textarea");
const clearDebugTerminal = () => debugTerminal.textContent = ""
const sendToDebugTerminal = (message) => {
  debugTerminal.textContent =
    debugTerminal.textContent === "" ? message : debugTerminal.textContent + "\n" + message;
};
/* Hookup the tap to the debug logger */
evaluatorLogger.configureTap(sendToDebugTerminal);

const outputTerminal = document.querySelector("#output-terminal textarea");
const clearOutputTerminal = () => outputTerminal.textContent = ""
const sendToOutputTerminal = (message, pad = true) => {
  message = pad ? ">>> " + message : message;
  outputTerminal.textContent =
    outputTerminal.textContent === "" ? message : outputTerminal.textContent + "\n" + message;
};

/* Register a tap so that the print calls are piped to the terminal instead of console */
require("./core/lib/print").configurePrintTap(sendToOutputTerminal);

/* Top controls */
const changeStatusBarColor = (status) => {
  const klass = `status-bar-${status}`;
  const statusBar = document.getElementById("status-bar");
  removeClass(statusBar, "status-bar-failed");
  removeClass(statusBar, "status-bar-running");
  removeClass(statusBar, "status-bar-success");

  addClass(statusBar, klass)
}

document.getElementById("run-btn").addEventListener("click", (e) => {
  /* Clear both terminals before running */
  clearOutputTerminal();
  clearDebugTerminal();

  changeStatusBarColor("running");
  
  runner.run(editor.getValue())
    .then(() => changeStatusBarColor("success"))
    .catch(error => {
      sendToOutputTerminal(error.message, false)
      changeStatusBarColor("failed");
    });
})

/* Terminal controls */
const showDebugTerminal = () => {
  removeClass(document.getElementById("terminal"), "hidden");
  switchToTab("debug");
}

const showOutputTerminal = () => {
  removeClass(document.getElementById("terminal"), "hidden");
  switchToTab("output");
}

document.getElementById("output-terminal-tab")
  .addEventListener("click", () => switchToTab("output"));

document.getElementById("debug-terminal-tab")
  .addEventListener("click", () => switchToTab("debug"));

document.getElementById("close-terminal-tab")
  .addEventListener("click", () => addClass(document.getElementById("terminal"), "hidden"));

/* File controls */
const handleNewFileClick = () => {

}

const handleOpenClick = (e) => {
  const file = dialog.showOpenDialog(getCurrentWindow(), { properties: ['openFile'] })[0];
  fs.readFile(file, (err, data) => {
    if (err) {
      alert(err.message);
      return;
    }
    editor.setValue(data.toString("utf-8"));
    activeFilePath = file;
  });
}

const menu = new Menu();

menu.append(new MenuItem({
  label: 'File',
  submenu: [
    {
      label: 'New Script',
      click: () => console.log('Click on subitem 1'),
      accelerator: 'Ctrl+N'
    },
    {
      type: 'separator'
    },
    {
      label: 'Open',
      click: handleOpenClick,
      accelerator: 'Ctrl+O',
    },
    {
      type: 'separator'
    },
    {
      label: 'Save',
      click: () => { },
      accelerator: "Ctrl+S"
    },
    {
      label: 'Save As',
      click: () => { },
      accelerator: "Ctrl+Shift+S"
    },
    {
      type: 'separator'
    },
    {
      type: "checkbox",
      label: 'Auto Save',
      checked: true,
      click: () => { },
    },
    {
      label: 'Settings',
      click: () => { },
      accelerator: "Ctrl+Alt+S"
    }
  ]
}));

menu.append(new MenuItem({
  label: 'Edit',
  submenu: [
    {
      label: 'Undo',
      click: showOutputTerminal,
      accelerator: 'Ctrl+Z'
    },
    {
      label: 'Redo',
      click: showDebugTerminal,
      accelerator: 'Ctrl+Y'
    },
    {
      type: 'separator'
    },
    {
      label: 'Cut',
      click: showDebugTerminal,
      accelerator: 'Ctrl+C'
    },
    {
      label: 'Copy',
      click: showDebugTerminal,
      accelerator: 'Ctrl+V'
    },
    {
      label: 'Paste',
      click: showDebugTerminal,
      accelerator: 'Ctrl+Y'
    },
  ]
}));

menu.append(new MenuItem({
  label: 'Run',
  submenu: [
    {
      label: 'Start Run',
    },
    {
      label: 'Start Run (Verbose)',
    }
  ]
}))

menu.append(new MenuItem({
  label: 'View',
  submenu: [
    {
      label: 'Output',
      click: showOutputTerminal,
      accelerator: 'Ctrl+Shift+O'
    },
    {
      label: 'Debug',
      click: showDebugTerminal,
      accelerator: 'Ctrl+Shift+D'
    },
    {
      type: 'separator'
    },
  ]
}));

menu.append(new MenuItem({
  label: 'Help',
  submenu: [
    {
      label: 'Welcome',
      click: () => { },
    },
    {
      label: 'Documentation',
      click: () => { },
    },
  ]
}));

titleBar.updateMenu(menu);

const switchToTab = (tab) => {
  if (!tab) throw new Error("Oops");

  let activeTab = Array.from(document.getElementsByClassName("terminal__container-active"))[0];
  let activeTabHeader = Array.from(document.getElementsByClassName("terminal__header__tabItem-active"))[0];

  let targetTab = document.getElementById(`${tab}-terminal`);
  let targetTabHeader = document.getElementById(`${tab}-terminal-tab`);

  removeClass(activeTab, "terminal__container-active");
  removeClass(activeTabHeader, "terminal__header__tabItem-active");

  addClass(targetTab, "terminal__container-active");
  addClass(targetTabHeader, "terminal__header__tabItem-active");
}

(function () {
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
  const sampleCode = [
    "python`",
    "\tdef sayHello():",
    "\t\teuler.write(\"Hello from Python!\")",
    "\tsayHello()",
    "`",
    "print(\"Hello from EulerScript\")",
  ]
  amdRequire(["vs/editor/editor.main"], function () {
    const opts = {
      value: "",
      language: "javascript",
      lineNumbers: "on",
      roundedSelection: true,
      scrollBeyondLastLine: true,
      minimap: { enabled: false },
      readOnly: false,
      theme: "vs-dark",
      fontLigatures: true,
      automaticLayout: true,
      fontSize: 16,
      fontFamily: 'Consolas, "Fira code", monospace'
    };

    editor = monaco.editor.create(
      document.getElementById("editor"),
      opts
    );
  });
})();


