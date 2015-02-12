var createTray = require('..')

createTray(function (err, tray) {
  tray.specify({
    title: 'Hello, world!',
    menuItems: [{
      title: 'Informational'
    }, {
      title: 'Do something',
      shortcut: 'x',
      action: function () { console.log('You pressed a menuItem!') }
    }, {
      title: 'Quit',
      shortcut: 'q',
      action: function () { tray.close() }
    }]
  })
})
