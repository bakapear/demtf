module.exports = {
  decode (stream) {
    let tick = stream.readInt32()

    let sequenceOut = stream.readInt32()

    let length = stream.readInt32()
    let data = stream.readBitStream(length * 8)

    let cmd = { }
    if (data.readBoolean()) cmd.commandNumber = data.readUint32()
    if (data.readBoolean()) cmd.tick = data.readUint32()
    if (data.readBoolean()) cmd.view0 = data.readFloat32()
    if (data.readBoolean()) cmd.view1 = data.readFloat32()
    if (data.readBoolean()) cmd.view2 = data.readFloat32()
    if (data.readBoolean()) cmd.forwardmove = data.readFloat32()
    if (data.readBoolean()) cmd.sidemove = data.readFloat32()
    if (data.readBoolean()) cmd.upmove = data.readFloat32()
    if (data.readBoolean()) cmd.buttons = data.readUint32()
    if (data.readBoolean()) cmd.impulse = data.readUint8()
    if (data.readBoolean()) {
      cmd.weaponselect = data.readBits(11)
      if (data.readBoolean()) cmd.weaponsubtype = data.readBits(6)
    }
    if (data.readBoolean()) cmd.mousedx = data.readUint16()
    if (data.readBoolean()) cmd.mousedy = data.readUint16()

    return {
      tick,
      sequenceOut,
      cmd
    }
  },
  encode (stream, message) {
    stream.writeInt32(message.tick)
    stream.writeInt32(message.sequenceOut)

    let startIndex = stream.index
    if (stream.ignore) {
      stream.ignore(32)
      stream.compareStream.index += 32
    }
    stream.index += 32

    let cmd = message.cmd

    if ('commandNumber' in cmd) {
      stream.writeBoolean(true)
      stream.writeUint32(cmd.commandNumber)
    } else stream.writeBoolean(false)

    if ('tick' in cmd) {
      stream.writeBoolean(true)
      stream.writeUint32(cmd.tick)
    } else stream.writeBoolean(false)

    if ('view0' in cmd) {
      stream.writeBoolean(true)
      stream.writeFloat32(cmd.view0)
    } else stream.writeBoolean(false)

    if ('view1' in cmd) {
      stream.writeBoolean(true)
      stream.writeFloat32(cmd.view1)
    } else stream.writeBoolean(false)

    if ('view2' in cmd) {
      stream.writeBoolean(true)
      stream.writeFloat32(cmd.view2)
    } else stream.writeBoolean(false)

    if ('forwardmove' in cmd) {
      stream.writeBoolean(true)
      stream.writeFloat32(cmd.forwardmove)
    } else stream.writeBoolean(false)

    if ('sidemove' in cmd) {
      stream.writeBoolean(true)
      stream.writeFloat32(cmd.sidemove)
    } else stream.writeBoolean(false)

    if ('upmove' in cmd) {
      stream.writeBoolean(true)
      stream.writeFloat32(cmd.upmove)
    } else stream.writeBoolean(false)

    if ('buttons' in cmd) {
      stream.writeBoolean(true)
      stream.writeUint32(cmd.buttons)
    } else stream.writeBoolean(false)

    if ('impulse' in cmd) {
      stream.writeBoolean(true)
      stream.writeUint8(cmd.impulse)
    } else stream.writeBoolean(false)

    if ('weaponselect' in cmd) {
      stream.writeBoolean(true)
      stream.writeBits(cmd.weaponselect, 11)
      if ('weaponsubtype' in cmd) {
        stream.writeBoolean(true)
        stream.writeBits(cmd.weaponsubtype, 6)
      } else stream.writeBoolean(false)
    } else stream.writeBoolean(false)

    if ('mousedx' in cmd) {
      stream.writeBoolean(true)
      stream.writeUint16(cmd.mousedx)
    } else stream.writeBoolean(false)

    if ('mousedy' in cmd) {
      stream.writeBoolean(true)
      stream.writeUint16(cmd.mousedy)
    } else stream.writeBoolean(false)

    let bitsLeft = (Math.ceil(stream.index / 8) - (stream.index / 8)) * 8
    if (stream.ignore) stream.ignore(bitsLeft)
    stream.writeBits(0, bitsLeft)

    let endIndex = stream.index
    stream.index = startIndex
    stream.writeInt32(endIndex / 8 - startIndex / 8 - 4)
    stream.index = endIndex
  }
}
