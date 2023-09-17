let fs = require('fs')
let { TestWriteStream } = require('./TestWriteStream')
let { TestReadStream } = require('./TestReadStream')

let DemTF = require('../')
let demo = new DemTF('./test/pov.dem')

let messageHandler = require('../messages')
let packetHandler = require('../packets')

demo.stream = new TestReadStream(demo.stream)

let outputStream = new TestWriteStream(demo.stream.length / 8, demo.stream)

for (let message of demo.iterMessages()) {
  if (outputStream.index !== 0) {
    outputStream.writeUint8(message.type)
  }

  if (message.packetStream) {
    message.packetStream = new TestReadStream(message.packetStream)

    let packetStream = new TestWriteStream(message.packetStream._length / 8, message.packetStream)

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
