/*
  JustGiving Text Totals
  By Jack Baron (me@jackbaron.com)
  Licensed under ISC License
*/

// Define imports
const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const fs = require('fs')
const storage = require('electron-json-storage')
const config = require(__dirname + '/config.js')
const JustGiving = require(__dirname + '/src/justGiving.js')
const jg = new JustGiving(config.appId)

let doUpdate = false
let filePath = ""

// Once electron has initialised
app.on('ready', () => {
  // Define the main window
  // (don't show it yet)
  mainWindow = new BrowserWindow({
    width: 480,
    height: 360,
    minWidth: 420,
    minHeight: 300,
    icon: __dirname + '/app/img/app.ico',
    show: false
  })

  // Load window and show
  mainWindow.loadURL('file://' + __dirname + '/app/index.html')
  mainWindow.setMenu(null)
  mainWindow.show()

  // DEV MODE
  mainWindow.openDevTools()
})

// Once all windows have closed
app.on('window-all-closed', () => {
  // END
  // THAT
  // PROCESS!
  app.quit()
})

ipcMain.on('donation-data-req', (event, arg) => {
  jg.getDonations(arg)
    .then(arr => { event.sender.send('donation-data-res', arr) })
    .catch(err => { event.sender.send('donation-data-res', 'error') })
})

ipcMain.on('set-username', (event, arg) => {
  storage.set('username', { username: arg })
})
ipcMain.on('get-username-req', (event, arg) => {
  storage.get('username', function(error, data) {
    if (error) throw error
    
    event.sender.send('get-username-res', data)
  })
})

ipcMain.on('button-state-req', event => {
  event.sender.send('button-state-res', doUpdate)
})

ipcMain.on('enable-loop', event => {
  doUpdate = true
})
ipcMain.on('disable-loop', event => {
  doUpdate = false
})

ipcMain.on('set-file-path', (event, arg) => {
  filePath = arg
  storage.set('filePath', { path: arg })
})
ipcMain.on('get-file-path-req', (event, arg) => {
  storage.get('filePath', function(error, data) {
    if (error) throw error
    filePath = data.path
    event.sender.send('get-file-path-res', data.path)
  })
})

// Main Loop
setInterval( () => {
    if (!doUpdate) return
    if (filePath === undefined) return
    
    storage.get('username', function(error, data) {
      if (error) throw error
      let username = data.username
      
      jg.getEndpoint(username)
        .then(json => {
          let currency = json.currencySymbol

          jg.getDonations(username)
            .then(donations => {
              fs.writeFile(filePath, JSON.stringify(donations, null, 2), 'utf8', err => {
                if (err) console.log(err)
              })
            })
            .catch(console.log)
        })
        .catch(console.log)
    })
  },
  3000
)