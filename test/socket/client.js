var io = require('socket.io-client')
var socket = io('http://localhost:3000')
socket.emit('set', {key:'user', data:'zjc'})
socket.emit('get', 'user', function(data){
    console.log(data)
})