module.exports = {
  decode (stream) {
    return {
      state: stream.readInt8(),
      count: stream.readInt32()
    }
  },
  encode (stream, packet) {
    throw Error('Not implemented yet')
  }
}
