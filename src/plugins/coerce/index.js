const { preHook } = require('hooter/effects')
const modifySchema = require('./modifySchema')


function coerceOption(option) {
  let { config, value } = option

  if (!config || !config.coerce) {
    return option
  }

  value = config.coerce(value)
  return Object.assign({}, option, { value })
}

module.exports = function* coercePlugin() {
  yield preHook('schema', (schema) => {
    schema = modifySchema(schema)
    return [schema]
  })

  yield preHook({
    event: 'process',
    goesAfter: ['owner:defaultValuesPlugin'],
    goesBefore: ['owner:validatePlugin'],
  }, (_, command, ...args) => {
    let options = command.options

    if (options) {
      command = Object.assign({}, command)
      command.options = options.map((option) => coerceOption(option))
    }

    return [_, command, ...args]
  })
}
