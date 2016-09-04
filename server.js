"use strict"

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var clients = {};

var mazeGenerator = require("./maze/maze_generator");

const MAZE_SIZE_X = 5;
const MAZE_SIZE_Y = 5;

var maze = mazeGenerator(MAZE_SIZE_X,MAZE_SIZE_Y);

io.on('connection', function (socket) {
	console.log('a user connected');
	clients[socket.id] = socket;
	socket.emit('update maze', maze);

	socket.on('arrow key', function (key) {
		maze = key.mazeState
		makeMove(key.mazeState, key.move, key.oldLocation);
		io.sockets.emit('update maze', key.mazeState);
	})

	socket.on('disconnect', function () {
		console.log('user disconnected');
	});
});

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function () {
	console.log('listening on *:3000');
});

var countdown = function () {
	var x = 6;
	var interval = setInterval(function () {
		io.sockets.emit('restart', x--);
		if (x == -1) {
			maze = mazeGenerator(MAZE_SIZE_X,MAZE_SIZE_Y);
			initializeMaze(maze)
			clearInterval(interval);
			io.sockets.emit('update maze', maze);
		}
	}, 1000)
}

var initializeMaze = function (maze) {
	maze[0][0].isPlayer = true;
	maze[maze.length-1][maze[0].length-1].isFinish = true;
}

var makeMove = function (maze, moveTo, loc) {
	maze[loc.row][loc.col].isPlayer = false
	maze[moveTo.row][moveTo.col].isPlayer = true;
	if (maze[moveTo.row][moveTo.col].isFinish) {
		io.sockets.emit('end found', maze);
		countdown()
	}
}
initializeMaze(maze)
