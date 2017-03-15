import * as util from 'util'

export class IpcChannel{
    id:string
    message:Object
    constructor(id:string){
        this.id = id
    }
    /** 发送事件消息 */
    send(event:string, message:Object){
        process.send({id:this.id, event:event, message:message})
    }
}