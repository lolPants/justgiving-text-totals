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

// Scope Variables
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
  //mainWindow.openDevTools()
})

// Once all windows have closed
app.on('window-all-closed', () => {
  // END
  // THAT
  // PROCESS!
  app.quit()
})

// Event from Renderer Process
ipcMain.on('donation-data-req', (event, arg) => {
  // Send back response
  jg.getDonations(arg)
    .then(arr => { event.sender.send('donation-data-res', arr) })
    .catch(err => { event.sender.send('donation-data-res', 'error') })
})


// Event from Renderer Process
ipcMain.on('set-username', (event, arg) => {
  // Set username in storage
  storage.set('username', { username: arg })
})
// Event from Renderer Process
ipcMain.on('get-username-req', (event, arg) => {
  // Retreive username from storage
  storage.get('username', function(error, data) {
    if (error) throw error
    // Send Response
    event.sender.send('get-username-res', data)
  })
})

// Event from Renderer Process
ipcMain.on('button-state-req', event => {
  event.sender.send('button-state-res', doUpdate)
})

// Events from Renderer Process
// Turn loop on / off
ipcMain.on('enable-loop', event => {
  doUpdate = true
})
ipcMain.on('disable-loop', event => {
  doUpdate = false
})

// Events from Renderer Process
// Set
ipcMain.on('set-file-path', (event, arg) => {
  // Set locally and in storage
  filePath = arg
  storage.set('filePath', { path: arg })
})
// Get
ipcMain.on('get-file-path-req', (event, arg) => {
  // Get from storage
  storage.get('filePath', function(error, data) {
    if (error) throw error
    // Set locally
    filePath = data.path
    // Send response
    event.sender.send('get-file-path-res', data.path)
  })
})

// Main Loop
setInterval( () => {
    // Check if loop var is true
    if (!doUpdate) return
    // Check if filepath is empty
    if (filePath === undefined || filePath === "") return
    
    // Get username from storage
    storage.get('username', function(error, data) {
      // Handle Errors
      if (error) throw error

      // Set username locally
      let username = data.username
      
      // Get endpoint data for the username
      jg.getEndpoint(username)
        .then(json => {
          // Ease of use, store data
          let currency = json.currencySymbol
          let grandTotal = `${currency}${(Math.round(json.grandTotalRaisedExcludingGiftAid * 100)/100).toFixed(2)}`

          // Write to Grand Total file
          fs.writeFile(filePath + `/GrandTotal.txt`, grandTotal, 'utf8', err => {
            if (err) console.log(err)
          })

          // Get Recent Donations
          jg.getDonations(username)
            .then(donations => {
              // Start an output handler
              let output = "";
              // Limit to five most recent
              donations = donations.reverse().slice(0, 5)

              // Loop over donations
              for (i in donations) {
                // Get data
                let donation = donations[i]
                let amount = (donation.amount === null) ? 'Anonymous' : `${currency}${(Math.round(donation.amount * 100)/100).toFixed(2)}`
                
                // Append to output
                output += `${donation.donorDisplayName}: ${amount}   |   `
              }

              // Write entire output
              fs.writeFile(filePath + `/RecentDonations.txt`, output, 'utf8', err => {
                if (err) console.log(err)
              })
            })
            // Handle Errors
            .catch(console.log)
        })
        // Handle Errors
        .catch(console.log)
    })
  },
  // Loop every 10 seconds
  10000
)