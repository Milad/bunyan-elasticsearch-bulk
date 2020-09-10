const { Writable } = require('stream')
const { Client } = require('@elastic/elasticsearch')
const bunyan = require('bunyan')
const moment = require('moment')
const semver = require('semver')

class BunyanESStream extends Writable {
  constructor (options, clientOptions) {
    super({
      emitClose: true,
      ...options
    })

    this.closed = false
    this.esVersion = null
    this.intervalId = null
    // We are going to collect logs in this property
    this.buffer = []

    // Prepare some configurations
    this.indexPattern = options.indexPattern || '[my-app-]YYYY[-]MM[-]DD'
    this.limit = options.limit || 100
    this.interval = options.interval || 5000
    this.type = options.type || 'logs'

    this.client = options.client || new Client(options)

    this.client.info({}, (err, resp, status) => {
      if (err) {
        this.emit('error', err)
      }

      if (resp && resp.body && resp.body.version && resp.body.version.number) {
        if (semver.gte(resp.body.version.number, '7.0.0')) {
          this.esVersion = 7
        } else if (semver.gte(resp.body.version.number, '6.0.0')) {
          this.esVersion = 6
        }
      }
    })
  }

  generateIndexName (body) {
    return moment.utc(body.time).format(this.indexPattern)
  }

  _write (chunk, encoding, callback) {
    try {
      const body = JSON.parse(chunk.toString())

      body.level = bunyan.nameFromLevel[body.level]

      const entry = {
        index: this.generateIndexName(body),
        type: this.type,
        body
      }

      this.push(entry)

      if (callback) {
        callback()
      }
    } catch (e) {
      if (callback) {
        callback(e)
      }
    }
  }

  push (data) {
    this.emit('log_received')

    const length = this.buffer.push(data)

    if (length >= this.limit) {
      this.emit('log_submitted', 'limit_exceeded')

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
      this.emit('log_submitted', 'timeout')

      this.flush()
    }, this.interval)

    if (this.closed && typeof this.intervalId.unref === 'function') {
      this.intervalId.unref()
    }
  }

  flush () {
    this.resetTimer()

    if (this.buffer.length === 0) {
      return
    }

    const oldBuffer = this.buffer

    this.buffer = []

    this.bulk(oldBuffer)
  }

  bulk (buffer) {
    const body = buffer.reduce((sum, value) => {
      const index = {
        index: {
          _index: value.index
        }
      }

      // @see https://www.elastic.co/guide/en/elasticsearch/reference/master/removal-of-types.html#_why_are_mapping_types_being_removed
      if (this.esVersion < 7) {
        index.index._type = value.type
      }

      sum.push(JSON.stringify(index))
      sum.push(JSON.stringify(value.body))

      return sum
    }, [])

    this.client.bulk({ body }, (err, resp) => {
      if (resp && resp.body && resp.body.errors) {
        for (let i = 0; i < resp.body.items.length; i++) {
          const item = resp.body.items[i]

          if (item && item.index && item.index.error) {
            this.emit('error', item.index.error)
          }
        }
      } else if (err) {
        this.emit('error', err)
      }
    })
  }

  _final (callback) {
    this.closed = true
    this.flush()
    if (callback) {
      callback()
    }
  }
}

const createESStream = (config) => {
  return new BunyanESStream(config)
}

module.exports = createESStream
