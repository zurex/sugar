import fs from 'fs'

export default class Connector{
    constructor(fname, opts){
        this.opts = opts
        this.fname = fname
        this.data = fs.readFileSync(fname)
        this.configuration = JSON.parse(
            this.data.toString()
            )
    }
    getRole(role){
        return this.configuration[role]
    }
    updateRole(role, data){
        this.configuration[role] = data
    }
    sync(){
        return fs.writeFile(JSON.stringify(this.configuration))
    }
}
