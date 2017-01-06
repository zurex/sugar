'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _session = require('./session');

class Channel {
    constructor(id, set, get) {
        this.id = id;
        this.session = new _session.InMemorySession();
        this.set = set;
        this.get = get;
    }
    send(message) {
        process.send({ id: this.id, message: message });
    }
}
exports.default = Channel;