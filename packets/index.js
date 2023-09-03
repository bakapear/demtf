let { PACKET_TYPE } = require('../constants')

module.exports = {
  get (id) {
    switch (id) {
      case PACKET_TYPE.PRINT: return require('./print')
      case PACKET_TYPE.SERVERINFO: return require('./serverinfo')
      case PACKET_TYPE.NETTICK: return require('./nettick')
      case PACKET_TYPE.CREATESTRINGTABLE: return require('./createstringtable')
      case PACKET_TYPE.SIGNONSTATE: return require('./signonstate')
      case PACKET_TYPE.CLASSINFO: return require('./classinfo')
      case PACKET_TYPE.VOICEINIT: return require('./voiceinit')
      case PACKET_TYPE.GAMEEEVENTLIST: return require('./gameeventlist')
      case PACKET_TYPE.SETVIEW: return require('./setview')
      case PACKET_TYPE.PACKETENTITIES: return require('./packetentities')
      case PACKET_TYPE.USERMESSAGE: return require('./usermessage')
      case PACKET_TYPE.UPDATESTRINGTABLE: return require('./updatestringtable')
      case PACKET_TYPE.TEMPENTITIES: return require('./tempentities')
      default: {
        throw Error(`Invalid packet type '${id}'`)
      }
    }
  }
}
