import * as ioclient from 'socket.io-client'

interface Session{
    get(key:string):Object
    set(key:string, value:Object):void
}


class SocketIOSession implements Session{
    socket:SocketIOClient.Socket
    constructor(host:string){
        this.socket = ioclient(host, {transports: ['websocket']})
    }
    get(key:string):Object{
        let result = new Promise<any>((resolve, reject)=>{
            this.socket.emit('get', {'key':key}, function(data){
                return resolve(data)
            })
        })
        return result
    }
    set(key:string, value:Object){
        return this.socket.emit('set', {'key':key, 'value':value})
    }
}

class IpcSession implements Session{
    get(key:string):Object{
        return
    }
    set(key, item){

    }
}