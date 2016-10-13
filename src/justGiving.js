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

/**
 * Sort object properties (only own properties will be sorted).
 * @param {object} obj Object to sort properties
 * @param {string|int} sortedBy 1 - Sort object properties by specific value.
 * @returns {Array} Array of Items
 */
let sortProperties = function (obj, sortedBy) {
  sortedBy = sortedBy || 1 // Default Sorting (First Key)

  let sortable = []
  let output = []
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      sortable.push([key, obj[key]])
    }
  }
  sortable.sort(function (a, b) {
    return -1 * (a[1][sortedBy] - b[1][sortedBy])
  })
  for (j in sortable) {
    output.push(sortable[i][1])
  }
  return output
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
  return sortProperties(donations, 'donationDate')
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