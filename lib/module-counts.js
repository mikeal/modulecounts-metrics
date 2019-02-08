const fs = require('fs')
const path = require('path')
const bent = require('bent')
const fromEntries = require('fromentries')
const CsvReadableStream = require('csv-reader')

const toObject = (keys, values) => fromEntries(keys.map((key, i) => [key, values[i]]))
const get = bent()
 
const moduleCounts = async function * (input) {
  if (input.startsWith('http:') || input.startsWith('https:')) {
    input = await get(input)
  } else {
    input = fs.createReadStream(input, 'utf8')
  }
  input.setEncoding('utf8')
  let obj = { 
    skipEmptyLines: true,
    parseNumbers: true, 
    parseBooleans: true, 
    trim: true 
  }
  let csv = input.pipe(CsvReadableStream(obj))[Symbol.asyncIterator]()
  let { value } = await csv.next()
  let header = value
  let last = {}
  for await (let line of csv) {
    let obj = toObject(header, line)
    for (let [key, value] of Object.entries(obj)) {
      if (!value) {
        obj[key] = last[key]
      }
      if (!obj[key]) obj[key] = 0
      last[key] = obj[key]
    }
    yield obj
  }
}

module.exports = moduleCounts

