const bunyan = require('bunyan');
const BunyanElasticSearch = require('./lib/bunyan-elasticsearch');
const dotEnv = require('dotenv');
const e = dotEnv.config(__dirname).parsed;

const config = {
    name: e.APP_NAME,
    streams: [{
        level: 'debug',
        stream: new BunyanElasticSearch({
            indexPattern: '[logstash-]YYYY[-]MM[-]DD',
            type: 'logs',
            host: e.ELASTICSEARCH_HOST
        })
    }],
    serializers: bunyan.stdSerializers,
    src: false
};

const log = bunyan.createLogger(config);

setInterval(() => {
    log.error('Hi');
}, 9);
