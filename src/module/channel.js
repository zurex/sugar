import {InMemorySession} from './session'

export default class Channel{
    constructor(id, message){
        this.id = id
        this.message = message
        //this.session = new InMemorySession()
    }
    send(message){
        process.send({id:this.id, message:message})
    }
}