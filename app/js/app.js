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

let filePath

$("#btn-on").click(function () {
  if ($(this).hasClass('disabled')) return

  ipcRenderer.send('donation-data-req', $("#username").val())
  $("#btn-on").addClass('disabled')
  $("#username").attr('disabled', 'disabled')
})

$("#btn-off").click(function () {
  if ($(this).hasClass('disabled')) return

  ipcRenderer.send('disable-loop')
  $("#btn-off").addClass('disabled')
  $("#btn-on").removeClass('disabled')
  $("#username").removeAttr('disabled', 'disabled')
})

$("#btn-output").click(function () {
  if ($(this).hasClass('disabled')) return

  console.log(filePath)
  let path = dialog.showOpenDialog({
    title: "Output File",
    defaultPath: filePath || null,
    properties: ['openDirectory']
  }, path => {
    ipcRenderer.send('set-file-path', path[0])
    filePath = path[0]
  })
})

ipcRenderer.on('donation-data-res', (event, arg) => {
  if (arg === 'error') {
    $("#btn-on").removeClass('disabled')
    $("#username").removeAttr('disabled', 'disabled')
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
  ipcRenderer.send('set-username', $(this).val())
})

ipcRenderer.send('get-username-req', '')
ipcRenderer.on('get-username-res', (event, arg) => {
  $("#username").val(arg.username)
})
ipcRenderer.send('get-file-path-req', '')
ipcRenderer.on('get-file-path-res', (event, arg) => {
  filePath = arg
})

ipcRenderer.send('button-state-req')
ipcRenderer.on('button-state-res', (event, arg) => {
  if (!arg) {
    $("#btn-on").removeClass('disabled')
    $("#btn-off").addClass('disabled')
    $("#username").removeAttr('disabled', 'disabled')
  } else {
    $("#btn-on").addClass('disabled')
    $("#btn-off").removeClass('disabled')
    $("#username").attr('disabled', 'disabled')
  }
})