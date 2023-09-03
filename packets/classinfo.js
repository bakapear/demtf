module.exports = {
  decode (stream) {
    let count = stream.readUint16()
    let create = stream.readBoolean()
    let entries = []

    if (!create) {
      let bits = Math.floor(Math.log2(count)) + 1
      for (let i = 0; i < count; i++) {
        entries.push({
          classId: stream.readBits(bits),
          className: stream.readASCIIString(),
          dataTableName: stream.readASCIIString()
        })
      }
    }

    return { count, create, entries }
  },
  encode (stream, packet) {
    throw Error('Not implemented yet')
  }
}
