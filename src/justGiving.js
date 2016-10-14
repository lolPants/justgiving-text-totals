/*
  JustGiving Text Totals
  By Jack Baron (me@jackbaron.com)
  Licensed under ISC License

  JustGiving API Module
*/

// Require Dependencies
const request = require('request')

/**
 * Date Parsing function
 * @returns {integer} Parsed time in ms
 */
String.prototype.parseDate = function () {
  // MAGIC
  return (new Date(parseInt(this.split(/\(|\)/)[1].split("+")[0]))).getTime()
}

/**
 * Sort object properties (only own properties will be sorted).
 * @param {object} obj Object to sort properties
 * @param {string|int} sortedBy 1 - Sort object properties by specific value.
 * @returns {Array} Array of Items
 */
let sortProperties = function (obj, sortedBy) {
  // Default Sorting (First Key)
  sortedBy = sortedBy || 1

  // Define Arrays
  let sortable = []
  let output = []
  // Sort
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      sortable.push([key, obj[key]])
    }
  }
  sortable.sort(function (a, b) {
    return -1 * (a[1][sortedBy] - b[1][sortedBy])
  })
  // Make into nicer array
  for (j in sortable) {
    output.push(sortable[i][1])
  }
  // Return
  return output
}

/**
 * Module Constructor
 * @param {string} appId Application ID
 */
let JustGiving = function (appId) {
  // Throw if no appId is specified
  if (appId === undefined || appId === "") {
    throw new Error('API Key Required')
  } else {
    this.appId = appId
  }
}

/**
 * API Endpoint Requester
 * @param {string} endpoint JustGiving API Endpoint
 * @param {string} appId Application ID
 * @returns {promise} Promise
 */
let getEndpoint = function (endpoint, appId) {
  // Construct a new Promise
  return new Promise(function(fulfill, reject) {
    // Handle missing endpoint param
    if (endpoint === undefined || endpoint === "") reject('Invalid Endpoint')

    // Define request options
    let options = {
      url: `https://api.justgiving.com/${appId}/v1/fundraising/pages/${endpoint}`,
      headers: {
        'Accept': 'application/json'
      }
    }

    // HTTP Request
    request(options, (error, response, body) => {
      // Errror handling
      if (!error) {
        if (response.statusCode === 200) {
          // Fulfill the promise
          let json = JSON.parse(body)
          fulfill(json)
        } else {
          // Reject
          reject(`Error Code ${response.statusCode}\n${body}`)
        }
      } else {
        // Reject
        reject(error)
      }
    })
  })
}

/**
 * Donation Parsing
 * @param {object} json JSON Object to parse
 * @returns {array} Array of sorted and parsed donations.
 */
let parseDonations = function (json) {
  // Get relevant data
  let donations = json.donations

  // Parse all dates
  for (i in donations) {
    donations[i].donationDate = donations[i].donationDate.parseDate()
  }

  // Return the sorted array
  return sortProperties(donations, 'donationDate')
}

/**
 * Request data from a JustGiving API Endpoint
 * @param {string} endpoint API Endpoint to Query
 * @returns {promise}
 */
JustGiving.prototype.getEndpoint = function (endpoint) {
  // Get AppID from constructor
  appId = this.appId

  // Return a promise of the function
  return new Promise(function(fulfill, reject) {
    getEndpoint(endpoint, appId)
      .then(fulfill)
      .catch(reject)
  })
}

/**
 * Get a parsed list of recent donations
 * @param {string} endpoint Fundraiser page to query
 * @returns {promise}
 */
JustGiving.prototype.getDonations = function (endpoint) {
  // Get AppID from constructor
  appId = this.appId

  // Return a promise of a parsed function etc
  return new Promise(function(fulfill, reject) {
    getEndpoint(`${endpoint}/donations`, appId)
      .then(data => {
        fulfill(parseDonations(data))
      })
      .catch(reject)
  })
}

// Export Module
module.exports = JustGiving