module.exports = {
  decode (stream) {
    return { index: stream.readBits(11) }
  },
  encode (stream, packet) {
    throw Error('Not implemented yet')
  }
}
