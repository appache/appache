const {
  hook, preHookStart, hookEnd, toot,
} = require('hooter/effects')


module.exports = function* start() {
  let schema = yield hook('schematize')
  let config

  yield preHookStart('start', function* () {
    config = yield toot('configure', schema.value, {})
    return [config]
  })

  yield hookEnd('start', function* (config) {
    yield toot('activate', config)
    return config
  })
}
