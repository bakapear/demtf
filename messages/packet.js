module.exports = {
  decode (stream) {
    let tick = stream.readInt32()
    let flags = stream.readInt32()

    let viewOrigin = [[], []]
    let viewAngles = [[], []]
    let localViewAngles = [[], []]

    for (let i = 0; i < 2; i++) {
      for (let o of [viewOrigin, viewAngles, localViewAngles]) {
        for (let j = 0; j < 3; j++) o[i][j] = stream.readFloat32()
      }
    }

    let sequenceIn = stream.readInt32()
    let sequenceOut = stream.readInt32()

    let length = stream.readInt32()
    let packetStream = stream.readBitStream(length * 8)

    return {
      tick,
      packetStream,
      flags,
      viewOrigin,
      viewAngles,
      localViewAngles,
      sequenceIn,
      sequenceOut
    }
  },
  encode (stream, message) {
    stream.writeInt32(message.tick)
    stream.writeInt32(message.flags)

    for (let i = 0; i < 2; i++) {
      for (let o of [message.viewOrigin, message.viewAngles, message.localViewAngles]) {
        for (let j = 0; j < 3; j++) stream.writeFloat32(o[i][j])
      }
    }

    stream.writeInt32(message.sequenceIn)
    stream.writeInt32(message.sequenceOut)

    stream.writeInt32(message.packetStream.length / 8)
    stream.writeBitStream(message.packetStream)
  }
}
