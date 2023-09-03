module.exports = {
  decode (stream) {
    let tick = stream.readInt32()

    let length = stream.readInt32()
    let data = stream.readBitStream(length * 8)

    let tableCount = data.readUint8()
    let tables = []
    for (let i = 0; i < tableCount; i++) {
      let table = {
        name: data.readASCIIString(),
        maxEntries: data.readUint16(),
        entries: [],
        clientEntries: [],
        compressed: false
      }

      for (let j = 0; j < table.maxEntries; j++) {
        let entry = { text: data.readUTF8String() }
        if (data.readBoolean()) {
          let extraDataLength = data.readUint16()
          entry.extraData = data.readBitStream(extraDataLength * 8)
        }
        table.entries.push(entry)
      }

      if (data.readBoolean()) {
        let clientEntries = data.readUint16()
        for (let j = 0; j < clientEntries; j++) {
          let entry = { text: data.readUTF8String() }
          if (data.readBoolean()) {
            let extraDataLength = data.readUint16()
            entry.extraData = data.readBitStream(extraDataLength * 8)
          }
          table.clientEntries.push(entry)
        }
      }

      tables.push(table)
    }

    // 4 bits left?? need to know what this is otherwise encoding is not 1:1

    this.state.stringTables = tables

    return {
      tick,
      tables
    }
  },
  encode (stream, message) {
    throw Error('Not implemented yet')
  }
}
