let fs = require('fs')
let { TestStream } = require('./TestStream')

let DemTF = require('../')
let demo = new DemTF('./test/pov.dem')

let messageHandler = require('../messages')
let packetHandler = require('../packets')

let outputStream = new TestStream(demo.stream.length / 8, demo.stream)

for (let message of demo.iterMessages()) {
  if (outputStream.index !== 0) outputStream.writeInt8(message.type)

  if (message.packetStream) {
    let packetStream = new TestStream(message.packetStream._length / 8, message.packetStream)

    for (let packet of demo.iterPackets(message.packetStream)) {
      packetStream.writeBits(packet.type, 6)
      packetHandler.get(packet.type).encode(packetStream, packet)
    }

    message.packetStream = packetStream
  }

  messageHandler.get(message.type).encode(outputStream, message)
}

let buffer = outputStream.buffer.slice(0, outputStream.index / 8)
// fs.writeFileSync('out.dem', buffer)
