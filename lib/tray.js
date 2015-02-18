var $ = require('NodObjC')

var i = 0

function nsString (string) {
  return $.NSString('stringWithUTF8String', string)
}

function createTray (app, done) {
  i++
  var pool = $.NSAutoreleasePool('alloc')('init')
  var TrayDelegate = $.NSObject.extend('TrayDelegate' + i)

  TrayDelegate.addMethod('callback:', 'v@:@', function (self, _cmd, sender) {
    var tag = sender('tag')
    var action = tray._callbacks[tag]
    action.callback(action.data)
  })

  TrayDelegate.register()

  var tray = new Tray({
    actor: TrayDelegate('alloc')('init')
  })
  pool('drain')

  process.nextTick(function () {
    done(null, tray)
  })
}

// var modifierMap = {
//   shift: $.NSShiftKeyMask,
//   ctrl: $.NSControlKeyMask,
//   cmd: $.NSCommandKeyMask,
//   alt: $.NSAlternateKeyMask
// }
//
// function atomToApple(shortcut) {
//
// }

function createStatusItem () {
  var statusBar = $.NSStatusBar('systemStatusBar')
  var statusItem = statusBar('statusItemWithLength', -1) // NSVariableStatusItemLength
  statusItem('retain')

  return statusItem
}

function createMenu () {
  var menu = $.NSMenu('alloc')('init')

  return menu
}

function Tray (options) {
  this._retainList = []
  this._callbacks = []
  this._actor = options.actor
  this._pool = options.pool
  this._statusItem = createStatusItem()
  this._menu = createMenu()
  this._statusItem('setMenu', this._menu)
}

Tray.prototype._createMenuItem = function (options) {
  var menuItem = $.NSMenuItem('alloc')(
    'initWithTitle', nsString(options.title),
    'action', null,
    'keyEquivalent', nsString('')
  )

  if (options.action) {
    menuItem('setAction', 'callback:')
    menuItem('setTag', this._callbacks.length)
    menuItem('setKeyEquivalent', nsString(options.shortcut || ''))
    menuItem('setTarget', this._actor)
    this._callbacks.push({
      callback: options.action,
      data: options.data || null
    })
  }

  this._retainList.push(menuItem)

  return menuItem
}

Tray.prototype._clear = function () {
  // release all retained items
  this._menu('removeAllItems')

  this._retainList.forEach(function (item) {
    item('release')
  })

  this._retainList.length = 0
  this._callbacks.length = 0
}

Tray.prototype.specify = function specify (options) {
  var pool = $.NSAutoreleasePool('alloc')('init')
  var self = this

  this._clear()

  this._statusItem('setTitle', nsString(options.title))

  // create the new items
  if (options.menuItems) {
    options.menuItems.forEach(function (menuItemOption) {
      var menuItem = self._createMenuItem(menuItemOption)
      self._menu('addItem', menuItem)
    })
  }
  pool('drain')
}

Tray.prototype.close = function close () {
  var pool = $.NSAutoreleasePool('alloc')('init')
  this._clear()
  this._menu('release')
  this._statusItem('setMenu', null)
  $.NSStatusBar('systemStatusBar')('removeStatusItem', this._statusItem)
  this._statusItem('release')
  this._actor('release')
  pool('drain')
}

module.exports = createTray
