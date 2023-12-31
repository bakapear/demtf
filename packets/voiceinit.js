module.exports = {
  decode (stream) {
    let codec = stream.readASCIIString()
    let quality = stream.readUint8()
    let extraData = 0
    if (quality === 255) extraData = stream.readUint16()
    else if (codec === 'vaudio_celt') extraData = 11025

    return {
      codec,
      quality,
      extraData
    }
  },
  encode (stream, packet) {
    stream.writeASCIIString(packet.codec)
    stream.writeUint8(packet.quality)
    if (packet.quality === 255) {
      stream.writeUint16(packet.extraData)
    }
  }
}
