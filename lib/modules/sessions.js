import * as ioclient from 'socket.io-client';
class SocketIOSession {
    constructor(host) {
        this.io = ioclient(host, { transports: ['websocket'] });
    }
    get(key) {
        let result = new Promise((resolve, reject) => {
            this.io.emit('get', { 'key': key }, function (data) {
                return resolve(data);
            });
        });
        return result;
    }
    set(key, item) {
        return this.io.emit('set', { 'key': key, 'item': item });
    }
}
