module.exports = {
  decode (stream) {
    return { value: stream.readUTF8String() }
  },
  encode (stream, packet) {
    stream.writeUTF8String(packet.value)
  }
}
