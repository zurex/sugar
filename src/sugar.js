import fs from 'fs'
import path from 'path'
import child_process from 'child_process'
import log4js from 'log4js'
import socketio from 'socket.io'

const logger = log4js.getLogger()
const defaultOpts = {
  configFile: './config/settings.json',
  port: 4000
}

export default class Sugar{
  constructor(opts){
    this.__attr__ = {}
    this.__app__ = {}
    this.__appIO__ = {}
    this.__appConf__ = {}
    this.__socket__ = {}
    this.__conf__ = Object.assign(defaultOpts, opts)
  }
  loadConfig(){
    let data = fs.readFileSync(this.__conf__.configFile)
    this.__appConf__ = JSON.parse(data.toString())
  }
  loadAppMethod(appName){
    let fp = fs.realpathSync(`./app/${appName}`).toString()
    let fc = require(fp)
    return Object.keys(fc)
  }
  loadApplication(){
    let appPath = path.join(__dirname, 'application.js')
    Object.keys(this.__appConf__).forEach(name=>{
        logger.info(`load app [${name}]`)
        this.__app__[name] = []
        this.__appIO__[name] = this.loadAppMethod(name)
        this.__appConf__[name].forEach((conf, index)=>{
            let app = child_process.fork(appPath, [
                '--group', name, 
                '--config', this.__conf__.configFile,
                '--index', index
            ])
            app.on('message', data=>{
                let {id, message} = data
                let socket = this.__socket__[id]
                socket.emit(message)
            })
            this.__app__[name].push(app)
        })
    })
  }
  registerIO(){
      this.io = socketio(this.__conf__.port, {transports: ['websocket']})
      this.io.on('connection', socket=>{
          this.__socket__[socket.id] = socket
          Object.keys(this.__appIO__).forEach(appName=>{
              this.__appIO__[appName].forEach(method=>{
                  socket.on(`${appName}.${method}`, this.dispatchEvent.bind(this, appName, method, socket))
              })
          })
      })
  }
  dispatchEvent(appName, method, socket, message){
      let app = this.__app__[appName][0]
      app.send({id:socket.id, method: method, message: message})
  }
  start(){
    this.loadConfig()
    this.loadApplication()
    this.registerIO()
  }
}
