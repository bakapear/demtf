// TestStream
// compares with compareStream on each stream write if it still matches 1:1

let { DynamicBitStream, BitStream } = require('../lib/bit-buffer')

class TestWriteStream extends DynamicBitStream {
  constructor (initialByteSize = 16 * 1024, compareStream) {
    super(initialByteSize)
    this.compareStream = compareStream
    this.compareIndexLast = 0
    this.operations = 0
    this.disabled = false
    this.ignores = {}
    this.mark = 0
    this.lock = null
    this.log = false
  }
}

TestWriteStream.prototype.writeASCIIString = function (string, bytes) {
  if (!this.lock) {
    this.lock = 'writeASCIIString'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeASCIIString.call(this, string, bytes)
  this.checkStreams('writeASCIIString')
}

TestWriteStream.prototype.writeUTF8String = function (string, bytes) {
  if (!this.lock) {
    this.lock = 'writeUTF8String'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeUTF8String.call(this, string, bytes)
  this.checkStreams('writeUTF8String')
}

TestWriteStream.prototype.writeBitStream = function (stream, length) {
  if (!this.lock) {
    this.lock = 'writeBitStream'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeBitStream.call(this, stream, length)
  this.checkStreams('writeBitStream')
}

TestWriteStream.prototype.writeBitVar = function (value, signed) {
  if (!this.lock) {
    this.lock = 'writeBitVar'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeBitVar.call(this, value, signed)
  this.checkStreams('writeBitVar')
}

TestWriteStream.prototype.writeVarInt = function (value, signed) {
  if (!this.lock) {
    this.lock = 'writeVarInt'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeVarInt.call(this, value, signed)
  this.checkStreams('writeVarInt')
}

TestWriteStream.prototype.writeBits = function (value, bits) {
  if (!this.lock) {
    this.lock = 'writeBits'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeBits.call(this, value, bits)
  this.checkStreams('writeBits')
}

TestWriteStream.prototype.writeBoolean = function (value) {
  if (!this.lock) {
    this.lock = 'writeBoolean'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeBoolean.call(this, value)
  this.checkStreams('writeBoolean')
}

TestWriteStream.prototype.writeInt8 = function (value) {
  if (!this.lock) {
    this.lock = 'writeInt8'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeInt8.call(this, value)
  this.checkStreams('writeInt8')
}

TestWriteStream.prototype.writeUint8 = function (value) {
  if (!this.lock) {
    this.lock = 'writeUint8'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeUint8.call(this, value)
  this.checkStreams('writeUint8')
}

TestWriteStream.prototype.writeInt16 = function (value) {
  if (!this.lock) {
    this.lock = 'writeInt16'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeInt16.call(this, value)
  this.checkStreams('writeInt16')
}

TestWriteStream.prototype.writeUint16 = function (value) {
  if (!this.lock) {
    this.lock = 'writeUint16'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeUint16.call(this, value)
  this.checkStreams('writeUint16')
}

TestWriteStream.prototype.writeInt32 = function (value) {
  if (!this.lock) {
    this.lock = 'writeInt32'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeInt32.call(this, value)
  this.checkStreams('writeInt32')
}

TestWriteStream.prototype.writeUint32 = function (value) {
  if (!this.lock) {
    this.lock = 'writeUint32'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeUint32.call(this, value)
  this.checkStreams('writeUint32')
}

TestWriteStream.prototype.writeFloat32 = function (value) {
  if (!this.lock) {
    this.lock = 'writeFloat32'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeFloat32.call(this, value)
  this.checkStreams('writeFloat32')
}

TestWriteStream.prototype.writeFloat64 = function (value) {
  if (!this.lock) {
    this.lock = 'writeFloat64'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeFloat64.call(this, value)
  this.checkStreams('writeFloat64')
}

TestWriteStream.prototype.writeArrayBuffer = function (value, length) {
  if (!this.lock) {
    this.lock = 'writeArrayBuffer'
    this.mark = this.index
  }
  DynamicBitStream.prototype.writeArrayBuffer.call(this, value, length)
  this.checkStreams('writeArrayBuffer')
}

TestWriteStream.prototype.checkStreams = function (unlock) {
  if (this.lock !== unlock) return
  this.lock = null
  this.operations++

  if (this.ignores[this.index]) {
    this.compareStream.index += this.ignores[this.index]
    return
  }

  let method = unlock.replace('write', 'read')

  let bits = this.index - this.mark

  if (this.compareIndex !== null) {
    this.compareStream.index -= this.compareIndexLast - this.compareIndex
    this.compareIndex = null
  }

  this.index -= bits

  let compare = this.compareStream.history[this.compareStream.index]
  if (!compare) compare = {}

  let arg
  if (method.indexOf('String') > 0 || method.indexOf('Array') > 0) arg = bits / 8
  else if (method.indexOf('Bit') > 0) arg = bits

  let a = this[method](arg)
  let b = this.compareStream[method](arg)

  let check = null

  if (a.constructor === BitStream) {
    a = a._view._view.slice(a._index / 8, a._length / 8)
    b = b._view._view.slice(b._index / 8, b._length / 8)
  }

  if (a.constructor === Uint8Array) check = Buffer.compare(a, b) === 0
  else check = a === b

  if (!check) {
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
    console.error('DECODE', method, [b], B.slice(-50))
    console.error('ENCODE', method, [a], A.slice(-50))
    console.error('SHOULD', compare.method, [compare.value], compare.args)
    console.error('----------------------------------------------------------------')

    process.exit()
  }

  if (this.log) {
    console.info('')
    console.info(`@ ${new Error().stack.split('\n')[3].match(/\(.*/)[0]}`)
    console.info(`-- ${method}(${arg ?? ''}) --`)
    console.info('DECODE', method, [b])
    console.info('ENCODE', method, [a])
    console.info('SHOULD', compare.method, [compare.value], compare.args)
  }
}

TestWriteStream.prototype.ignore = function (bits) {
  this.ignores[this.index + bits] = bits
}

TestWriteStream.prototype.start = function () {
  this.compareIndex = this.compareIndexLast
  this.compareIndexLast = this.compareStream.index
}

TestWriteStream.prototype.stop = function () {
  this.compareStream.index = this.compareIndexLast
}

module.exports = { TestWriteStream }
