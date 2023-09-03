module.exports = {
  decode (stream) {
    let entityCount = stream.readUint8()
    let length = stream.readVarInt()
    let entityData = stream.readBitStream(length)

    // TODO: parse temp entities
  },
  encode (stream, packet) {
    throw Error('Not implemented yet')
  }
}
