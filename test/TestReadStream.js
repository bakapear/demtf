// TestStream
// compares with compareStream on each stream write if it still matches 1:1

let { BitStream } = require('../lib/bit-buffer')

class TestReadStream extends BitStream {
  constructor (stream) {
    super(stream.buffer, stream._index / 8, stream.length / 8)
    this.lock = null
    this.mark = 0
    this.history = {}
  }
}

TestReadStream.prototype.readASCIIString = function (bytes) {
  if (!this.lock) {
    this.lock = 'readASCIIString'
    this.mark = this.index
  }
  let out = BitStream.prototype.readASCIIString.call(this, bytes)
  if (this.lock === 'readASCIIString') {
    this.history[this.mark] = { method: this.lock, value: out, args: arguments }
    this.lock = null
  }
  return out
}

TestReadStream.prototype.readUTF8String = function (bytes) {
  if (!this.lock) {
    this.lock = 'readUTF8String'
    this.mark = this.index
  }
  let out = BitStream.prototype.readUTF8String.call(this, bytes)
  if (this.lock === 'readUTF8String') {
    this.history[this.mark] = { method: this.lock, value: out, args: arguments }
    this.lock = null
  }
  return out
}

TestReadStream.prototype.readBitStream = function (bitLength) {
  if (!this.lock) {
    this.lock = 'readBitStream'
    this.mark = this.index
  }
  let out = BitStream.prototype.readBitStream.call(this, bitLength)
  if (this.lock === 'readBitStream') {
    this.history[this.mark] = { method: this.lock, value: out, args: arguments }
    this.lock = null
  }
  return out
}

TestReadStream.prototype.readBitVar = function (signed) {
  if (!this.lock) {
    this.lock = 'readBitVar'
    this.mark = this.index
  }
  let out = BitStream.prototype.readBitVar.call(this, signed)
  if (this.lock === 'readBitVar') {
    this.history[this.mark] = { method: this.lock, value: out, args: arguments }
    this.lock = null
  }
  return out
}

TestReadStream.prototype.readVarInt = function (signed) {
  if (!this.lock) {
    this.lock = 'readVarInt'
    this.mark = this.index
  }
  let out = BitStream.prototype.readVarInt.call(this, signed)
  if (this.lock === 'readVarInt') {
    this.history[this.mark] = { method: this.lock, value: out, args: arguments }
    this.lock = null
  }
  return out
}

TestReadStream.prototype.readBits = function (bits) {
  if (!this.lock) {
    this.lock = 'readBits'
    this.mark = this.index
  }
  let out = BitStream.prototype.readBits.call(this, bits)
  if (this.lock === 'readBits') {
    this.history[this.mark] = { method: this.lock, value: out, args: arguments }
    this.lock = null
  }
  return out
}

TestReadStream.prototype.readBoolean = function () {
  if (!this.lock) {
    this.lock = 'readBoolean'
    this.mark = this.index
  }
  let out = BitStream.prototype.readBoolean.call(this)
  if (this.lock === 'readBoolean') {
    this.history[this.mark] = { method: this.lock, value: out, args: arguments }
    this.lock = null
  }
  return out
}

TestReadStream.prototype.readInt8 = function () {
  if (!this.lock) {
    this.lock = 'readInt8'
    this.mark = this.index
  }
  let out = BitStream.prototype.readInt8.call(this)
  if (this.lock === 'readInt8') {
    this.history[this.mark] = { method: this.lock, value: out, args: arguments }
    this.lock = null
  }
  return out
}

TestReadStream.prototype.readUint8 = function () {
  if (!this.lock) {
    this.lock = 'readUint8'
    this.mark = this.index
  }
  let out = BitStream.prototype.readUint8.call(this)
  if (this.lock === 'readUint8') {
    this.history[this.mark] = { method: this.lock, value: out, args: arguments }
    this.lock = null
  }
  return out
}

TestReadStream.prototype.readInt16 = function () {
  if (!this.lock) {
    this.lock = 'readInt16'
    this.mark = this.index
  }
  let out = BitStream.prototype.readInt16.call(this)
  if (this.lock === 'readInt16') {
    this.history[this.mark] = { method: this.lock, value: out, args: arguments }
    this.lock = null
  }
  return out
}

TestReadStream.prototype.readUint16 = function () {
  if (!this.lock) {
    this.lock = 'readUint16'
    this.mark = this.index
  }
  let out = BitStream.prototype.readUint16.call(this)
  if (this.lock === 'readUint16') {
    this.history[this.mark] = { method: this.lock, value: out, args: arguments }
    this.lock = null
  }
  return out
}

TestReadStream.prototype.readInt32 = function () {
  if (!this.lock) {
    this.lock = 'readInt32'
    this.mark = this.index
  }
  let out = BitStream.prototype.readInt32.call(this)
  if (this.lock === 'readInt32') {
    this.history[this.mark] = { method: this.lock, value: out, args: arguments }
    this.lock = null
  }
  return out
}

TestReadStream.prototype.readUint32 = function () {
  if (!this.lock) {
    this.lock = 'readUint32'
    this.mark = this.index
  }
  let out = BitStream.prototype.readUint32.call(this)
  if (this.lock === 'readUint32') {
    this.history[this.mark] = { method: this.lock, value: out, args: arguments }
    this.lock = null
  }
  return out
}

TestReadStream.prototype.readFloat32 = function () {
  if (!this.lock) {
    this.lock = 'readFloat32'
    this.mark = this.index
  }
  let out = BitStream.prototype.readFloat32.call(this)
  if (this.lock === 'readFloat32') {
    this.history[this.mark] = { method: this.lock, value: out, args: arguments }
    this.lock = null
  }
  return out
}

TestReadStream.prototype.readFloat64 = function () {
  if (!this.lock) {
    this.lock = 'readFloat64'
    this.mark = this.index
  }
  let out = BitStream.prototype.readFloat64.call(this)
  if (this.lock === 'readFloat64') {
    this.history[this.mark] = { method: this.lock, value: out, args: arguments }
    this.lock = null
  }
  return out
}

TestReadStream.prototype.readArrayBuffer = function (byteLength) {
  if (!this.lock) {
    this.lock = 'readArrayBuffer'
    this.mark = this.index
  }
  let out = BitStream.prototype.readArrayBuffer.call(this, byteLength)
  if (this.lock === 'readArrayBuffer') {
    this.history[this.mark] = { method: this.lock, value: out, args: arguments }
    this.lock = null
  }
  return out
}

module.exports = { TestReadStream }
