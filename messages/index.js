let { MESSAGE_TYPE } = require('../constants')

module.exports = {
  get (id) {
    switch (id) {
      case MESSAGE_TYPE.HEADER: return require('./header')
      case MESSAGE_TYPE.PACKET: case MESSAGE_TYPE.SIGNON: return require('./packet')
      case MESSAGE_TYPE.SYNCTICK: return require('./synctick')
      case MESSAGE_TYPE.CONSOLECMD: return require('./consolecmd')
      case MESSAGE_TYPE.USERCMD: return require('./usercmd')
      case MESSAGE_TYPE.DATATABLES: return require('./datatables')
      case MESSAGE_TYPE.STOP: return require('./stop')
      case MESSAGE_TYPE.STRINGTABLES: return require('./stringtables')
      default: throw Error(`Invalid message type '${id}'`)
    }
  }
}
