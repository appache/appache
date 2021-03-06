function findByIds(items, ids) {
  return ids
    .map((id) => {
      return items.find((item) => item.id === id)
    })
    .filter((item) => item)
}

function findOneById(items, id) {
  return items.find((item) => item.id === id)
}

function findOneByNames(items, names) {
  if (Array.isArray(names)) {
    return items.find((item) => {
      let { name, aliases } = item
      return names.find((n) => n === name || (aliases && aliases.includes(n)))
    })
  }

  return items.find((item) => {
    return item.name === names || (item.aliases && item.aliases.includes(names))
  })
}

function findCommandById(config, id, populate) {
  let { commands } = config

  if (!commands || !commands.length) {
    return
  }

  let command = findOneById(commands, id)

  if (command && populate) {
    return populateCommand(config, command)
  }

  return command
}

function findOptionById(config, id) {
  let { options } = config

  if (options && options.length) {
    return findOneById(options, id)
  }
}

function findRootCommands(config, populate) {
  if (!config || !config.commands) {
    return []
  }

  let commands

  if (config.final) {
    commands = config.commands.filter((c) => c.root)
  } else {
    let nonRootCommands = config.commands.reduce((results, command) => {
      command.commands && command.commands.forEach((id) => {
        results[id] = true
      })
      return results
    }, {})

    commands = config.commands.filter((command) => !nonRootCommands[command.id])
  }

  if (populate) {
    commands = commands.map((c) => populateCommand(config, c))
  }

  return commands
}

function findDefaultCommand(config, command) {
  let commands

  if (!command) {
    commands = findRootCommands(config)
  } else if (command.defaultCommand) {
    return findCommandById(config, command.defaultCommand)
  } else if (command.commands) {
    commands = findByIds(config.commands, command.commands)
  } else {
    return
  }

  return commands.find((command) => command.default)
}

function findDefaultOption(config, command) {
  let { defaultOption, options } = command

  if (defaultOption) {
    return findOptionById(config, defaultOption)
  } else if (options) {
    return findByIds(config.options, options).find((o) => o.default)
  }
}

function populateCommand(config, command) {
  let { options, commands } = command

  if (!options && !commands) {
    return command
  }

  return Object.assign({}, command, {
    options: options && findByIds(config.options, options),
    commands: commands && findByIds(config.commands, commands),
  })
}

function updateCommandById(config, id, command, overwrite) {
  let { commands } = config

  if (!commands || !commands.length) {
    throw new Error('The config doesn\'t have any commands')
  }

  let updatedCommands = []
  let commandFound = false

  for (let i = 0; i < commands.length; i++) {
    if (commands[i].id === id) {
      commandFound = true
      updatedCommands[i] = overwrite ?
        command :
        Object.assign({}, commands[i], command)
    } else {
      updatedCommands[i] = commands[i]
    }
  }

  if (!commandFound) {
    throw new Error(`Command "${id}" is not found`)
  }

  return Object.assign({}, config, {
    commands: updatedCommands,
  })
}

function updateOptionById(config, id, option, overwrite) {
  let { options } = config

  if (!options || !options.length) {
    throw new Error('The config doesn\'t have any options')
  }

  let updatedOptions = []
  let optionFound = false

  for (let i = 0; i < options.length; i++) {
    if (options[i].id === id) {
      optionFound = true
      updatedOptions[i] = overwrite ?
        option :
        Object.assign({}, options[i], option)
    } else {
      updatedOptions[i] = options[i]
    }
  }

  if (!optionFound) {
    throw new Error(`Option "${id}" is not found`)
  }

  return Object.assign({}, config, {
    options: updatedOptions,
  })
}

function optionsToObject(options) {
  if (!options || !options.length) {
    return {}
  }

  return options.reduce((object, { name, value }) => {
    if (name) {
      object[name] = value
    }
    return object
  }, {})
}

function getCommandFromEvent(event) {
  let { args, name } = event

  if (name === 'execute') {
    return args && args[1] && args[1][0]
  } else if (name === 'dispatch') {
    return args && args[1]
  }
}

function injectCommand(config, command) {
  let commands = config.commands ? config.commands.slice() : []

  if (Array.isArray(command)) {
    commands.push(...command)
  } else {
    commands.push(command)
  }

  return Object.assign({}, config, { commands })
}

function injectOption(config, option) {
  let options = config.options ? config.options.slice() : []

  if (Array.isArray(option)) {
    options.push(...option)
  } else {
    options.push(option)
  }

  return Object.assign({}, config, { options })
}

function mergeConfigs(...configs) {
  return configs.reduce((result, config) => {
    Object.keys(config).forEach((key) => {
      if (key === 'commands' || key === 'options') {
        if (result[key]) {
          result[key].push(...config[key])
        } else {
          result[key] = config[key].slice()
        }
      } else {
        result[key] = config[key]
      }
    })

    return result
  }, {})
}


module.exports = {
  findByIds, findOneById, findOneByNames, findCommandById, findOptionById,
  findRootCommands, findDefaultCommand, findDefaultOption, populateCommand,
  updateCommandById, updateOptionById, optionsToObject, getCommandFromEvent,
  injectCommand, injectOption, mergeConfigs,
}
