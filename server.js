var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var clients = {};

var mazeInfo = [
    ['O',' ',' ',' ',' ','X',' ',' ',' ',' ',' '],
    [' ','X',' ','X',' ','X',' ','X','X',' ','X'],
    [' ','X',' ','X',' ',' ',' ','X',' ',' ','X'],
    [' ','X',' ','X',' ','X',' ','X','X','X','X'],
    [' ','X','X','X','X','X',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ','X',' ','X',' ',' '],
	[' ','X','X','X',' ','X','X','X','X',' ','X'],
    [' ',' ',' ','X',' ',' ','X',' ',' ',' ','X'],
	[' ','X','X','X','X',' ',' ','X','X','X',' '],
	[' ','X',' ',' ','X',' ','X','X',' ','X',' '],
	[' ',' ',' ',' ','X',' ',' ',' ',' ','X',' '],
	['X','X','X',' ','X',' ','X','X','X',' ',' '],
    [' ',' ',' ',' ','X',' ','X',' ',' ','X',' '],
    [' ','X','X','X','X',' ','X',' ',' ',' ',' '],
    [' ','X',' ',' ',' ',' ','X',' ','X','X',' '],
    [' ',' ','X',' ','X',' ',' ',' ','X',' ',' ']

]

var mazeInfoOriginal = mazeInfo;

io.on('connection', function(socket){
	console.log('a user connected');
	clients[socket.id] = socket;
	socket.emit('update maze',mazeInfo);

	socket.on('arrow key', function (key) {
		mazeInfo = key.mazeState
		makeMove(key.mazeState,key.move,key.oldLocation);
		io.sockets.emit('update maze',key.mazeState);
	})
	
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

var makeMove = function (mazeInfo, move,xy){
        mazeInfo[xy[0]][xy[1]] = ""
        mazeInfo[move[0]][move[1]] = "O";
        if (move[0] === mazeInfo.length-1 && move[1] === mazeInfo[mazeInfo.length-1].length-1){
            io.sockets.emit('end found', mazeInfo);
			countdown()
        }
}
var x = 6
var countdown = function(){
	var interval = setInterval( function(){
		io.sockets.emit('restart', x--);
		if (x == -1){
			mazeInfo = mazeInfoOriginal;
			clearInterval(interval);
			x = 6;
			io.sockets.emit('update maze',mazeInfoOriginal);
		}
	},1000)
}

app.use(express.static(__dirname+ '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});