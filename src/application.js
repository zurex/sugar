import commander from 'commander'
import fs from 'fs'
import path from 'path'
import ioclient from 'socket.io-client'
import log4js from 'log4js'
import pkg from '../package.json'
import Channel from './module/channel'
import {InMemorySession} from './module/session'

const logger = log4js.getLogger()

class Application{
  constructor(group, configPath, index){
    this.group = group
    this.configPath = configPath
    this.index = index
    this.__session = new InMemorySession()
    this.loadConfig()
    this.loadComponents()
    this.loadFactory()
    this.registerIO()
  }
  loadConfig(){
    let data = fs.readFileSync(this.configPath)
    this.__conf__ = JSON.parse(data.toString())[this.group][this.index]
    this.name = this.__conf__.name
  }
  loadFactory(){
    let fp = fs.realpathSync(`./app/${this.group}`).toString()
    let fc = require(fp)
    this.factory = fc
  }
  loadComponents(){
    fs.readdirSync(__dirname + '/components').forEach(filename=> {
        if (!/\.js$/.test(filename)) {
            return
        }
        const name = path.basename(filename, '.js')
        this[name] = require(`./components/${name}`)
    })
  }
  registerIO(){
      process.on('message', data=>{
          let {id, method, message} = data
          let channel = new Channel(id, message)
          channel.session = this.__session__[id]
          this.factory[method](channel)
      })
  }
  start(){
      this.io = ioclient('ws://127.0.0.1:4000', {transports: ['websocket']})
      logger.info(`${this.name} start [group: ${this.group}]`)
  }
}

commander
  .version(pkg.version)
  .option('-n, --name <string>', 'app name')
  .option('-g, --group <string>', 'app group')
  .option('-c, --config <string>', 'config file path')
  .option('-i, --index <n>', 'index in group')
  .parse(process.argv)

let app = new Application(commander.group, commander.config, commander.index)
app.start()
