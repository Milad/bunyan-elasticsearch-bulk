# bunyan-elasticsearch-bulk
#### By a Syrian Refugee
A Bunyan stream for saving logs into Elasticsearch. Based on [bunyan-elasticsearch](https://github.com/simianhacker/bunyan-elasticsearch) and [bulk-insert](https://github.com/jonathanong/bulk-insert), this package saves logs in bulk instead of log-by-log method, the goal is to save resources on both your application and Elastic Search server (ex: lowering costs in AWS).

## Installation
`npm install bunyan-elasticsearch-bulk --save`

## Usage with Node
```js
const bunyan = require('bunyan');
const BunyanElasticSearch = require('bunyan-elasticsearch-bulk');

const config = {
    name: "Application Name",
    streams: [{
        level: 'debug',
        stream: new BunyanElasticSearch({
            indexPattern: '[logstash-]YYYY.MM.DD',
            type: 'logs',
            host: 'http://localhost:9200'
        })
    }]
};

const log = bunyan.createLogger(config);

log.info('Log this message!');
```

## Params
```js
{
    // Required: Full URL of ES server with the port.
    // For https, don't use port 443.
    host: 'http://localhost:9200',
    
    // Optional: elasticsearch.CLient() is the default.
    client: new elasticsearch.Client(options),
    
    // Optional: Pattern for the daily segmentation of log indexes.
    // Default: [logstash-]YYYY[-]MM[-]DD
    indexPattern: '[logstash-]YYYY[-]MM[-]DD',
    
    // Type of your logs
    // Default: logs
    type: 'logs',
    
    // Optional: How many logs to save before writing them
    // Default: 50
    limit: 50,
    
    // Optionsl: Time before writing logs even if their count doesn't exceed the limit.
    // Default: 5000 milliseconds
    interval: 5000
}
```

## Author(s)
- Milad Kawas Cale <miladkaleh at gmail dot com>: A Syrian refugee in Sweden.

## License
MIT
