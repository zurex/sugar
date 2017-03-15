import * as fs from 'fs';
import * as log4js from 'log4js';
import * as Channel from './modules/channels';
const logger = log4js.getLogger();
class Application {
    constructor(group, confPath, id) {
        this.group = group;
        this.confPath = confPath;
        this.id = id;
        this.loadConfig();
    }
    /** 加载配置文件 */
    loadConfig() {
        let data = fs.readFileSync(this.confPath);
        this.conf = JSON.parse(data.toString())[this.group][this.id];
        this.name = this.conf.name;
    }
    /** 加载事件工厂 */
    loadFactory() {
        let fp = fs.realpathSync(`./app/${this.group}`).toString();
        this.factory = require(fp);
    }
    /** 注册io */
    registerIO() {
        process.on('message', (ipcMessage) => {
            let channel = this.channels.get(ipcMessage.id);
            if (!channel) {
                channel = new Channel.IpcChannel(ipcMessage.id);
                this.channels.set(ipcMessage.id, channel);
            }
            channel.message = ipcMessage.message;
            this.factory[ipcMessage.type](channel);
        });
        process.on('uncaughtException', (msg) => {
            logger.error(msg);
        });
    }
}
