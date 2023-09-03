module.exports = {
  decode (stream) {
    let tick = stream.readInt32()
    let flags = stream.readInt32()

    let viewOrigin = []
    let viewAngles = []
    let localViewAngles = []

    for (let i = 0; i < 2; i++) {
      viewOrigin[i] = [stream.readFloat32(), stream.readFloat32(), stream.readFloat32()]
      viewAngles[i] = [stream.readFloat32(), stream.readFloat32(), stream.readFloat32()]
      localViewAngles[i] = [stream.readFloat32(), stream.readFloat32(), stream.readFloat32()]
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
    throw Error('Not implemented yet')
    // packetStream deleted, replaced with packets array
  }
}
