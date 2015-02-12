var $ = require('NodObjC')
var EventLoop = require('./EventLoop')
EventLoop.initObjC($)

function nsString(string) {
  return $.NSString('stringWithUTF8String', string)
}

function createTray (done) {
  var pool = $.NSAutoreleasePool('alloc')('init')
  var app  = $.NSApplication('sharedApplication')
  var loop = new EventLoop()

  var tray = new Tray({
    eventLoop: loop,
    autoreleasePool: pool
  })

  var AppDelegate = $.NSObject.extend('AppDelegate')
  AppDelegate.addMethod('applicationDidFinishLaunching:', 'v@:@', function (self, _cmd, notif) {
    done(null, tray)
  })

  AppDelegate.addMethod('callback:', 'v@:@', function (self, _cmd, sender) {
    var tag = sender('tag')
    var action = tray._callbacks[tag]
    action.callback(action.data)
  })

  AppDelegate.register()
  var delegate = AppDelegate('alloc')('init');
  app('setDelegate', delegate);

  app('activateIgnoringOtherApps', $.YES);
  app('finishLaunching')
  loop.start()
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

function Tray(options) {
  this.eventLoop = options.eventLoop
  this.autoreleasePool = options.autoreleasePool
  this._retainList = []
  this._callbacks = []
}

Tray.prototype._createStatusItem = function (options) {
  var statusBar = $.NSStatusBar('systemStatusBar')
  var statusItem = statusBar('statusItemWithLength', -1) // NSVariableStatusItemLength

  statusItem('retain');

  statusItem('setTitle', nsString(options.title))

  this._retainList.push(statusItem)

  return statusItem
}

Tray.prototype._createMenu = function () {
  var menu = $.NSMenu('alloc')('init')
  this._retainList.push(menu)
  return menu
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
  this._retainList.forEach(function (item) {
    item('release')
  })
  this._retainList.length = 0
  this._callbacks.length = 0
}

Tray.prototype.specify = function specify(options) {
  if (!Array.isArray(options)) { options = [options] }

  var self = this

  this._clear()

  // create the new items
  options.forEach(function (option) {
    var statusItem = self._createStatusItem(option)
    if (option.menuItems) {
      var menu = self._createMenu()
      option.menuItems.forEach(function (menuItemOption) {
        var menuItem = self._createMenuItem(menuItemOption)
        menu('addItem', menuItem)
      })
      statusItem('setMenu', menu)
    }
  })
}

Tray.prototype.close = function close() {
  this.autoreleasePool('release')
  this.eventLoop.stop()
}

module.exports = createTray
