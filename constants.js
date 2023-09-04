let MESSAGE_TYPE = {
  HEADER: 0,
  SIGNON: 1,
  PACKET: 2,
  SYNCTICK: 3,
  CONSOLECMD: 4,
  USERCMD: 5,
  DATATABLES: 6,
  STOP: 7,
  STRINGTABLES: 8
}

let PACKET_TYPE = {
  FILE: 2,
  NETTICK: 3,
  STRINGCMD: 4,
  SETCONVAR: 5,
  SIGNONSTATE: 6,
  PRINT: 7,
  SERVERINFO: 8,
  CLASSINFO: 10,
  SETPAUSE: 11,
  CREATESTRINGTABLE: 12,
  UPDATESTRINGTABLE: 13,
  VOICEINIT: 14,
  VOICEDATA: 15,
  PARSESOUNDS: 17,
  SETVIEW: 18,
  FIXANGLE: 19,
  BSPDECAL: 21,
  USERMESSAGE: 23,
  ENTITYMESSAGE: 24,
  GAMEEVENT: 25,
  PACKETENTITIES: 26,
  TEMPENTITIES: 27,
  PREFETCH: 28,
  MENU: 29,
  GAMEEEVENTLIST: 30,
  GETCVARVALUE: 31,
  CMDKEYVALUES: 32
}

let SENDPROP_TYPE = {
  Int: 0,
  Float: 1,
  Vector: 2,
  VectorXY: 3,
  String: 4,
  Array: 5,
  DataTable: 6,
  NUMSendPropTypes: 7
}

let SENDPROP_FLAG = {
  UNSIGNED: (1 << 0), // Unsigned integer data.
  COORD: (1 << 1), // If this is set, the float/vector is treated like a world coordinate.
  // Note that the bit count is ignored in this case.
  NOSCALE: (1 << 2), // For floating point, don't scale into range, just take value as is.
  ROUNDDOWN: (1 << 3), // For floating point, limit high value to range minus one bit unit
  ROUNDUP: (1 << 4), // For floating point, limit low value to range minus one bit unit
  NORMAL: (1 << 5), // If this is set, the vector is treated like a normal (only valid for vectors)
  EXCLUDE: (1 << 6), // This is an exclude prop (not excludED, but it points at another prop to be excluded).
  XYZE: (1 << 7), // Use XYZ/Exponent encoding for vectors.
  INSIDEARRAY: (1 << 8), // This tells us that the property is inside an array, so it shouldn't be put into the
  // flattened property list. Its array will point at it when it needs to.
  PROXY_ALWAYS_YES: (1 << 9), // Set for datatable props using one of the default datatable proxies like
  // SendProxy_DataTableToDataTable that always send the data to all clients.
  CHANGES_OFTEN: (1 << 10), // this is an often changed field, moved to head of sendtable so it gets a small index
  IS_A_VECTOR_ELEM: (1 << 11), // Set automatically if SPROP_VECTORELEM is used.
  COLLAPSIBLE: (1 << 12), // Set automatically if it's a datatable with an offset of 0 that doesn't change the pointer
  // (ie: for all automatically-chained base classes).
  // In this case, it can get rid of this SendPropDataTable altogether and spare the
  // trouble of walking the hierarchy more than necessary.
  COORD_MP: (1 << 13), // Like SPROP_COORD, but special handling for multiplayer games
  COORD_MP_LOWPRECISION: (1 << 14), // Like SPROP_COORD, but special handling for multiplayer games
  // where the fractional component only gets a 3 bits instead of 5
  COORD_MP_INTEGRAL: (1 << 15), // SPROP_COORD_MP, but coordinates are rounded to integral boundaries
  VARINT: (1 << 5)
}

let USERMESSAGE_TYPE = {
  Geiger: 0,
  Train: 1,
  HudText: 2,
  SayText: 3,
  SayText2: 4,
  TextMsg: 5,
  ResetHUD: 6,
  GameTitle: 7,
  ItemPickup: 8,
  ShowMenu: 9,
  Shake: 10,
  Fade: 11,
  VGuiMenu: 12,
  Rumble: 13,
  CloseCaption: 14,
  SendAudio: 15,
  VoiceMask: 16,
  RequestState: 17,
  Damage: 18,
  HintText: 19,
  KeyHintText: 20,
  HudMsg: 21,
  AmmoDenied: 22,
  AchievementEvent: 23,
  UpdateRadar: 24,
  VoiceSubtitle: 25,
  HudNotify: 26,
  HudNotifyCustom: 27,
  PlayerStatsUpdate: 28,
  PlayerIgnited: 29,
  PlayerIgnitedInv: 30,
  HudArenaNotify: 31,
  UpdateAchievement: 32,
  TrainingMsg: 33,
  TrainingObjective: 34,
  DamageDodged: 35,
  PlayerJarated: 36,
  PlayerExtinguished: 37,
  PlayerJaratedFade: 38,
  PlayerShieldBlocked: 39,
  BreakModel: 40,
  CheapBreakModel: 41,
  BreakModelPumpkin: 42,
  BreakModelRocketDud: 43,
  CallVoteFailed: 44,
  VoteStart: 45,
  VotePass: 46,
  VoteFailed: 47,
  VoteSetup: 48,
  PlayerBonusPoints: 49,
  SpawnFlyingBird: 50,
  PlayerGodRayEffect: 51,
  SPHapWeapEvent: 52,
  HapDmg: 53,
  HapPunch: 54,
  HapSetDrag: 55,
  HapSet: 56,
  HapMeleeContact: 57,
  Unknown: 255
}

module.exports = { MESSAGE_TYPE, PACKET_TYPE, SENDPROP_TYPE, SENDPROP_FLAG, USERMESSAGE_TYPE }
