const { assign } = require('../../core/common')


const OPTION_PROPERTIES = {
  defaultValue: {},
}


module.exports = function modifySchema(schema) {
  return assign(schema, 'definitions.option.properties', OPTION_PROPERTIES)
}
