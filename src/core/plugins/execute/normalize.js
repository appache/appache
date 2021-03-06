const { InputError } = require('../../common')


function normalizeCommand(command, isLast) {
  if (!command || typeof command !== 'object') {
    throw new InputError('Each command in a batch must be an object')
  }

  let { options } = command

  command = Object.assign({}, command)
  command.inputName = command.inputName || command.name
  command.last = Boolean(isLast)

  if (!options) {
    command.options = []
  } else if (!Array.isArray(options)) {
    if (typeof options === 'object') {
      command.options = Object.keys(options).map((name) => {
        return { name, value: options[name] }
      })
    } else {
      let err = new InputError(
        'The options of a command in a batch must be either an array or an object'
      )
      err.command = command
      throw err
    }
  }

  return command
}

function normalizeBatchCommands(batch) {
  return batch.map((command, i) => {
    let isLast = (i === batch.length - 1)
    return normalizeCommand(command, isLast)
  })
}

function normalizeOption(option) {
  if (!option || typeof option !== 'object') {
    throw new InputError('An option of a command in a batch must be an object')
  }

  option = Object.assign({}, option)
  option.inputName = option.inputName || option.name
  return option
}

function normalizeBatchOptions(batch) {
  return batch.map((command) => {
    command = Object.assign({}, command)
    command.options = command.options.map(normalizeOption)
    return command
  })
}


module.exports = { normalizeBatchCommands, normalizeBatchOptions }
