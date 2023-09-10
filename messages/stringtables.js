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
        let entry = readEntry(data)
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

      if (table.name === 'userinfo') {
        for (let entry of table.entries) {
          if (entry && entry.extraData) {
            if (entry.extraData.bitsLeft > (32 * 8)) {
              let name = entry.extraData.readUTF8String(32)
              let userId = entry.extraData.readUint32()
              while (userId > 256) userId -= 256
              let steamId = entry.extraData.readUTF8String()
              if (steamId) {
                let entityId = parseInt(entry.text, 10) + 1
                let userState = this.state.userInfo.get(userId)

                if (!userState) {
                  userState = { name: '', userId, steamId: '', entityId }
                  this.state.userInfo.set(userState.userId, userState)
                }

                userState.name = name
                userState.steamId = steamId
              }
            }
          }
        }
      } else if (table.name === 'instancebaseline') {
        for (let entry of table.entries) {
          if (entry && entry.extraData) {
            let serverClassId = parseInt(entry.text, 10)
            this.state.staticBaselineCache.delete(serverClassId)
            this.state.staticBaseLines.set(serverClassId, entry.extraData)
          }
        }
      }
    }

    this.state.stringTables = tables

    return {
      tick,
      tables
    }
  },
  encode (stream, message) {
    stream.writeInt32(message.tick)

    let startIndex = stream.index
    stream.index += 32

    stream.writeUint8(message.tables.length)

    for (let table of message.tables) {
      stream.writeASCIIString(table.name)
      stream.writeUint16(table.entries.length)

      for (let entry of table.entries) writeEntry(stream, entry)

      if (table.clientEntries && table.clientEntries.length) {
        stream.writeBoolean(true)
        stream.writeUint16(table.clientEntries.length)
        for (let entry of table.clientEntries) writeEntry(stream, entry)
      } else stream.writeBoolean(false)
    }

    let bitsLeft = (Math.ceil(stream.index / 8) - (stream.index / 8)) * 8
    if (stream.ignore) stream.ignore(bitsLeft)
    stream.writeBits(0, bitsLeft)

    let endIndex = stream.index
    stream.index = startIndex
    stream.writeInt32(endIndex / 8 - startIndex / 8 - 4)
    stream.index = endIndex
  }
}

function readEntry (stream) {
  let entry = { text: stream.readUTF8String() }
  if (stream.readBoolean()) {
    let extraDataLength = stream.readUint16()
    entry.extraData = stream.readBitStream(extraDataLength * 8)
  }
  return entry
}

function writeEntry (stream, entry) {
  stream.writeUTF8String(entry.text)
  if (entry.extraData) {
    stream.writeBoolean(true)

    stream.writeUint16(Math.ceil(entry.extraData.length / 8))
    entry.extraData.index = 0
    stream.writeBitStream(entry.extraData, entry.extraData.length)
  } else {
    stream.writeBoolean(false)
  }
}
