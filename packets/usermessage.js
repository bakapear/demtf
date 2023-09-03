module.exports = {
  decode (stream) {
    let type = stream.readUint8()
    let length = stream.readBits(11)
    let messageStream = stream.readBitStream(length)

    console.log({ type, length })
  },
  encode (stream, packet) {
    throw Error('Not implemented yet')
  }
}
