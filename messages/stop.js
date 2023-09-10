module.exports = {
  decode (stream) {
    return {}
  },
  encode (stream, message) {
    // magic 24 end bytes idk
    stream.writeBits(1599, 24)
  }
}
