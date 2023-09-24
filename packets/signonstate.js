module.exports = {
  decode (stream) {
    return {
      state: stream.readInt8(),
      count: stream.readInt32()
    }
  },
  encode (stream, packet) {
    stream.writeInt8(packet.state)
    stream.writeInt32(packet.count)
  }
}
