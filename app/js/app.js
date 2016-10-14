/*
  JustGiving Text Totals
  By Jack Baron (me@jackbaron.com)
  Licensed under ISC License
*/

// Define imports
const {ipcRenderer, remote} = require('electron')
const {Menu, dialog} = remote
const fs = remote.require('fs')

// App Menu
const template = [{label:'Edit',submenu:[{role:'cut'},{role:'copy'},{role:'paste'},{role:'delete'},{role:'selectall'}]},{label:'View',submenu:[{label:'Reload',accelerator:'CmdOrCtrl+R',click(item,focusedWindow){if(focusedWindow)focusedWindow.reload()}},{type:'separator'},{role:'togglefullscreen'}]},{role:'window',submenu:[{role:'minimize'},{role:'close'}]}]
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

$("#btn-on").click(function () {
  if ($(this).hasClass('disabled')) return

  ipcRenderer.send('donation-data-req', $("#username").val())
  $("#btn-on").addClass('disabled')
})

$("#btn-off").click(function () {
  if ($(this).hasClass('disabled')) return

  ipcRenderer.send('disable-loop')
  $("#btn-off").addClass('disabled')
  $("#btn-on").removeClass('disabled')
})

$("#btn-output").click(function () {
  if ($(this).hasClass('disabled')) return

  let path = dialog.showSaveDialog({
    title: "Output File",
    filters: [
      {name: 'Text Files', extensions: ['txt']},
    ]
  }, path => {
    ipcRenderer.send('set-file-path', path)
  })
})

ipcRenderer.on('donation-data-res', (event, arg) => {
  if (arg === 'error') {
    $("#btn-on").removeClass('disabled')
    dialog.showMessageBox({
      type: "warning",
      title: "Error",
      message: "Invalid Fundraising Page ID",
      buttons: []
    })
  } else {
    console.log(arg)
    $("#btn-off").removeClass('disabled')
    ipcRenderer.send('enable-loop')
  }
})

$("#username").keyup(function() {
  ipcRenderer.send('text-update', $(this).val())
})

ipcRenderer.send('text-request-req', '')
ipcRenderer.on('text-request-res', (event, arg) => {
  $("#username").val(arg.username)
})

ipcRenderer.send('button-state-req')
ipcRenderer.on('button-state-res', (event, arg) => {
  if (!arg) {
    $("#btn-on").removeClass('disabled')
    $("#btn-off").addClass('disabled')
  } else {
    $("#btn-on").addClass('disabled')
    $("#btn-off").removeClass('disabled')
  }
})