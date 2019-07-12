const { app, BrowserWindow } = require('electron')
const path = require('path')

/* Configure electron-reload */
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindows;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // this is important since currently there is no support for scrollable menus
    minWidth: 600, // set a min width!
    minHeight: 300, // and a min height!
    webPreferences: {
      nodeIntegration: true,
    },
    frame: false
  })

  mainWindow.loadFile('index.html')

  //Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})