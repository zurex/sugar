'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _session = require('./session');

class Channel {
    constructor(id, message) {
        this.id = id;
        this.message = message;
        //this.session = new InMemorySession()
    }
    send(message) {
        process.send({ id: this.id, message: message });
    }
}
exports.default = Channel;