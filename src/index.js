const {updatedData}=require('./models/sendData')
const http=require('http')
const db=require('./databaseConnection/mariadb')
const express=require('express')
const socketio=require('socket.io')
const schedule=require('node-schedule')
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

const app=express()
const publicDirPath=path.join( __dirname , './../public')

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/forgot', function(request, response) {
	response.sendFile(path.join(__dirname + '/forgot.html'));
});

app.post('/reset',function(request,response){
   var username=request.body.email
   var new_password=request.body.new_pass
  
	if (username && new_password) {
		connection.query('UPDATE login SET password=? WHERE email=?;', [new_password,username], function(error, results, fields) {
       console.log("completed reset sucessfully");
		   response.redirect('/');
		
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});


app.post('/login', function(request, response) {
  
	var username = request.body.email;
	var password = request.body.pass;
    console.log(username+"   "+password)

	if (username && password) {
        db.connectionPool.getConnection().then((conn)=>{
            conn.query('SELECT * FROM login WHERE email = ? AND password = ?', [username, password]).then((results)=>{
                if (results.length > 0) {
                    request.session.loggedin = true;
                    request.session.username = username;
                    response.redirect('/home');
    
                } else {
                    response.send('Incorrect Username and/or Password!');
                }			
                response.end();
                conn.release()
            }).catch((e)=>{
                console.log(e)
                conn.release()
            })
        }).catch
	// 	connection.query('SELECT * FROM login WHERE email = ? AND password = ?', [username, password], function(error, results, fields) {
    //    console.log("hello");
    //    console.log(results);
	// 		if (results.length > 0) {
	// 			request.session.loggedin = true;
	// 			request.session.username = username;
	// 			response.redirect('/home');

	// 		} else {
	// 			response.send('Incorrect Username and/or Password!');
	// 		}			
	// 		response.end();
	// 	});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/logout', function(request, response) {
	 request.session.loggedin = false;
   response.redirect('/');
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
        // const publicDirPath=path.join( __dirname, './../public')
        app.use(express.static(publicDirPath))

		response.sendFile(path.join(__dirname + '/../public/index.html'));
		// response.sendFile(publicDirPath);
        // app.use(publicDirPath)
        // app.use(express.static(publicDirPath))

	} else {
		// response.send('Please login to view this page!');
		// response.end();
        response.redirect('/')
	}
});

const server=http.createServer(app)
const io=socketio(server)

const port=process.env.PORT || 4001

app.use(express.json())

io.on('connection',(socket)=>{

    console.log("NEW")
     socket.emit('message',updatedData())

    schedule.scheduleJob('*/4 * * * * *',function(){
        socket.emit('message',updatedData())
    })
})

server.listen(port,()=>{
    console.log('Running on port: '+port)
})
