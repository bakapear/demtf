module.exports = {
  decode (stream) {
    return { tick: stream.readInt32() }
  },
  encode (stream, message) {
    stream.writeInt32(message.tick)
  }
}
