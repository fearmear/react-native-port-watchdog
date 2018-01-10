# React Native Port Watchdog
Keeps port used by React Native packager revesed for Android devices listed in the config

![Screenshot](https://raw.githubusercontent.com/fearmear/react-native-port-watchdog/master/docs/screenshot.png)

## Prerequisites
`adb` in your PATH

## Usage

1. Install modules `yarn add react-native-port-watchdog npm-run-all`
1. Make your **"scripts"** section in **package.json** look something like this:
```json
{
  "scripts": {
      "start": "run-p start-packager watch-port",
      "start-packager": "react-native start",
      "watch-port": "react-native-port-watchdog",
    }
}
```

Now run `yarn start`

Consider adding `.rnpwdrc.json` line to your **.gitignore**

## Advanced Configuration
Set **"device.adbDeviceId"** from `adb devices` in **.rnpwdrc.json** file to associate reverse with specific device

## TODO
- Think of an easier way to associate reverse with specific device
