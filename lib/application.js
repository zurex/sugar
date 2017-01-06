'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

var _log4js = require('log4js');

var _log4js2 = _interopRequireDefault(_log4js);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _channel = require('./modules/channel');

var _channel2 = _interopRequireDefault(_channel);

var _session = require('./modules/session');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = _log4js2.default.getLogger();

class Application {
  constructor(group, configPath, index) {
    this.group = group;
    this.configPath = configPath;
    this.index = index;
    this.__session__ = new _session.InMemorySession();
    this.__channel__ = {};
    this.loadConfig();
    this.loadComponents();
    this.loadFactory();
    this.registerIO();
  }
  loadConfig() {
    let data = _fs2.default.readFileSync(this.configPath);
    this.__conf__ = JSON.parse(data.toString())[this.group][this.index];
    this.name = this.__conf__.name;
  }
  loadFactory() {
    let fp = _fs2.default.realpathSync(`./app/${ this.group }`).toString();
    let fc = require(fp);
    this.factory = fc;
  }
  loadComponents() {
    _fs2.default.readdirSync(__dirname + '/components').forEach(filename => {
      if (!/\.js$/.test(filename)) {
        return;
      }
      const name = _path2.default.basename(filename, '.js');
      this[name] = require(`./components/${ name }`);
    });
  }
  registerIO() {
    process.on('message', data => {
      let { id, method, message } = data;
      let channel = this.__channel__[id];
      if (!channel) {
        channel = new _channel2.default(id, this.set.bind(this), this.get.bind(this));
        this.__channel__[id] = channel;
      }
      channel.message = message;
      this.factory[method](channel);
    });
  }
  /**
   * @param key {string}
   * @param value {any}
   */
  set(key, value) {
    this.io.emit('session', { 'key': key, 'value': value });
  }
  /**
   * @param key {string}
   */
  get(key) {
    return this.__session__[key];
  }
  start() {
    this.io = (0, _socket2.default)('ws://127.0.0.1:4000/channel', { transports: ['websocket'] });
    this.io.on('session', session => {
      this.__session__ = session;
    });
    logger.info(`${ this.name } start [group: ${ this.group }]`);
  }
}

_commander2.default.version(_package2.default.version).option('-n, --name <string>', 'app name').option('-g, --group <string>', 'app group').option('-c, --config <string>', 'config file path').option('-i, --index <n>', 'index in group').parse(process.argv);

let app = new Application(_commander2.default.group, _commander2.default.config, _commander2.default.index);
app.start();