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

      if (magic !== 'SNAP') throw Error('Unknown compressed stringtable format')

      let decompressedData = snappy.uncompress(compressedData)

      if (decompressedData.byteLength !== decompressedByteSize) {
        throw Error('Incorrect length of decompressed stringtable')
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
        throw Error('Invalid string index for string table')
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
      table: {
        name: tableName,
        entries,
        maxEntries,
        fixedUserDataSize: userDataSize,
        fixedUserDataSizeBits: userDataSizeBits,
        compressed: isCompressed
      }
    }
  },
  encode (stream, packet) {
    stream.writeASCIIString(packet.table.name)
    stream.writeUint16(packet.table.maxEntries)
    let encodeBits = Math.floor(Math.log2(packet.table.maxEntries))
    let numEntries = packet.table.entries.filter((entry) => entry).length
    stream.writeBits(numEntries, encodeBits + 1)

    let entryData = new BitStream(new ArrayBuffer(guessStringTableEntryLength(packet.table, packet.table.entries)))
    encodeStringTableEntries(entryData, packet.table, packet.table.entries)
    if (packet.table.compressed) {
      let decompressedByteLength = Math.ceil(entryData.index / 8)
      entryData.index = 0
      let compressedData = snappy.compress(entryData.readArrayBuffer(decompressedByteLength))
      entryData = new BitStream(new ArrayBuffer(decompressedByteLength))
      entryData.writeUint32(decompressedByteLength)
      entryData.writeUint32(compressedData.byteLength + 4) // 4 magic bytes
      entryData.writeASCIIString('SNAP', 4)
      entryData.writeArrayBuffer(compressedData.buffer)
    }

    let entryLength = entryData.index
    entryData.index = 0

    if (stream.ignore) {
      let value = entryLength
      let bits = 0
      do {
        bits += 8
        value = value >> 7
      } while (value > 0)
      stream.ignore(bits)
    }
    stream.writeVarInt(entryLength)

    if (packet.table.fixedUserDataSize || packet.table.fixedUserDataSizeBits) {
      stream.writeBoolean(true)
      stream.writeBits(packet.table.fixedUserDataSize || 0, 12)
      stream.writeBits(packet.table.fixedUserDataSizeBits || 0, 4)
    } else {
      stream.writeBoolean(false)
    }

    stream.writeBoolean(packet.table.compressed)

    if (entryLength) {
      stream.ignore(entryLength)
      stream.writeBitStream(entryData, entryLength)
    }
  }
}

function getBestPreviousString (history, newString) {
  let bestIndex = -1
  let bestCount = 0
  for (let i = 0; i < history.length; i++) {
    let prev = history[i].text
    let similar = countSimilarCharacters(prev, newString)
    if (similar >= 3 && similar > bestCount) {
      bestCount = similar
      bestIndex = i
    }
  }
  return {
    index: bestIndex,
    count: bestCount
  }
}

let maxSimLength = 1 << 5

function countSimilarCharacters (a, b) {
  let length = Math.min(a.length, b.length, maxSimLength)
  for (let i = 0; i < length; i++) {
    if (a[i] !== b[i]) {
      return i
    }
  }
  return Math.min(length, maxSimLength - 1)
}

function encodeStringTableEntries (
  stream,
  table,
  entries,
  oldEntries = []
) {
  let entryBits = Math.floor(Math.log2(table.maxEntries))
  let lastIndex = -1
  let history = []
  for (let i = 0; i < entries.length; i++) {
    if (entries[i]) {
      let entry = entries[i]
      if (i !== (lastIndex + 1)) {
        stream.writeBoolean(false)
        stream.writeBits(i, entryBits)
      } else {
        stream.writeBoolean(true)
      }
      lastIndex = i

      if (typeof entry.text !== 'undefined' && !(oldEntries[i] && entry.text === oldEntries[i].text)) {
        stream.writeBoolean(true)

        let { index, count } = getBestPreviousString(history, entry.text)
        if (index !== -1) {
          stream.writeBoolean(true)
          stream.writeBits(index, 5)
          stream.writeBits(count, 5)
          stream.writeASCIIString(entry.text.substr(count))
        } else {
          stream.writeBoolean(false)
          stream.writeASCIIString(entry.text)
        }
      } else {
        stream.writeBoolean(false)
      }

      if (entry.extraData) {
        stream.writeBoolean(true)

        entry.extraData.index = 0
        if (table.fixedUserDataSize && table.fixedUserDataSizeBits) {
          stream.writeBitStream(entry.extraData, table.fixedUserDataSizeBits)
        } else {
          let byteLength = Math.ceil(entry.extraData.length / 8)
          stream.writeBits(byteLength, 14)
          stream.writeBitStream(entry.extraData, byteLength * 8)
        }
        entry.extraData.index = 0
      } else {
        stream.writeBoolean(false)
      }

      history.push(entry)
      if (history.length > 32) {
        history.shift()
      }
    }
  }
}

function guessStringTableEntryLength (table, entries) {
  // a rough guess of how many bytes are needed to encode the table entries
  let entryBits = Math.ceil(Math.floor(Math.log2(table.maxEntries)) / 8)
  return entries.reduce((length, entry) => {
    return length +
      entryBits +
      1 + // new index bit
      1 + // misc boolean
      1 + // substring bit
      (entry.text ? entry.text.length + 1 : 1) + // +1 for null termination
      (entry.extraData ? Math.ceil(entry.extraData.length / 8) : 0)
  }, 1)
}
