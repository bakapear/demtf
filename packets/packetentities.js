module.exports = {
  decode (stream) {
    let maxEntries = stream.readBits(11)
    let isDelta = stream.readBoolean()
    let delta = (isDelta) ? stream.readInt32() : 0
    let baseLine = stream.readBits(1)
    let updatedEntries = stream.readBits(11)
    let length = stream.readBits(20)
    let updatedBaseLine = stream.readBoolean()

    let messageStream = stream.readBitStream(length)

    // TODO: parse packet entities

    return {
      maxEntries,
      isDelta,
      delta,
      baseLine,
      updatedEntries,
      updatedBaseLine
    }
  },
  encode (stream, packet) {
    throw Error('Not implemented yet')
  }
}
