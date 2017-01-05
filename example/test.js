class Application{
    route(){
        console.log('route')
    }
    configure(env, type, fn) {
        var args = [].slice.call(arguments);
        console.log(args)
        fn = args.pop();
       
        env = type = 'all';

        if(args.length > 0) {
            env = args[0];
        }
        if(args.length > 1) {
            type = args[1];
        }

        if (env === 'all' || env=='dev') {
            if (type === 'all') {
                console.log('call')
                
                fn.call(this);
            }
        }
        return this;
    }
}

let chat = ()=>{console.log('chat')}

let app = new Application()

app.configure('dev', function() {
	// route configures
    console.log(this)
	app.route('chat', chat);
    console.log("hahah")
    console.log(process.argv)
});
