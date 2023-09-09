// TestStream
// compares with compareStream on each stream write if it still matches 1:1

let { DynamicBitStream } = require('../lib/bit-buffer')

class TestStream extends DynamicBitStream {
  constructor (initialByteSize = 16 * 1024, compareStream) {
    super(initialByteSize)
    this.compareStream = compareStream
    this.operations = 0
    this.check = true
    this.mark = 0
  }
}

TestStream.prototype.writeASCIIString = function (string, bytes) {
  DynamicBitStream.prototype.writeASCIIString.call(this, string, bytes)
  this.checkStreams()
}

TestStream.prototype.writeUTF8String = function (string, bytes) {
  DynamicBitStream.prototype.writeUTF8String.call(this, string, bytes)
  this.checkStreams()
}

TestStream.prototype.writeBitStream = function (stream, length) {
  DynamicBitStream.prototype.writeBitStream.call(this, stream, length)
  this.checkStreams()
}

TestStream.prototype.writeBitVar = function (value, signed) {
  DynamicBitStream.prototype.writeBitVar.call(this, value, signed)
  this.checkStreams()
}

TestStream.prototype.writeVarInt = function (value, signed) {
  DynamicBitStream.prototype.writeVarInt.call(this, value, signed)
  this.checkStreams()
}

TestStream.prototype.writeBits = function (value, bits) {
  DynamicBitStream.prototype.writeBits.call(this, value, bits)
  this.checkStreams()
}

TestStream.prototype.writeBoolean = function (value) {
  DynamicBitStream.prototype.writeBoolean.call(this, value)
  this.checkStreams()
}

TestStream.prototype.writeInt8 = function (value) {
  DynamicBitStream.prototype.writeInt8.call(this, value)
  this.checkStreams()
}

TestStream.prototype.writeUint8 = function (value) {
  DynamicBitStream.prototype.writeUint8.call(this, value)
  this.checkStreams()
}

TestStream.prototype.writeInt16 = function (value) {
  DynamicBitStream.prototype.writeInt16.call(this, value)
  this.checkStreams()
}

TestStream.prototype.writeUint16 = function (value) {
  DynamicBitStream.prototype.writeUint16.call(this, value)
  this.checkStreams()
}

TestStream.prototype.writeInt32 = function (value) {
  DynamicBitStream.prototype.writeInt32.call(this, value)
  this.checkStreams()
}

TestStream.prototype.writeUint32 = function (value) {
  DynamicBitStream.prototype.writeUint32.call(this, value)
  this.checkStreams()
}

TestStream.prototype.writeFloat32 = function (value) {
  DynamicBitStream.prototype.writeFloat32.call(this, value)
  this.checkStreams()
}

TestStream.prototype.writeFloat64 = function (value) {
  DynamicBitStream.prototype.writeFloat64.call(this, value)
  this.checkStreams()
}

TestStream.prototype.checkStreams = function (display) {
  this.operations++

  if (display) this.mark = 0

  let A = this.buffer.slice(this.mark / 8, this.index / 8)
  let B = this.compareStream.buffer.slice(this.mark / 8, this.index / 8)
  let AB = Buffer.compare(A, B)
  if (this.check && (display || AB !== 0)) {
    console.log('DECODE', B.slice(-50))
    console.log('ENCODE', A.slice(-50))
    throw Error(`[${AB}] Stream mismatch after ${this.operations} operations!`)
  }

  this.mark = this.index
}

module.exports = { TestStream }
