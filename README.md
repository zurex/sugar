# sugarit
[![NPM](https://nodei.co/npm/sugarit.png?downloads=true)](https://nodei.co/npm/sugarit/)

sugarit is a easy use server
## quickstart
register your app in ./config/settings.json

    {
        "gate":[
            {"name":"mygate"}
        ]
    }
create your application in app dir    
`mkdir /app/{yourapp}`       
write your logic in index.js and export it, just like:

    export function hello(channel){
        channel.send({"response": "hello world"})
    }

start your server now

    import Sugar from 'sugarit'
    const server = new Sugar()
    server.start()

finnnaly, call it by socketio `socket.emit({yourapp}.hello)`      
see more detail in ./example

## usage
### channel
#### send
@param message {object}    
send it to client

#### set
@param key {string}    
@param value {any}
set a value to global session

#### get
@param key {string}      
get a value by key from global session

#### session
just like a object, it is a local variable, could not read it from a another process

## troubleshooting
issuse: https://github.com/zurex/sugar/issues     
