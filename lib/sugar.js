'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _log4js = require('log4js');

var _log4js2 = _interopRequireDefault(_log4js);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _session = require('./modules/session');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = _log4js2.default.getLogger();
const defaultOpts = {
    configFile: './config/settings.json',
    port: 4000
};

class Sugar {
    constructor(opts) {
        this.__attr__ = {};
        this.__app__ = {};
        this.__appIO__ = {};
        this.__appConf__ = {};
        this.__socket__ = {};
        this.__session__ = new _session.InMemorySession();
        this.__conf__ = Object.assign(defaultOpts, opts);
    }
    loadConfig() {
        let data = _fs2.default.readFileSync(this.__conf__.configFile);
        this.__appConf__ = JSON.parse(data.toString());
    }
    loadAppMethod(appName) {
        let fp = _fs2.default.realpathSync(`./app/${ appName }`).toString();
        let fc = require(fp);
        return Object.keys(fc);
    }
    loadApplication() {
        let appPath = _path2.default.join(__dirname, 'application.js');
        Object.keys(this.__appConf__).forEach(appName => {
            logger.info(`load app [${ appName }]`);
            this.__app__[appName] = [];
            this.__appIO__[appName] = this.loadAppMethod(appName);
            this.__appConf__[appName].forEach((conf, index) => {
                let app = _child_process2.default.fork(appPath, ['--group', appName, '--config', this.__conf__.configFile, '--index', index]);
                app.on('message', data => {
                    let { id, name, message } = data;
                    let socket = this.__socket__[id];
                    socket.emit(`${ appName }.${ name }`, message);
                });
                this.__app__[appName].push(app);
            });
        });
    }
    registerIO() {
        this.io = (0, _socket2.default)(this.__conf__.port, { transports: ['websocket'] });
        this.io.on('connection', socket => {
            this.__socket__[socket.id] = socket;
            Object.keys(this.__appIO__).forEach(appName => {
                this.__appIO__[appName].forEach(method => {
                    this.dispatchEvent.bind(this, appName, 'connect', socket);
                    socket.on(`${ appName }.${ method }`, this.dispatchEvent.bind(this, appName, method, socket));
                });
            });
        });
        this.channel = this.io.of('/channel');
        this.channel.on('connection', socket => {
            logger.info("app channel connect");
            socket.on('session', data => {
                let { id, key, value } = data;
                if (!this.__session__[id]) this.__session__[id] = {};
                this.__session__[id][key] = value;
                this.channel.emit('session', this.__session__);
            });
        });
    }
    dispatchEvent(appName, method, socket, message) {
        let app = this.__app__[appName][0];
        app.send({ id: socket.id, method: method, message: message });
    }
    start() {
        this.loadConfig();
        this.loadApplication();
        this.registerIO();
    }
}
exports.default = Sugar;