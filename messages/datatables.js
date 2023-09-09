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
        let flags = data.readBits(16)
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
    stream.writeInt32(message.tick)

    stream.mark += 32 // tell teststream to skip 32 bits
    let startIndex = stream.index
    stream.index += 32

    for (let table of message.tables) {
      stream.writeBoolean(true)
      stream.writeBoolean(table.needsDecoder)
      stream.writeASCIIString(table.name)

      let len = table.props.length + table.props.filter(x => x.arrayProperty).length
      stream.writeBits(len, 10)

      for (let prop of table.props) {
        if (prop.arrayProperty) encodeSendPropDefinition(stream, prop.arrayProperty)
        encodeSendPropDefinition(stream, prop)
      }
    }

    stream.writeBoolean(false)

    stream.writeUint16(message.serverClasses.length)

    for (let serverClass of message.serverClasses) {
      stream.writeUint16(serverClass.id)
      stream.writeASCIIString(serverClass.name)
      stream.writeASCIIString(serverClass.dataTable)
    }

    // 3 mysterious remaining bits
    stream.writeBits(2, 1)
    stream.writeBits(0, 1)
    stream.writeBits(0, 1)

    let endIndex = stream.index

    stream.index = startIndex
    stream.writeInt32(endIndex / 8 - startIndex / 8 - 4)
    stream.index = endIndex
  }
}

function encodeSendPropDefinition (stream, prop) {
  stream.writeBits(prop.type, 5)
  stream.writeASCIIString(prop.name)
  stream.writeBits(prop.flags, 16)

  if (prop.type === SENDPROP_TYPE.DataTable) {
    if (!prop.table) throw new Error('Missing linked table')
    stream.writeASCIIString(prop.table.name)
  } else {
    if (prop.isExcludeProp()) {
      if (!prop.excludeDTName) throw new Error('Missing linked table')
      stream.writeASCIIString(prop.excludeDTName)
    } else if (prop.type === SENDPROP_TYPE.Array) {
      stream.writeBits(prop.numElements, 10)
    } else {
      stream.writeFloat32(prop.lowValue)
      stream.writeFloat32(prop.highValue)

      if (prop.hasFlag(SENDPROP_FLAG.NOSCALE) && (prop.type === SENDPROP_TYPE.Float || (prop.type === SENDPROP_TYPE.Vector && !prop.hasFlag(SENDPROP_FLAG.NORMAL)))) {
        if (prop.originalBitCount === null || typeof prop.originalBitCount === 'undefined') {
          stream.writeBits(prop.bitCount / 3, 7)
        } else {
          stream.writeBits(prop.originalBitCount, 7)
        }
      } else {
        stream.writeBits(prop.bitCount, 7)
      }
    }
  }
}
