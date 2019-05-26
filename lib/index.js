const { Writable } = require('stream')
const { Client } = require('elasticsearch')
const bunyan = require('bunyan')
const moment = require('moment')

class BunyanESStream extends Writable {
  constructor (options, clientOptions) {
    super(options)

    // We are going to collect logs in this property
    this.buffer = []

    // Prepare some configurations
    this.indexPattern = options.indexPattern || '[logstash-]YYYY[-]MM[-]DD'
    this.type = options.type || 'logs'
    this.limit = options.limit || 100
    this.interval = options.interval || 5000

    this.client = options.client || new Client({
      host: options.host,
      type: 'stream'
    })

    this.intervalId = null
  }

  generateIndexName (entry) {
    return moment.utc(entry.time).format(this.indexPattern)
  }

  _write (chunk, encoding, callback) {
    const body = JSON.parse(chunk.toString())

    body.level = bunyan.nameFromLevel[body.level]
    body.message = body.msg
    delete body.msg

    const entry = {
      index: this.generateIndexName(body),
      type: this.type,
      body
    }

    this.push(entry)
    callback()
  }

  push (data) {
    const length = this.buffer.push(data)

    if (length >= this.limit) {
      this.flush()
    } else if (!this.intervalId) {
      this.resetTimer()
    }
  }

  resetTimer () {
    if (this.intervalId) {
      clearTimeout(this.intervalId)
    }

    this.intervalId = setTimeout(() => {
      this.flush()
    }, this.interval)

    if (this.closed && typeof this.intervalId.unref === 'function') {
      this.intervalId.unref()
    }
  }

  flush () {
    this.resetTimer()

    if (this.buffer.length === 0) {
      return Promise.resolve()
    }

    const oldBuffer = this.buffer

    this.buffer = []

    return new Promise((resolve) => {
      return resolve(this.bulk(oldBuffer))
    }).catch((err) => {
      return Promise.reject(err)
    })
  }

  bulk (buffer) {
    const body = buffer.reduce((sum, value) => {
      sum.push(JSON.stringify({
        index: {
          _index: value.index,
          _type: value.type
        }
      }))
      sum.push(JSON.stringify(value.body))

      return sum
    }, [])

    const that = this

    this.client.bulk({ body }, (err, resp) => {
      if (err) {
        that.emit('error', err)
      } else if (resp.errors) {
        for (let i = 0; i < resp.items.length; i++) {
          if (typeof resp.items[i].index.error !== 'undefined') {
            that.emit('error', resp.items[i].index.error)
          }
        }
      }
    })
  }

  close () {
    this.closed = true
    return this.flush()
  }
}

const createESStream = (config) => {
  return new BunyanESStream(config)
}

module.exports = createESStream
