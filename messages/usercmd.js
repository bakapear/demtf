module.exports = {
  decode (stream) {
    let tick = stream.readInt32()

    let sequenceOut = stream.readInt32()

    let length = stream.readInt32()
    let data = stream.readBitStream(length * 8)

    let cmd = { view: [] }
    if (data.readBoolean()) cmd.commandNumber = data.readUint32()
    if (data.readBoolean()) cmd.tick = data.readUint32()
    if (data.readBoolean()) cmd.view[0] = data.readFloat32()
    if (data.readBoolean()) cmd.view[1] = data.readFloat32()
    if (data.readBoolean()) cmd.view[2] = data.readFloat32()
    if (data.readBoolean()) cmd.forwardmove = data.readFloat32()
    if (data.readBoolean()) cmd.sidemove = data.readFloat32()
    if (data.readBoolean()) cmd.upmove = data.readFloat32()
    if (data.readBoolean()) cmd.buttons = data.readUint32()
    if (data.readBoolean()) cmd.impulse = data.readUint8()
    if (data.readBoolean()) {
      cmd.weaponselect = data.readBits(11)
      if (data.readBoolean()) cmd.weaponsubtype = data.readBits(6)
    }
    if (data.readBoolean()) data.mousedx = data.readUint16()
    if (data.readBoolean()) data.mousedy = data.readUint16()

    // 3 bits left?? need to know what this is otherwise encoding is not 1:1

    return {
      tick,
      sequenceOut,
      cmd
    }
  },
  encode (stream, message) {
    throw Error('Not implemented yet')
  }
}
