import commander from 'commander'
import fs from 'fs'
import path from 'path'
import ioclient from 'socket.io-client'
import log4js from 'log4js'
import pkg from '../package.json'
import Channel from './modules/channel'
import {InMemorySession} from './modules/session'

const logger = log4js.getLogger()

class Application{
  constructor(group, configPath, index){
    this.group = group
    this.configPath = configPath
    this.index = index
    this.__session__ = new InMemorySession()
    this.__channel__ = {}
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
          let channel = this.__channel__[id]
          if(!channel){
            channel = new Channel(id, this.set.bind(this, id), this.get.bind(this, id))
            this.__channel__[id] = channel
          }
          channel.message = message
          this.factory[method](channel)
      })
  }
  /**
   * @param key {string}
   * @param value {any}
   */
  set(id, key ,value){
    this.io.emit('session', {'id': id, 'key': key, 'value': value})
  }
  /**
   * @param key {string}
   */
  get(id, key){
    return this.__session__[id][key]
  }
  start(){
      this.io = ioclient('ws://127.0.0.1:4000/channel', {transports: ['websocket']})
      this.io.on('session', (session)=>{
        this.__session__ = session
      })
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
