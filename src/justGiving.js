/*
  JustGiving Text Totals
  By Jack Baron (me@jackbaron.com)
  Licensed under ISC License

  JustGiving API Module
*/

// Require Dependencies
const request = require('request')

String.prototype.parseDate = function () {
  return (new Date(parseInt(this.split(/\(|\)/)[1].split("+")[0]))).getTime()
}

let JustGiving = function (appId) {
  if (appId === undefined || appId === "") {
    throw new Error('API Key Required')
  } else {
    this.appId = appId
  }
}

let getEndpoint = function (endpoint, appId) {
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

let parseDonations = function (json) {
  let donations = json.donations
  for (i in donations) {
    donations[i].donationDate = donations[i].donationDate.parseDate()
  }
  return donations
}

JustGiving.prototype.getEndpoint = function (endpoint) {
  appId = this.appId
  return new Promise(function(fulfill, reject) {
    getEndpoint(endpoint, appId)
      .then(fulfill)
      .catch(reject)
  })
}

JustGiving.prototype.getDonations = function (endpoint) {
  appId = this.appId
  return new Promise(function(fulfill, reject) {
    getEndpoint(`${endpoint}/donations`, appId)
      .then(data => {
        fulfill(parseDonations(data))
      })
      .catch(reject)
  })
}

module.exports = JustGiving