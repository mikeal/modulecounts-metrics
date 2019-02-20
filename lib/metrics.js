const fs = require('fs')
const mkcsv = require('mkcsv')
const path = require('path')
const { collection } = require('../../reed-richards')

const metrics = async (quarters, lines, argv) => {
  let dir = argv.outputDir
  let csv = mkcsv(lines)
  fs.writeFileSync(path.join(dir, 'quarterly.csv'), Buffer.from(csv))
  let c = collection('quarter', 'pkg', 'count')
  lines.forEach(l => c.set(l))
  let r = (prev, current, quarter) => {
    if (prev) {
      current.additions = current.count - prev.count
      current.growth = Math.round((current.additions / prev.count) * 100)
      if (current.growth === Infinity) delete current.growth

      // Hack (new package ecosystems start too large because of their relative size)
      if (current.growth > 38) delete current.growth
      
      if (current.growth) current.growth += '%'
    }
    current.quarter = quarter
    return current
  }
  let additionCollection = collection('quarter', 'pkg', 'additions')
  let growthCollection = collection('quarter', 'pkg', 'growth')
  for (let obj of c.reduce(r)) {
    if (obj.pkg === 'GoDoc (Go)') continue
    if (obj.additions) {
      additionCollection.set(obj)
    }
    if (obj.growth) {
      growthCollection.set(obj)
    }
  }

  csv = mkcsv(Array.from(additionCollection.objects()))
  fs.writeFileSync(path.join(dir, 'quarterly-additions.csv'), Buffer.from(csv))
  csv = mkcsv(Array.from(growthCollection.objects()))
  fs.writeFileSync(path.join(dir, 'quarterly-growth.csv'), Buffer.from(csv))
}

module.exports = metrics

