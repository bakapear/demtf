module.exports = {
  decode (stream) {
    return {}
  },
  encode (stream, message) {
    let bitsLeft = (Math.ceil(stream.index / 8) - (stream.index / 8)) * 8
    if (stream.ignore) stream.ignore(bitsLeft)
    stream.writeBits(0, bitsLeft)
  }
}
