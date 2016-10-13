/*
  JustGiving Text Totals
  By Jack Baron (me@jackbaron.com)
  Licensed under ISC License

  JustGiving API Module
*/

// Require Dependencies
const request = require('request')

let JustGiving = function (appId) {
  if (appId === undefined || appId === "") {
    throw new Error('API Key Required')
  } else {
    this.appId = appId
  }
}

JustGiving.prototype.getEndpoint = function (endpoint) {
  let appId = this.appId
  return new Promise(function(fulfill, reject) {
    if (endpoint === undefined || endpoint === "") reject('Invalid Endpoint')

    let options = {
      url: `https://api.justgiving.com/${appId}/v1/fundraising/pages/${endpoint}`,
      headers: {
        'Accept': 'application/json'
      }
    }

    request(options, (error, response, body) => {
      if (!error) {
        if (response.statusCode === 200) {
          let json = JSON.parse(body)
          fulfill(json)
        } else {
          reject(`Error Code ${response.statusCode}\n${body}`)
        }
      } else {
        reject(error)
      }
    })
  })
}

module.exports = JustGiving