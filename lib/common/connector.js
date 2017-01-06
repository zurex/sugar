'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Connector {
    constructor(fname, opts) {
        this.opts = opts;
        this.fname = fname;
        this.data = _fs2.default.readFileSync(fname);
        this.configuration = JSON.parse(this.data.toString());
    }
    getRole(role) {
        return this.configuration[role];
    }
    updateRole(role, data) {
        this.configuration[role] = data;
    }
    sync() {
        return _fs2.default.writeFile(JSON.stringify(this.configuration));
    }
}
exports.default = Connector;