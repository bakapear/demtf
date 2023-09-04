let { SENDPROP_FLAG, SENDPROP_TYPE } = require('../constants')

function SendTable (name) {
  this.name = name
  this.props = []
  this.cachedFlattenedProps = []
  this.needsDecoder = false
}

SendTable.prototype.addProp = function (prop) {
  this.props.push(prop)
}

SendTable.prototype.getAllProps = function (excludes, props) {
  let localProps = []
  this.getAllPropsIteratorProps(excludes, localProps, props)
  for (let localProp of localProps) props.push(localProp)
}

SendTable.prototype.getAllPropsIteratorProps = function (excludes, props, childProps) {
  for (let prop of this.props) {
    if (prop.hasFlag(SENDPROP_FLAG.EXCLUDE)) continue
    if (excludes.filter((exclude) => {
      return exclude.name === prop.name && exclude.excludeDTName === prop.ownerTableName
    }).length > 0) continue

    if (prop.type === SENDPROP_TYPE.DataTable && prop.table) {
      if (prop.hasFlag(SENDPROP_FLAG.COLLAPSIBLE)) prop.table.getAllPropsIteratorProps(excludes, props, childProps)
      else prop.table.getAllProps(excludes, childProps)
    } else props.push(prop)
  }
}

SendTable.prototype.flattenedProps = function () {
  if (this.cachedFlattenedProps.length === 0) this.flatten()
  return this.cachedFlattenedProps
}

SendTable.prototype.excludes = function () {
  let result = []
  for (const prop of this.props) {
    if (prop.hasFlag(SENDPROP_FLAG.EXCLUDE)) result.push(prop)
    else if (prop.type === SENDPROP_TYPE.DataTable && prop.table) result = result.concat(prop.table.excludes)
  }
  return result
}

SendTable.prototype.flatten = function () {
  let excludes = this.excludes
  let props = []
  this.getAllProps(excludes, props)

  // sort often changed props before the others
  let start = 0
  for (let i = 0; i < props.length; i++) {
    if (props[i].hasFlag(SENDPROP_FLAG.CHANGES_OFTEN)) {
      if (i !== start) {
        let temp = props[i]
        props[i] = props[start]
        props[start] = temp
      }
      start++
    }
  }

  this.cachedFlattenedProps = props
}

module.exports = SendTable
