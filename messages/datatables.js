let { SENDPROP_TYPE, SENDPROP_FLAG } = require('../constants')
let { SendTable, ServerClass, SendPropDefinition } = require('../models')

module.exports = {
  decode (stream) {
    let tick = stream.readInt32()

    let length = stream.readInt32()
    let data = stream.readBitStream(length * 8)

    let tables = []
    let tableMap = new Map()

    while (data.readBoolean()) {
      let needsDecoder = data.readBoolean()
      let tableName = data.readASCIIString()
      let numProps = data.readBits(10)
      let table = new SendTable(tableName)
      table.needsDecoder = needsDecoder

      // get props metadata
      let arrayElementProp
      for (let i = 0; i < numProps; i++) {
        let propType = data.readBits(5)
        let propName = data.readASCIIString()
        let nFlagsBits = 16 // might be 11 (old?), 13 (new?), 16(networked) or 17(??)
        let flags = data.readBits(nFlagsBits)
        let prop = new SendPropDefinition(propType, propName, flags, tableName)
        if (propType === SENDPROP_TYPE.DataTable) {
          prop.excludeDTName = data.readASCIIString()
        } else {
          if (prop.isExcludeProp()) {
            prop.excludeDTName = data.readASCIIString()
          } else if (prop.type === SENDPROP_TYPE.Array) {
            prop.numElements = data.readBits(10)
          } else {
            prop.lowValue = data.readFloat32()
            prop.highValue = data.readFloat32()
            prop.bitCount = data.readBits(7)
          }
        }

        if (prop.hasFlag(SENDPROP_FLAG.NOSCALE)) {
          if (prop.type === SENDPROP_TYPE.Float) {
            prop.originalBitCount = prop.bitCount
            prop.bitCount = 32
          } else if (prop.type === SENDPROP_TYPE.Vector) {
            if (!prop.hasFlag(SENDPROP_FLAG.NORMAL)) {
              prop.originalBitCount = prop.bitCount
              prop.bitCount = 32 * 3
            }
          }
        }

        if (arrayElementProp) {
          if (prop.type !== SENDPROP_TYPE.Array) throw Error('Expected prop of type array')
          prop.arrayProperty = arrayElementProp
          arrayElementProp = null
        }

        if (prop.hasFlag(SENDPROP_FLAG.INSIDEARRAY)) {
          if (arrayElementProp) throw Error('Array element already set')
          if (prop.hasFlag(SENDPROP_FLAG.CHANGES_OFTEN)) throw Error('Unexpected CHANGES_OFTEN prop in array')
          arrayElementProp = prop
        } else table.addProp(prop)
      }
      tables.push(table)
      tableMap.set(table.name, table)
    }

    // link referenced tables
    for (let table of tables) {
      for (let prop of table.props) {
        if (prop.type === SENDPROP_TYPE.DataTable) {
          if (prop.excludeDTName) {
            let referencedTable = tableMap.get(prop.excludeDTName)
            if (!referencedTable) {
              throw Error(`Unknown referenced table ${prop.excludeDTName}`)
            }
            prop.table = referencedTable
            prop.excludeDTName = null
          }
        }
      }
    }

    let numServerClasses = data.readUint16() // short
    let serverClasses = []
    if (numServerClasses <= 0) throw Error('Expected one or more serverclasses')

    for (let i = 0; i < numServerClasses; i++) {
      let classId = data.readUint16()
      if (classId > numServerClasses) throw Error('Invalid class id')

      let className = data.readASCIIString()
      let dataTable = data.readASCIIString()
      serverClasses.push(new ServerClass(classId, className, dataTable))
    }

    if (data.bitsLeft > 7) throw Error('Unexpected remaining data in datatable (' + data.bitsLeft + ' bits)')

    this.state.serverClasses = serverClasses
    this.state.sendTables = tableMap

    return {
      tick,
      tables,
      serverClasses
    }
  },
  encode (stream, message) {
    throw Error('Not implemented yet')
  }
}
