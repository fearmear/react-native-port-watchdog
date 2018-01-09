#!/usr/bin/env node

const RNPortWatchdog = require('./RNPortWatchdog')

const instance = new RNPortWatchdog()
instance.start()
