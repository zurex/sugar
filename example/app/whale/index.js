export function match(channel){
    channel.send({"match_reply": channel.get('user')})
}