module.exports = {
  decode (stream) {
    return {
      demofilestamp: stream.readASCIIString(8),
      demoprotocol: stream.readInt32(),
      networkprotocol: stream.readInt32(),
      servername: stream.readASCIIString(260),
      clientname: stream.readASCIIString(260),
      mapname: stream.readASCIIString(260),
      gamedirectory: stream.readASCIIString(260),
      playback_time: stream.readFloat32(),
      playback_ticks: stream.readInt32(),
      playback_frames: stream.readInt32(),
      signonlength: stream.readInt32()
    }
  },
  encode (stream, message) {
    stream.writeASCIIString(message.demofilestamp, 8)
    stream.writeInt32(message.demoprotocol)
    stream.writeInt32(message.networkprotocol)
    stream.writeASCIIString(message.servername, 260)
    stream.writeASCIIString(message.clientname, 260)
    stream.writeASCIIString(message.mapname, 260)
    stream.writeASCIIString(message.gamedirectory, 260)
    stream.writeFloat32(message.playback_time)
    stream.writeInt32(message.playback_ticks)
    stream.writeInt32(message.playback_frames)
    stream.writeInt32(message.signonlength)
  }
}
