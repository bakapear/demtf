let fs = require('fs')
let { TestStream } = require('./TestStream')

let DemTF = require('../')
let demo = new DemTF('./test/pov.dem')

let messageHandler = require('../messages')
let packetHandler = require('../packets')

let outputStream = new TestStream(1, demo.stream)

for (let message of demo.iterMessages()) {
  if (outputStream.index !== 0) outputStream.writeInt8(message.type)

  messageHandler.get(message.type).encode(outputStream, message)
}

let buffer = outputStream.buffer.slice(0, outputStream.index / 8)
// fs.writeFileSync('out.dem', buffer)
