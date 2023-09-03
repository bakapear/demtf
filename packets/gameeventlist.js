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
    throw Error('Not implemented yet')
  }
}
