module.exports = {
  decode (stream) {
    return { value: stream.readUTF8String() }
  },
  encode (stream, packet) {
    throw Error('Not implemented yet')
  }
}
