module.exports = {
  decode (stream) {
    return {
      tick: stream.readInt32(),
      frameTime: stream.readInt16(),
      stdDev: stream.readInt16()
    }
  },
  encode (stream, packet) {
    stream.writeInt32(packet.tick)
    stream.writeInt16(packet.frameTime)
    stream.writeInt16(packet.stdDev)
  }
}
