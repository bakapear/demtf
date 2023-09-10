let DemTF = require('../')
let demo = new DemTF('./test/pov.dem')

let { TestStream } = require('./TestStream')
let messageHandler = require('../messages')

let outputStream = new TestStream(1, demo.stream)

for (let message of demo.iterMessages()) {
  if (outputStream.index !== 0) outputStream.writeInt8(message.type)
  messageHandler.get(message.type).encode(outputStream, message)
}

let A = outputStream.buffer.slice(0, outputStream.index / 8)
let B = demo.stream.buffer

let AB = Buffer.compare(A, B)
console.log('DECODE', B)
console.log('ENCODE', A)
console.log(AB)
