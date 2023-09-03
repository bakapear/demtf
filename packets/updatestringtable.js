module.exports = {
  decode (stream) {
    let tableId = stream.readBits(5)
    let multipleChanged = stream.readBoolean()
    let changedEntries = multipleChanged ? stream.readUint16() : 1

    let length = stream.readBits(20)
    let messageStream = stream.readBitStream(length)

    // TODO: parse update string table

    return {
      tableId,
      multipleChanged,
      changedEntries
    }
  },
  encode (stream, packet) {
    throw Error('Not implemented yet')
  }
}
