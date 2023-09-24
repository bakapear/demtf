module.exports = {
  decode (stream) {
    let numEvents = stream.readBits(9)
    let length = stream.readBits(20)
    let listData = stream.readBitStream(length)

    let eventList = new Map()

    for (let i = 0; i < numEvents; i++) {
      let id = listData.readBits(9)
      let name = listData.readASCIIString()
      let type = listData.readBits(3)

      let entries = []
      while (type !== 0) {
        entries.push({
          type,
          name: listData.readASCIIString()
        })
        type = listData.readBits(3)
      }

      eventList.set(id, { id, name, entries })
    }

    return { eventList }
  },
  encode (stream, packet) {
    let definitions = Array.from(packet.eventList.values())
    stream.writeBits(definitions.length, 9)

    let lengthIndex = stream.index
    if (stream.ignore) {
      stream.ignore(20)
      stream.compareStream.index += 20
    }
    stream.index += 20

    let startIndex = stream.index

    for (let definition of definitions) {
      stream.writeBits(definition.id, 9)
      stream.writeASCIIString(definition.name)
      for (let entry of definition.entries) {
        stream.writeBits(entry.type, 3)
        stream.writeASCIIString(entry.name)
      }
      stream.writeBits(0, 3)
    }

    let endIndex = stream.index

    stream.index = lengthIndex
    stream.writeBits(endIndex - startIndex, 20)

    stream.index = endIndex
  }
}
