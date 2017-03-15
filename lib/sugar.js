import * as fs from 'fs';
import * as path from 'path';
import * as log4js from 'log4js';
import * as child_process from 'child_process';
import * as socketio from 'socket.io';
const logger = log4js.getLogger();
const defaultOpts = {
    confFile: './config/settings.json',
    port: 4000
};
export default class Sugar {
    constructor(opts) {
        Object.defineProperties;
        this.conf = Object.assign(defaultOpts, opts);
    }
    /** 加载用户配置 */
    loadConfig() {
        let data = fs.readFileSync(this.conf.confFile);
        this.appConf = JSON.parse(data.toString());
    }
    /** 加载应用程序接口 */
    loadAppInterface(appName) {
        let fp = fs.realpathSync(`./app/${appName}`).toString();
        let app = require(fp);
        return Object.keys(app);
    }
    /** 启动应用程序 */
    loadApplication() {
        let appPath = path.join(__dirname, 'application.ts');
        Object.keys(this.appConf).forEach((appName) => {
            logger.info(`load app [${appName}]`);
            this.apps.set(appName, new Array());
            this.appsIO.set(appName, this.loadAppInterface(appName));
            this.appConf.get(appName).forEach((conf, index) => {
                let app = child_process.fork(appPath, [
                    '--group', appName,
                    '--config', this.conf.confFile,
                    '--index', index.toString()
                ]);
                this.apps.get(appName).push(app);
            });
        });
    }
    /** 注册对外接口 */
    registerIO() {
        this.io = socketio(this.conf.port, { transports: ['websocket'] });
        this.io.on('connection', socket => {
            this.connections.set(socket.id, socket);
            this.appsIO.forEach((appInterface, appName) => {
                // 系统接口
                let sys_event = ['connect', 'disconnect'];
                appInterface.forEach(method => {
                    let event = `${appName}.${method}`;
                    if (sys_event.indexOf(method) >= 0) {
                        event = method;
                    }
                    socket.on(event, this.dispatchEvent.bind(this, appName, method, socket));
                });
            });
        });
    }
    /** 分发接口处理 */
    dispatchEvent(appName, event, socket, message) {
        let app = this.apps.get(appName)[0];
        let ipcMessage = {
            id: socket.id,
            type: event,
            message: message
        };
        app.send(ipcMessage);
    }
    /** 启动sugar服务 */
    start() {
        this.loadConfig();
        this.loadApplication();
        this.registerIO();
    }
}
