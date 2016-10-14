/*
  JustGiving Text Totals
  By Jack Baron (me@jackbaron.com)
  Licensed under ISC License
*/

// Define imports
const {ipcRenderer, remote} = require('electron')
const {Menu} = remote
const fs = remote.require('fs')

// App Menu
const template = [{label:'Edit',submenu:[{role:'cut'},{role:'copy'},{role:'paste'},{role:'delete'},{role:'selectall'}]},{label:'View',submenu:[{label:'Reload',accelerator:'CmdOrCtrl+R',click(item,focusedWindow){if(focusedWindow)focusedWindow.reload()}},{type:'separator'},{role:'togglefullscreen'}]},{role:'window',submenu:[{role:'minimize'},{role:'close'}]}]
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

$("#btn-on").click(function () {
  ipcRenderer.send('donation-data-req', $("#username").val())
  $("#btn-on").addClass('disabled')
})

ipcRenderer.on('donation-data-res', (event, arg) => {
  console.log(arg) // DEV
  if (arg === 'error') {
    $("#btn-on").removeClass('disabled')
  }
})

$("#username").keyup(function() {
  ipcRenderer.send('text-update', $(this).val())
})

ipcRenderer.send('text-request-req', '')
ipcRenderer.on('text-request-res', (event, arg) => {
  $("#username").val(arg.username)
})