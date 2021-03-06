import { InMemorySession } from './session';
export default class Channel {
    constructor(id, set, get) {
        this.id = id;
        this.session = new InMemorySession();
        this.set = set;
        this.get = get;
    }
    send(name, message) {
        process.send({ id: this.id, name: name, message: message });
    }
}
