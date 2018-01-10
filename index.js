#!/usr/bin/env node
require('pretty-error').start()
const RNPortWatchdog = require('./RNPortWatchdog')

const { argv } = require('yargs')
  .option('port', {
    describe: 'Port the RN packager is working on',
    default: 8081,
    type: 'number',
  })
  .help()
  .recommendCommands()

const instance = new RNPortWatchdog({
  port: argv.port,
})
instance.start()
