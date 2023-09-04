let { SENDPROP_FLAG, SENDPROP_TYPE } = require('../constants')

function SendPropDefinition (type, name, flags, ownerTableName) {
  this.type = type
  this.name = name
  this.flags = flags
  this.excludeDTName = null
  this.lowValue = 0
  this.highValue = 0
  this.bitCount = 0
  this.table = null
  this.numElements = 0
  this.arrayProperty = null
  this.ownerTableName = ownerTableName
}

SendPropDefinition.prototype.hasFlag = function (flag) {
  return (this.flags & flag) !== 0
}

SendPropDefinition.prototype.isExcludeProp = function () {
  return this.hasFlag(SENDPROP_FLAG.EXCLUDE)
}

SendPropDefinition.prototype.inspect = function () {
  let data = {
    ownerTableName: this.ownerTableName,
    name: this.name,
    type: SENDPROP_TYPE[this.type],
    flags: this.flags,
    bitCount: this.bitCount
  }
  if (this.type === SENDPROP_TYPE.Float) {
    data.lowValue = this.lowValue
    data.highValue = this.highValue
  }
  if (this.type === SENDPROP_TYPE.DataTable && this.table) {
    data.excludeDTName = this.table.name
  }

  return data
}

SendPropDefinition.prototype.fullName = function () {
  return `${this.ownerTableName}.${this.name}`
}

SendPropDefinition.prototype.allFlags = function () {
  return SendPropDefinition.formatFlags(this.flags)
}

module.exports = SendPropDefinition
