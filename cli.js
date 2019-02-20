const yargs = require('yargs')
const path = require('path')
const mkdirp = require('mkdirp')
const moduleCounts = require('./lib/module-counts')
const metrics = require('./lib/metrics')

const getQuarter = dt => {
  dt = new Date(dt)
  let quarter = dt.getFullYear() + ' '
  let month = dt.getMonth()
  if (month < 3) {
    quarter += 'Q1'
  } else if (month < 6) {
    quarter += 'Q2'
  } else if (month < 9) {
    quarter += 'Q3'
  } else {
    quarter += 'Q4'
  }
  return quarter
}


const run = async argv => {
  mkdirp.sync(argv.outputDir)
  const reader = moduleCounts(argv.file)
  let current = {quarter: null, metrics: null}
  let lines = []
  let quarters = {}
  let thisQuarter = getQuarter(new Date())
  for await (let line of reader) {
    let quarter = getQuarter(line.date)
    if (quarter === thisQuarter) break
    if (current.quarter !== quarter) {
      if (current.quarter) {
        delete current.metrics.date
        for (let [key, value] of Object.entries(current.metrics)) {
          lines.push({quarter, pkg: key, count: value})
        }
        quarters[quarter] = current.metrics
      }
    }
    current = {quarter, metrics: line}
  }
  metrics(quarters, lines, argv)
}

const argv = yargs
  .command({
    command: '$0 [file]', 
    desc: 'Generate module count metric csv files',
    handler: run,
    builder: yargs => {
      yargs.positional('file', {
        describe: 'Source csv file',
        default: 'http://www.modulecounts.com/modulecounts.csv'
      })
      yargs.option('outputDir', {
        describe: 'Output directory',
        default: path.join(process.cwd(), 'metrics')
      })
    }
  })
  .scriptName('modulecounts-metrics')
  .argv


