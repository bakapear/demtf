module.exports = {
  decode (stream) {
    let tick = stream.readInt32()
    stream.index += 32 // message stream length, no need to readbitstream if it just contains 1 thing to read
    let command = stream.readUTF8String()

    return { tick, command }
  },
  encode (stream, message) {
    stream.writeInt32(message.tick)
    stream.writeInt32(message.command.length + 1)
    stream.writeUTF8String(message.command)
  }
}
