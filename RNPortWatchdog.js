const { promisify } = require('util')
const readFile = promisify(require('fs').readFile)
const path = require('path')
const process = require('process')
const exec = promisify(require('child_process').exec)

const usb = require('usb')

const { runConfigFileName, adbDeviceInitTimeout } = require('./config')

module.exports = class RNPortWatchdog {
  async start() {
    try {
      const config = await this.readConfig()
      config.devices.forEach(this.watchUSB.bind(this))
      console.log('Watchdog is up')
    } catch (e) {
      console.error(e)
    }
  }
  stop() {
    process.exit(0)
  }
  async readConfig() {
    try {
      const config = await readFile(path.join(process.cwd(), runConfigFileName), 'utf-8')
      return JSON.parse(config)
    } catch (e) {
      console.error(e)
    }
  }
  watchUSB({usbDeviceDescriptor, adbDeviceId}) {
    usb.on('attach', (device) => {
      console.log('USB device connected')
      const notMatching = Object.keys(usbDeviceDescriptor).filter((key) => {
        return !(key in device.deviceDescriptor && device.deviceDescriptor[key] === usbDeviceDescriptor[key])
      })
      if (notMatching.length === 0) {
        console.log('Matching USB device found')
        setTimeout(() => {
          this.reversePort(adbDeviceId)
        }, adbDeviceInitTimeout)
      } else {
        console.log('No matching USB device found')
      }
    })
    usb.on('detach', () => {
      console.log('USB device disconnected')
    })
  }
  async reversePort(adbDeviceId) {
    try {
      const { stderr } = await exec(`adb -s ${adbDeviceId} reverse tcp:8081 tcp:8081`)
      if (stderr.length > 0) {
        console.log('Error during port reverse:', stderr)
      } else {
        console.log('Port reversed')
      }
    } catch (e) {
      console.error(e)
    }
  }
}
