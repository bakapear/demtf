let fs = require('fs')
let { BitStream, DynamicBitStream } = require('./lib/bit-buffer')

let messageHandler = require('./messages')
let packetHandler = require('./packets')

let { MESSAGE_TYPE } = require('./constants')

let HEADER_LENGTH = 8576

function DemTF (buffer) {
  let data = typeof buffer === 'string' ? fs.readFileSync(buffer) : buffer
  this.stream = new BitStream(data)
  this.state = {}
}

DemTF.prototype.getHeader = function () {
  this.stream.index = 0
  let header = this.iterMessages().next().value
  delete header.type
  return header
}

DemTF.prototype.getMessages = function () {
  this.stream.index = HEADER_LENGTH
  let messages = []
  for (let message of this.iterMessages()) {
    if (message.packetStream) {
      message.packets = []
      for (let packet of this.iterPackets(message.packetStream)) {
        message.packets.push(packet)
      }
      delete message.packetStream
    }
    messages.push(message)
  }
  return messages
}

DemTF.prototype.getPackets = function () {
  this.stream.index = HEADER_LENGTH
  let packets = []
  for (let message of this.iterMessages()) {
    if (message.packetStream) {
      message.packets = []
      for (let packet of this.iterPackets(message.packetStream)) {
        packets.push(packet)
      }
    }
  }
  return packets
}

DemTF.prototype.iterMessages = function * () {
  while (this.stream.bitsLeft > 24) {
    let type = this.stream.index === 0 ? MESSAGE_TYPE.HEADER : this.stream.readUint8()
    let message = { type, ...messageHandler.get(type).decode.call(this, this.stream) }
    yield message
  }
}

DemTF.prototype.iterPackets = function * (stream) {
  while (stream.bitsLeft > 6) {
    let type = stream.readBits(6)
    if (type === 0) continue
    let packet = { type, ...packetHandler.get(type).decode.call(this, stream) }
    yield packet
  }
}

DemTF.prototype.transform = function (packetsFn, messagesFn, outputFile) {
  this.stream.index = 0

  let outputStream = new DynamicBitStream(32 * 1024 * 1024)

  for (let message of this.iterMessages()) {
    if (message.packetStream) {
      message.packets = []
      for (let packet of this.iterPackets(message.packetStream)) {
        message.packets.push(packet)

        if (packetsFn) packet = packetsFn(packet)
        packetHandler.get(packet.type).encode.call(this, outputStream, packet)
      }
      delete message.packetStream
    }

    if (messagesFn) message = messagesFn(message)
    messageHandler.get(message.type).encode.call(this, outputStream, message)
  }

  if (outputFile) {
    fs.writeFileSync(outputFile, outputStream.readArrayBuffer(Math.ceil(this.stream.index / 8)))
  }

  return outputStream
}

module.exports = DemTF
