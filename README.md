# bunyan-elasticsearch-bulk
- A [Bunyan](https://github.com/trentm/node-bunyan) stream for saving logs into Elasticsearch.
- Saves logs in memory instead of sending them to the Elasticsearch server one by one.
- The logs are accumulated in memory until a certain number of logs reached or a certain amount of time passed without sending any logs.
- The goal is to save resources on both your application and Elastic Search server (ex: lowering costs in AWS).

## Installation
`npm i bunyan-elasticsearch-bulk`

## Usage with Node
```javascript
const bunyan = require('bunyan')
const createESStream = require('bunyan-elasticsearch-bulk')

const config = {
  name: 'Application Name',
  streams: [{
    level: 'debug',
    stream: createESStream({
      indexPattern: '[my-app-]YYYY.MM.DD',
      node: 'http://localhost:9200'
    })
  }]
}

const log = bunyan.createLogger(config)

// From here, you can log things according to the best practices of Bunyan.
// Please familiarize yourself with it here: https://github.com/trentm/node-bunyan

log.info('Log this message!')
log.info({ otherInfo: 'What else do you need to log here?' }, 'Log this message!')
```

## List of Configuration Parameters
#### Parameters Specific to Elasticsearch Official Client
[These Parameters](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-configuration.html) are passed to the client without any change.

You need to provide the following one. The rest are up to you. 

| Field | Required? | Example | Description |
| --- | --- | --- | --- |
| `node` or `nodes` | Yes | `http://localhost:9200` | The Elasticsearch endpoint to use. No trailing slash! |

#### Parameters Specific to this Module
| Field | Default | Description |
| --- | --- | --- |
| indexPattern | `[my-app-]YYYY[-]MM[-]DD` | Pattern for the daily segmentation of log indices. This will be passed to `moment.utc().format(indexPattern)` from [moment.js](https://momentjs.com/) |
| type | `logs` | Type of the logs for Elasticsearch servers prior to `v7.x` |
| limit | `100` | How many logs to collect before submitting them to ES |
| interval | `5000` | Time in milliseconds before submitting logs even if their count has not reached the `limit`. |
| client | `Client(options)` | If you don't want to use the included version of the client `v7.x`, you can configure the one you want and pass it here. |

## Emitted Events
Chech [server.js](./server.js) for example usages:

| Event | Fires when .. |
| --- | --- |
| `log_received` | we receive a log |
| `log_submitted` | we bulk-submit logs to ES server. With a reason `limit_exceeded` or `timeout` |
| `error` | an error happens in the whole bulk submission or when saving an individual message fails |

## Changes since 1.0.x
For you as a client, you no longer need to use the keyword `new` with this module. There is a factory function now. Example above is updated.

## Development
- A `docker-compose.yaml` file has been added to make it easier to develop and test locally.

## Author(s)
- Milad Kawas Cale

## License
MIT
