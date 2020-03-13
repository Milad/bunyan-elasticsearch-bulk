const bunyan = require('bunyan')
const createESStream = require('./lib')

const eSStream = createESStream({
  node: 'http://localhost:9200'
})

// The following console logs are meant for development and debugging.
eSStream.on('error', console.warn)

eSStream.on('log_submitted', why => {
  console.log('log_submitted', why)
})

eSStream.on('log_received', () => {
  console.log('log_received')
})

const config = {
  name: 'My Dev App',
  streams: [{
    level: 'debug',
    stream: eSStream
  }],
  serializers: bunyan.stdSerializers,
  src: false
}

const log = bunyan.createLogger(config)

setInterval(() => {
  log.info({ test: true }, 'test')
}, 100)
