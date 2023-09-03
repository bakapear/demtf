module.exports = {
  decode (stream) {
    return {
      tick: stream.readInt32(),
      frameTime: stream.readInt16(),
      stdDev: stream.readInt16()
    }
  },
  encode (stream, packet) {
    throw Error('Not implemented yet')
  }
}
