module.exports = {
  decode (stream) {
    return { index: stream.readBits(11) }
  },
  encode (stream, packet) {
    stream.writeBits(packet.index, 11)
  }
}
