let { SENDPROP_TYPE, SENDPROP_FLAG } = require('../constants')

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
      let table = {
        name: tableName,
        needsDecoder,
        props: []
      }

      let arrayElementProp
      for (let i = 0; i < numProps; i++) {
        let nFlagsBits = 16 // might be 11 (old?), 13 (new?), 16(networked) or 17(??)

        let prop = {
          type: data.readBits(5),
          name: data.readASCIIString(),
          flags: data.readBits(nFlagsBits)
        }

        if (prop.type === SENDPROP_TYPE.DataTable) {
          prop.excludeDTName = data.readASCIIString()
        } else {
          if ((prop.flags & SENDPROP_FLAG.SPROP_EXCLUDE) !== 0) {
            prop.excludeDTName = data.readASCIIString()
          } else if (prop.type === SENDPROP_TYPE.Array) {
            prop.numElements = data.readBits(10)
          } else {
            prop.lowValue = data.readFloat32()
            prop.highValue = data.readFloat32()
            prop.bitCount = data.readBits(7)
          }
        }

        if ((prop.flags & SENDPROP_FLAG.SPROP_NOSCALE) !== 0) {
          if (prop.type === SENDPROP_TYPE.Float) {
            prop.originalBitCount = prop.bitCount
            prop.bitCount = 32
          } else if (prop.type === SENDPROP_TYPE.Vector) {
            if ((prop.flags & SENDPROP_FLAG.SPROP_NORMAL) === 0) {
              prop.originalBitCount = prop.bitCount
              prop.bitCount = 32 * 3
            }
          }
        }

        if (arrayElementProp) {
          if (prop.type !== SENDPROP_TYPE.Array) throw new Error('Expected prop of type array')
          prop.arrayProperty = arrayElementProp
          arrayElementProp = null
        }

        if ((prop.flags & SENDPROP_FLAG.SPROP_INSIDEARRAY) !== 0) {
          if (arrayElementProp) throw new Error('Array element already set')
          if ((prop.flags & SENDPROP_FLAG.SPROP_CHANGES_OFTEN) !== 0) throw new Error('Unexpected CHANGES_OFTEN prop in array')
          arrayElementProp = prop
        } else {
          table.props.push(prop)
        }
      }
      tables.push(table)
      tableMap.set(table.name, table)
    }

    for (let table of tables) {
      for (let prop of table.props) {
        if (prop.type === SENDPROP_TYPE.DataTable) {
          if (prop.excludeDTName) {
            let referencedTable = tableMap.get(prop.excludeDTName)
            if (!referencedTable) Error(`Unknown referenced table ${prop.excludeDTName}`)
            prop.table = referencedTable
            prop.excludeDTName = null
          }
        }
      }
    }

    let numServerClasses = data.readUint16()
    let serverClasses = []
    if (numServerClasses <= 0) throw new Error('Expected one or more serverclasses')

    for (let i = 0; i < numServerClasses; i++) {
      let classId = data.readUint16()
      if (classId > numServerClasses) throw new Error('Invalid class id')

      serverClasses.push({
        id: classId,
        name: data.readASCIIString(),
        dataTable: data.readASCIIString()
      })
    }

    if (data.bitsLeft > 7) throw new Error('Unexpected remaining data in datatable (' + data.bitsLeft + ' bits)')

    // 3 bits left?? need to know what this is otherwise encoding is not 1:1

    this.state.dataTables = tables
    this.state.serverClasses = serverClasses

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
