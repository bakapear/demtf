let { USERMESSAGE_TYPE } = require('../constants')

module.exports = {
  decode (stream) {
    let type = stream.readUint8()
    let length = stream.readBits(11)
    let data = stream.readBitStream(length)

    let msg = {}

    switch (type) {
      case USERMESSAGE_TYPE.ResetHUD: case USERMESSAGE_TYPE.Train: {
        msg.data = data.readUint8()
        break
      }
      case USERMESSAGE_TYPE.SayText2: {
        msg = {
          client: data.readUint8(),
          wantsToChat: data.readUint8(),
          kind: data.readUTF8String(),
          from: data.readUTF8String(),
          text: data.readUTF8String()
          // param3: data.readUTF8String(),
          // param4: data.readUTF8String()
        }
        // 16 bits left if we dont read params, but they are (maybe) always empty so we just write empty bytes on encode?
        break
      }
      default: throw Error(`Invalid usermessage type '${type}'`)
    }

    return { type, msg }
  },
  encode (stream, packet) {
    throw Error('Not implemented yet')
  }
}
