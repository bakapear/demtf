let { BitStream } = require('../lib/bit-buffer')
let snappy = require('../lib/snappyjs')

module.exports = {
  decode (stream) {
    let tableName = stream.readASCIIString()
    let maxEntries = stream.readUint16()
    let encodeBits = Math.floor(Math.log2(maxEntries))
    let entityCount = stream.readBits(encodeBits + 1)
    let bitCount = stream.readVarInt()

    let userDataSize = 0
    let userDataSizeBits = 0

    if (stream.readBoolean()) {
      userDataSize = stream.readBits(12)
      userDataSizeBits = stream.readBits(4)
    }

    let isCompressed = stream.readBoolean()

    let data = stream.readBitStream(bitCount)

    if (isCompressed) {
      let decompressedByteSize = data.readUint32()
      let compressedByteSize = data.readUint32()

      let magic = data.readASCIIString(4)

      let compressedData = data.readArrayBuffer(compressedByteSize - 4)

      if (magic !== 'SNAP') throw new Error('Unknown compressed stringtable format')

      let decompressedData = snappy.uncompress(compressedData)

      if (decompressedData.byteLength !== decompressedByteSize) {
        throw new Error('Incorrect length of decompressed stringtable')
      }

      data = new BitStream(decompressedData.buffer)
    }

    let existingEntries = []
    let entryBits = Math.floor(Math.log2(maxEntries))
    let entries = []
    let lastEntry = -1

    let history = []

    for (let i = 0; i < entityCount; i++) {
      let entryIndex = !data.readBoolean() ? data.readBits(entryBits) : lastEntry + 1
      lastEntry = entryIndex

      if (entryIndex < 0 || entryIndex > maxEntries) {
        throw new Error('Invalid string index for string table')
      }

      let value

      if (data.readBoolean()) {
        if (data.readBoolean()) {
          let index = data.readBits(5)
          let bytesToCopy = data.readBits(5)
          let restOfString = data.readASCIIString()

          if (!history[index].text) value = restOfString
          else value = history[index].text.substr(0, bytesToCopy) + restOfString
        } else value = data.readASCIIString()
      }

      let userData

      if (data.readBoolean()) {
        if (userDataSize && userDataSizeBits) {
          userData = data.readBitStream(userDataSizeBits)
        } else {
          userData = data.readBitStream(data.readBits(14) * 8)
        }
      }

      if (existingEntries[entryIndex]) {
        let existingEntry = { ...existingEntries[entryIndex] }
        if (userData) existingEntry.extraData = userData

        if (typeof value !== 'undefined') existingEntry.text = value
        entries[entryIndex] = existingEntry
        history.push(existingEntry)
      } else {
        entries[entryIndex] = {
          text: value,
          extraData: userData
        }
        history.push(entries[entryIndex])
      }

      if (history.length > 32) history.shift()
    }

    return {
      tableName,
      entries,
      maxEntries,
      fixedUserDataSize: userDataSize,
      fixedUserDataSizeBits: userDataSizeBits,
      compressed: isCompressed
    }
  },
  encode (stream, packet) {
    throw Error('Not implemented yet')
  }
}
