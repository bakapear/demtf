let DemTF = require('../')
let demo = new DemTF('./test/demo.dem')

let { TestStream } = require('./TestStream')
let messageHandler = require('../messages')

let outputStream = new TestStream(1, demo.stream)

for (let message of demo.iterMessages()) {
  if (outputStream.index !== 0) outputStream.writeInt8(message.type)
  messageHandler.get(message.type).encode(outputStream, message)
}
