const fs = require('fs')
const mkcsv = require('mkcsv')
const path = require('path')

const metrics = async (quarters, lines, argv) => {
  let dir = argv.outputDir

  let csv = mkcsv(lines)
  fs.writeFileSync(path.join(dir, 'quarterly.csv'), Buffer.from(csv))
}

module.exports = metrics

