/*
  JustGiving Text Totals
  By Jack Baron (me@jackbaron.com)
  Licensed under ISC License
*/

// Define imports
const {ipcRenderer, remote} = require('electron')
const {Menu} = remote
const fs = remote.require('fs')

const template = [{label:'Edit',submenu:[{role:'cut'},{role:'copy'},{role:'paste'},{role:'delete'},{role:'selectall'}]},{label:'View',submenu:[{label:'Reload',accelerator:'CmdOrCtrl+R',click(item,focusedWindow){if(focusedWindow)focusedWindow.reload()}},{type:'separator'},{role:'togglefullscreen'}]},{role:'window',submenu:[{role:'minimize'},{role:'close'}]}]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

console.log(fs.readdirSync(__dirname))