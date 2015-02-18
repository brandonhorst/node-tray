var createApp = require('native-app')
var createTray = require('..')

createApp(function (err, app) {
  createTray(app, function (err, tray) {
    tray.specify({
      title: 'Hello, world!',
      menuItems: [{
        title: 'Informational'
      }, {
        title: 'Do something',
        shortcut: 'x',
        action: function () {
          console.log('You pressed a menuItem!')
        }
      }, {
        title: 'Quit',
        shortcut: 'q',
        action: function () {
          tray.close()
          app.close()
        }
      }]
    })
  })

  createTray(app, function (err, tray) {
    tray.specify({
      title: 'Supplemental',
      menuItems: [{
        title: 'Do something else',
        shortcut: 'x',
        action: function () {
          console.log('You pressed a menuItem in another tray!')
        }
      }, {
        title: 'Quit',
        shortcut: 'q',
        action: function () {
          tray.close()
        }
      }]
    })
  })
})
