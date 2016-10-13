/*
  JustGiving Text Totals
  By Jack Baron (me@jackbaron.com)
  Licensed under ISC License

  JustGiving API Module
*/

let JustGiving = function (appId) {
  if (appId === undefined || appId === "") {
    throw new Error('API Key Required')
  } else {
    this.appId = appId
  }
}

JustGiving.prototype.getEndpoint = function () {
  let appId = this.appId
  return appId
}

module.exports = JustGiving