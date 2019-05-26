const bunyan = require('bunyan')
const createESStream = require('./lib')

const eSStream = createESStream({
  indexPattern: '[logstash-]YYYY[-]MM[-]DD',
  type: 'logs',
  host: 'http://127.0.0.1:9200'
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
  log.error({
    message: 'Hi',
    test: true,
    myName: 'Milad'
  })
}, 100)
