export class IpcChannel {
    constructor(id) {
        this.id = id;
    }
    /** 发送事件消息 */
    send(event, message) {
        process.send({ id: this.id, event: event, message: message });
    }
}
