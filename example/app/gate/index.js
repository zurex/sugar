export function match(channel){
    channel.send({'response': channel.message})
    channel.set('user', channel.message)
}