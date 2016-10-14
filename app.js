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

// Once electron has initialised
app.on('ready', () => {
  // Define the main window
  // (don't show it yet)
  mainWindow = new BrowserWindow({
    width: 480,
    height: 640,
    minWidth: 360,
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

ipcMain.on('text-request-req', (event, arg) => {
  storage.get('username', function(error, data) {
    if (error) throw error
    
    event.sender.send('text-request-res', data)
  })
})

ipcMain.on('text-update', (event, arg) => {
  storage.set('username', { username: arg })
})