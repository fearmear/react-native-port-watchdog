# React Native Port Watchdog
Keeps port used by React Native packager revesed for devices listed in the config

![Screenshot](https://raw.githubusercontent.com/fearmear/react-native-port-watchdog/master/docs/screenshot.png)

## Prerequisites
`adb` in your PATH

## Usage

0. Install modules `yarn add react-native-port-watchdog npm-run-all`
0. Add config file to project. See **config-example/.rnpwdrc.json**
0. Add `.rnpwdrc.json` line to your **.gitignore**
0. Make your "scripts" section in **package.json** to look something like this:
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

## TODO
- Think of an easier way to create config file
