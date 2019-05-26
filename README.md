# bunyan-elasticsearch-bulk
A Bunyan stream for saving logs into Elasticsearch. Based on [bunyan-elasticsearch](https://github.com/simianhacker/bunyan-elasticsearch) and [bulk-insert](https://github.com/jonathanong/bulk-insert), this package saves logs in bulk instead of log-by-log method, the goal is to save resources on both your application and Elastic Search server (ex: lowering costs in AWS).

## Installation
`npm install bunyan-elasticsearch-bulk --save`

## Usage with Node
```js
const bunyan = require('bunyan');
const createESStream = require('bunyan-elasticsearch-bulk');

const config = {
    name: "Application Name",
    streams: [{
        level: 'debug',
        stream: createESStream({
            indexPattern: '[logstash-]YYYY.MM.DD',
            type: 'logs',
            host: 'http://localhost:9200'
        })
    }]
};

const log = bunyan.createLogger(config);

log.info({message: 'Log this message!'});
```

## List of Configuration Parameters
- Parameters Specific to ElasticSearch Client, and will be passed to the client without any change:
    - `host`
        - Full URL of ES server with the port.
        - Required
        - For https, don't use port 443.
        - Example: `http://localhost:9200`
    - hosts
    - log
    - plugins
    - sniffEndpoint
- Parameters Specific to this Module
    - `indexPattern`
        - Pattern for the daily segmentation of log indices.
        - Optional
        - Default: `[logstash-]YYYY[-]MM[-]DD`
    - `type`
        - Type of your logs
        - Optional
        - Default: `logs`
    - `limit`
        - How many logs to save before submitting them to ES
        - Optional
        - Default: `100`
    - `interval`
        - Time in milliseconds before writing logs even if their count has not reached the `limit`.
        - Optional
        - Default: `5000`
    - `client`
        - Optional
        - Default: `elasticsearch.Client(options)` will be used.
```js
{
    // Required: Full URL of ES server with the port.
    // For https, don't use port 443.
    host: 'http://localhost:9200',
}
```

## Changes since 1.0.x
- For you as a client, you no longer need to use the keyword `new` with this module. There is a factory function now. Example above is updated.

## Development
- A docker-compose.yaml file has been added to make it easier to develop and test locally.

## Author(s)
- Milad Kawas Cale

## License
MIT
