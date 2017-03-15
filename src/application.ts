import * as fs from 'fs'
import * as log4js from 'log4js'
import * as commander from 'commander'
import * as Channel from './modules/channel'

const logger = log4js.getLogger()
const pkg = require('../package.json')

class Application{
    /** 当前应用所属组 */
    group:string
    /** 配置文件地址 */
    confPath:string
    /** 当前组实例id */
    id:number
    /** 应用配置 */
    conf:SugarAppConfig
    /** 应用名称 */
    name:string
    /** 事件工厂 */
    factory:any
    channels:Map<string, Channel.IpcChannel>
    constructor(group:string, confPath:string, id:number){
        this.group = group
        this.confPath = confPath
        this.id = id
        this.loadConfig()
    }
    /** 加载配置文件 */
    loadConfig(){
        let data = fs.readFileSync(this.confPath)
        this.conf = JSON.parse(data.toString())[this.group][this.id]
        this.name = this.conf.name
    }
    /** 加载事件工厂 */
    loadFactory(){
        let fp = fs.realpathSync(`./app/${this.group}`).toString()
        this.factory = require(fp)
    }
    /** 注册io */
    registerIO(){
        process.on('message', (ipcMessage:SugarIpcMessage)=>{
            let channel = this.channels.get(ipcMessage.id)
            if(!channel){
                channel = new Channel.IpcChannel(ipcMessage.id)
                this.channels.set(ipcMessage.id, channel)
            }
            channel.message = ipcMessage.message
            this.factory[ipcMessage.type](channel)
        })
        process.on('uncaughtException', (msg:string)=>{
            logger.error(msg)
        })
    }
}

commander
  .version(pkg.version)
  .option('-n, --name <string>', 'app name')
  .option('-g, --group <string>', 'app group')
  .option('-c, --config <string>', 'config file path')
  .option('-i, --index <n>', 'index in group')
  .parse(process.argv)