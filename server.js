var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var clients = {};

var TOP = 0;
var RIGHT = 1;
var BOTTOM = 2;
var LEFT = 3;

/*
Since print in rows then column, it goes more like
xi1j1 x1j2 x1j3 ....
xi2j1           ....
xi3j1
*/

var MAZE_SIZE_X = 25;
var MAZE_SIZE_Y = 25;

var generateMaze = function () {
	var maze = [];
	for (var i = 0; i < MAZE_SIZE_Y; i++) {
		maze.push([])
		for (var j = 0; j < MAZE_SIZE_X; j++) {
			maze[i][j] = {
				top: false,
				right: false,
				bottom: false,
				left: false,
				isPlayer: false,
				isFinish: false,
				isVisited: false
			};
		}
	}
	maze[0][0].isPlayer = true;
	maze[MAZE_SIZE_Y - 1][MAZE_SIZE_X - 1].isFinish = true;

	var seed = [Math.floor(MAZE_SIZE_Y * Math.random()), Math.floor(MAZE_SIZE_X * Math.random())]
	maze = generatePath(maze, seed[0], seed[1])
	return maze;
}

var generatePath = function (maze, x, y) {
	maze[x][y].isVisited = true;
	var possibleDirections = [TOP, RIGHT, BOTTOM, LEFT];
	cleanEdges(possibleDirections, x, y);


	//if (possibleDirections.length) {
	while (possibleDirections.length) {
		var direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)] // possible direction
		var newCoords = getNewCoordinates(x, y, direction);

		if (maze[newCoords[0]][newCoords[1]].isVisited) {
			removeDirection(possibleDirections, direction); // has already been visited

		} else {
			maze[x][y][numToString(direction)] = true;
			maze[newCoords[0]][newCoords[1]][numToString(findOpposite(direction))] = true;
			generatePath(maze, newCoords[0], newCoords[1])
		}
	}

	return maze;
}
var findOpposite = function (direction) {
	return (direction + 2) % 4;
}
var numToString = function (direction) {
	var stringDirection = ""
	switch (direction) {
		case 0:
			stringDirection = "top";
			break;
		case 1:
			stringDirection = "right";
			break;
		case 2:
			stringDirection = "bottom";
			break;
		case 3:
			stringDirection = "left";
			break;
	}
	return stringDirection;
}

var getNewCoordinates = function (x, y, direction) {
	var newCoords = [];
	if (direction == TOP) {
		newCoords = [x - 1, y]
	} else if (direction == RIGHT) {
		newCoords = [x, y + 1]
	} else if (direction == BOTTOM) {
		newCoords = [x + 1, y];
	} else if (direction == LEFT) {
		newCoords = [x, y - 1]
	} else {
		console.error("huhoh we have a problem")
	}
	return newCoords;
}
var cleanEdges = function (possibleDirections, x, y) {
	if (x == 0) { // is actually Y
		possibleDirections = removeDirection(possibleDirections, TOP)
	} else if (x == (MAZE_SIZE_Y - 1)) {
		possibleDirections = removeDirection(possibleDirections, BOTTOM)
	}
	if (y == 0) {
		possibleDirections = removeDirection(possibleDirections, LEFT)
	} else if (y == (MAZE_SIZE_X - 1)) {
		possibleDirections = removeDirection(possibleDirections, RIGHT)
	}
}

var removeDirection = function (possibleDirections, toRemove) {
	var index = possibleDirections.indexOf(toRemove)
	index != -1 ? possibleDirections.splice(index, 1) : possibleDirections;
	return possibleDirections 
}

var maze = generateMaze();

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

var makeMove = function (maze, move, xy) {
	maze[xy[0]][xy[1]].isPlayer = false
	maze[move[0]][move[1]].isPlayer = true;
	if (move[0] === maze.length - 1 && move[1] === maze[maze.length - 1].length - 1) {
		io.sockets.emit('end found', maze);
		countdown()
	}
}

var countdown = function () {
	var x = 6;
	var interval = setInterval(function () {
		io.sockets.emit('restart', x--);
		if (x == -1) {
			maze = generateMaze();
			clearInterval(interval);
			x = 6;
			io.sockets.emit('update maze', maze);
		}
	}, 1000)
}

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function () {
	console.log('listening on *:3000');
});
