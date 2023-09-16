// TestStream
// compares with compareStream on each stream write if it still matches 1:1

let { DynamicBitStream } = require('../lib/bit-buffer')

class TestStream extends DynamicBitStream {
  constructor (initialByteSize = 16 * 1024, compareStream) {
    super(initialByteSize)
    this.compareStream = compareStream
    this.operations = 0
    this.disabled = false
    this.ignores = {}
    this.mark = 0
    this.lock = null
  }
}

TestStream.prototype.writeASCIIString = function (string, bytes) {
  if (!this.lock) {
    this.lock = 'writeASCIIString'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeASCIIString.call(this, string, bytes)
  this.checkStreams('writeASCIIString')
}

TestStream.prototype.writeUTF8String = function (string, bytes) {
  if (!this.lock) {
    this.lock = 'writeUTF8String'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeUTF8String.call(this, string, bytes)
  this.checkStreams('writeUTF8String')
}

TestStream.prototype.writeBitStream = function (stream, length) {
  if (!this.lock) {
    this.lock = 'writeBitStream'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeBitStream.call(this, stream, length)
  this.checkStreams('writeBitStream')
}

TestStream.prototype.writeBitVar = function (value, signed) {
  if (!this.lock) {
    this.lock = 'writeBitVar'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeBitVar.call(this, value, signed)
  this.checkStreams('writeBitVar')
}

TestStream.prototype.writeVarInt = function (value, signed) {
  if (!this.lock) {
    this.lock = 'writeVarInt'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeVarInt.call(this, value, signed)
  this.checkStreams('writeVarInt')
}

TestStream.prototype.writeBits = function (value, bits) {
  if (!this.lock) {
    this.lock = 'writeBits'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeBits.call(this, value, bits)
  this.checkStreams('writeBits')
}

TestStream.prototype.writeBoolean = function (value) {
  if (!this.lock) {
    this.lock = 'writeBoolean'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeBoolean.call(this, value)
  this.checkStreams('writeBoolean')
}

TestStream.prototype.writeInt8 = function (value) {
  if (!this.lock) {
    this.lock = 'writeInt8'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeInt8.call(this, value)
  this.checkStreams('writeInt8')
}

TestStream.prototype.writeUint8 = function (value) {
  if (!this.lock) {
    this.lock = 'writeUint8'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeUint8.call(this, value)
  this.checkStreams('writeUint8')
}

TestStream.prototype.writeInt16 = function (value) {
  if (!this.lock) {
    this.lock = 'writeInt16'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeInt16.call(this, value)
  this.checkStreams('writeInt16')
}

TestStream.prototype.writeUint16 = function (value) {
  if (!this.lock) {
    this.lock = 'writeUint16'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeUint16.call(this, value)
  this.checkStreams('writeUint16')
}

TestStream.prototype.writeInt32 = function (value) {
  if (!this.lock) {
    this.lock = 'writeInt32'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeInt32.call(this, value)
  this.checkStreams('writeInt32')
}

TestStream.prototype.writeUint32 = function (value) {
  if (!this.lock) {
    this.lock = 'writeUint32'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeUint32.call(this, value)
  this.checkStreams('writeUint32')
}

TestStream.prototype.writeFloat32 = function (value) {
  if (!this.lock) {
    this.lock = 'writeFloat32'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeFloat32.call(this, value)
  this.checkStreams('writeFloat32')
}

TestStream.prototype.writeFloat64 = function (value) {
  if (!this.lock) {
    this.lock = 'writeFloat64'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeFloat64.call(this, value)
  this.checkStreams('writeFloat64')
}

TestStream.prototype.writeArrayBuffer = function (value, length) {
  if (!this.lock) {
    this.lock = 'writeArrayBuffer'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeArrayBuffer.call(this, value, length)
  this.checkStreams('writeArrayBuffer')
}

TestStream.prototype.checkStreams = function (unlock) {
  if (this.lock !== unlock) return
  this.lock = null
  this.operations++
  if (this.ignores[this.index]) return

  let method = unlock.replace('write', 'read')
  let bits = this.index - this.mark

  this.index -= bits
  this.compareStream.index = this.index

  let arg
  if (method.indexOf('String') > 0 || method.indexOf('Array') > 0) arg = bits / 8
  else if (method.indexOf('Bit') > 0) arg = bits

  console.log(`\n-- ${method}(${arg ?? ''}) --`)

  let a = this[method](arg)
  let b = this.compareStream[method](arg)

  console.log('DECODE', [b])
  console.log('ENCODE', [a])

  let compare = null
  if (a.constructor === Uint8Array) compare = Buffer.compare(a, b) === 0
  else compare = a === b

  if (!compare) {
    let start = Math.floor(this.mark / 8)
    let end = Math.ceil(this.index / 8)
    let A = this.buffer.slice(start, end)
    let B = this.compareStream.buffer.slice(start, end)

    let e = new Error()

    console.error()
    console.error('----------------------------------------------------------------')
    console.error(`ERROR: ${unlock} (${bits} bits) mismatch after ${this.operations} operations!`)
    console.error(e.stack.split('\n')[3])
    console.error()
    console.error('DECODE', [b], B.slice(-50))
    console.error('ENCODE', [a], A.slice(-50))
    console.error('----------------------------------------------------------------')

    process.exit()
  }
}

TestStream.prototype.ignore = function (bits) {
  this.ignores[this.index + bits] = bits
}

module.exports = { TestStream }
