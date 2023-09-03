module.exports = {
  decode (stream) {
    let tick = stream.readInt32()
    stream.readInt32() // message stream length, no need to readbitstream if it just contains 1 thing to read
    let command = stream.readUTF8String()

    return { tick, command }
  },
  encode (stream, message) {
    throw Error('Not implemented yet')
  }
}
