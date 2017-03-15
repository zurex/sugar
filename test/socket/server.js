var io = require('socket.io')();
io.on('connection', function(client){
    var session = {}
    client.on('get', function(key, callback){
        console.log('on get', key, data)
        callback(session[key])
    })
    client.on('set', function(message){
        key = message.key
        data = message.data
        console.log('on set', key, data, session)
        session[key] = data
    })
});
io.listen(3000);