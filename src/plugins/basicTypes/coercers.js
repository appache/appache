const TRUTHY_VALUES = [null, true, 'true', 1, '1']
const FALSY_VALUES = [false, 'false', 0, '0']


exports.string = function coerceString(value) {
  return (typeof value === 'number') ? String(value) : value
}

exports.boolean = function coerceBoolean(value) {
  if (TRUTHY_VALUES.includes(value)) {
    return true
  } else if (FALSY_VALUES.includes(value)) {
    return false
  } else {
    return value
  }
}

exports.number = function coerceNumber(value) {
  let newValue = (value === null) ? 1 : Number(value)
  return Number.isNaN(newValue) ? value : newValue
}

exports.auto = function coerceAuto(value) {
  if (typeof value !== 'string') {
    return value
  }

  if (value === 'null') {
    return null
  } else if (value === 'true') {
    return true
  } else if (value === 'false') {
    return false
  } else {
    let numValue = Number(value)
    return Number.isNaN(numValue) ? value : numValue
  }
}

exports.array = function coerceArray(value) {
  if (value === undefined) {
    return []
  } else if (!Array.isArray(value)) {
    return [exports.auto(value)]
  } else {
    return value.map(exports.auto)
  }
}
