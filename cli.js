const yargs = require('yargs')
const path = require('path')
const mkdirp = require('mkdirp')
const moduleCounts = require('./lib/module-counts')

const run = async argv => {
  mkdirp.sync(argv.outputDir)
  const reader = moduleCounts(argv.file)
  for await (let line of reader) {
    console.log(line)
  }
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
  .argv


