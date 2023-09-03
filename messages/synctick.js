module.exports = {
  decode (stream) {
    return { tick: stream.readInt32() }
  },
  encode (stream, message) {
    throw Error('Not implemented yet')
  }
}
