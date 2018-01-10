const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const process = require('process')
const child_process = require('child_process')

require('pretty-error').start()
const usb = require('usb')
const jsonFormat = require('json-format')
const isEqual = require('lodash.isequal')

const { runConfigFileName, adbDeviceInitTimeout } = require('./config')
const defaultRunConfig = require('./defaultrc')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const exec = promisify(child_process.exec)

const readline = require('readline');
readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit()
  }
})

module.exports = class RNPortWatchdog {
  constructor() {
    this.pressXHandler = this.pressXHandler.bind(this)
  }
  async start() {
    try {
      this.config = await this.readRunConfig()
      this.watchUsbDevices()
      console.log('Watchdog is up')
    } catch (e) {
      this.handleError(e)
    }
  }
  stop() {
    process.exit(0)
  }
  async readRunConfig() {
    try {
      const config = await readFile(path.join(process.cwd(), runConfigFileName), 'utf-8')
      return JSON.parse(config)
    } catch (e) {
      return defaultRunConfig
    }
  }
  addDevice(usbDeviceData) {
    const data = this.stripUniqueUsbDeviceData(usbDeviceData)
    this.config.devices.push({
      adbDeviceId: null,
      usbDeviceData: data
    })
  }
  stripUniqueUsbDeviceData(usbDeviceData) {
    const data = Object.assign({}, usbDeviceData)
    delete data.deviceAddress
    delete data.portNumbers
    return data
  }
  isSameDevice(deviceA, deviceB) {
    return isEqual(
      this.stripUniqueUsbDeviceData(deviceA),
      this.stripUniqueUsbDeviceData(deviceB)
    )
  }
  async writeRunConfig() {
    try {
      return await writeFile(path.join(process.cwd(), runConfigFileName), jsonFormat(this.config), 'utf-8')
    } catch (e) {
      this.handleError(e)
    }
  }
  pressXHandler(str, key) {
    if (key.name === 'x') {
      this.addDevice(this.lastConnectedDevice)
      this.writeRunConfig()
      this.removePressXHandler()
      console.log('Device registered')
    }
  }
  addPressXHandler() {
    process.stdin.on('keypress', this.pressXHandler)
  }
  removePressXHandler() {
    process.stdin.removeListener('keypress', this.pressXHandler)
  }
  watchUsbDevices() {
    usb.on('attach', (connectedDevice) => {
      const storedDevices = this.config.devices
      this.lastConnectedDevice = connectedDevice
      console.log('USB device connected')
      if (storedDevices.length === 0) {
        console.log('No matching USB device found')
        console.log('Press "x" to register this device')
        this.addPressXHandler()
        return
      }
      storedDevices.forEach((storedDevice) => {
        if (this.isSameDevice(connectedDevice, storedDevice.usbDeviceData)) {
          console.log('Matching USB device found')
          setTimeout(() => {
            this.reversePort(connectedDevice.adbDeviceId)
          }, adbDeviceInitTimeout)
        } else {
          console.log('No matching USB device found')
          console.log('Press "x" to register this device')
          this.addPressXHandler()
        }
      })
    })
    usb.on('detach', () => {
      console.log('USB device disconnected')
      this.removePressXHandler()
    })
  }
  async reversePort(adbDeviceId) {
    const cmd = adbDeviceId ? `adb -s ${adbDeviceId} reverse tcp:8081 tcp:8081` : 'adb reverse tcp:8081 tcp:8081'
    try {
      const { stderr } = await exec(cmd)
      if (stderr.length > 0) {
        console.log('Error during port reverse:', stderr)
      } else {
        console.log('Port reversed')
      }
    } catch (e) {
      this.handleError(e)
    }
  }
  handleError(e) {
    console.error(e)
    process.exit(1)
  }
}
