module.exports = {
  decode (stream) {
    return {
      protocol: stream.readInt16(),
      serverCount: stream.readInt32(),
      isHLTV: stream.readBoolean(),
      isDedicated: stream.readBoolean(),
      clientCRC: stream.readUint32(),
      maxClasses: stream.readInt16(),
      mapHash: Buffer.from(stream.readArrayBuffer(16)).toString('base64'),
      playerSlot: stream.readInt8(),
      maxClients: stream.readInt8(),
      tickInterval: stream.readFloat32(),
      os: stream.readUTF8String(1),
      gameDir: stream.readUTF8String(),
      mapName: stream.readUTF8String(),
      skyName: stream.readUTF8String(),
      hostName: stream.readUTF8String(),
      isReplay: stream.readBoolean()
    }
  },
  encode (stream, packet) {
    stream.writeInt16(packet.protocol)
    stream.writeInt32(packet.serverCount)
    stream.writeBoolean(packet.isHLTV)
    stream.writeBoolean(packet.isDedicated)
    stream.writeUint32(packet.clientCRC)
    stream.writeInt16(packet.maxClasses)
    stream.writeArrayBuffer(new Uint8Array(Buffer.from(packet.mapHash, 'base64')).buffer, 16)
    stream.writeInt8(packet.playerSlot)
    stream.writeInt8(packet.maxClients)
    stream.writeFloat32(packet.tickInterval)
    stream.writeUTF8String(packet.os, 1)
    stream.writeUTF8String(packet.gameDir)
    stream.writeUTF8String(packet.mapName)
    stream.writeUTF8String(packet.skyName)
    stream.writeUTF8String(packet.hostName)
    stream.writeBoolean(packet.isReplay)
  }
}
