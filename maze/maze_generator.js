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

var generateMaze = function (MAZE_SIZE_X, MAZE_SIZE_Y) {
	if (MAZE_SIZE_X < 1 || MAZE_SIZE_Y < 1) {
		return {err: "Size of maze [" + MAZE_SIZE_X + "," + MAZE_SIZE_Y + "] is invalid. Pleae use positive numbers"}
	}
	MAZE_SIZE_X = MAZE_SIZE_X ? MAZE_SIZE_X : 25
	MAZE_SIZE_X = MAZE_SIZE_X ? MAZE_SIZE_X : 25

	var maze = [];
	for (var i = 0; i < MAZE_SIZE_Y; i++) {
		maze.push([])
		for (var j = 0; j < MAZE_SIZE_X; j++) {
			maze[i][j] = {
				top: true,
				right: true,
				bottom: true,
				left: true,
				isPlayer: false,
				isFinish: false,
				isVisited: false
			};
		}
	}

	var seed = [Math.floor(MAZE_SIZE_Y * Math.random()), Math.floor(MAZE_SIZE_X * Math.random())]
	maze = generatePath(maze, seed[0], seed[1])
	removeInternalInfo(maze, ["isVisited"]);
	return maze;
}

var generatePath = function (maze, x, y) {
	maze[x][y].isVisited = true;
	var possibleDirections = [TOP, RIGHT, BOTTOM, LEFT];
	clearBoundaries(possibleDirections, x, y, maze);

	while (possibleDirections.length) {
		var direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)] // possible direction
		var newCoords = getNewCoordinates(x, y, direction);

		if (maze[newCoords[0]][newCoords[1]].isVisited) {
			removeDirection(possibleDirections, direction); // has already been visited

		} else {
			maze[x][y][numToString(direction)] = false;
			maze[newCoords[0]][newCoords[1]][numToString(findOpposite(direction))] = false;
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
	}
	return newCoords;
}
var clearBoundaries = function (possibleDirections, x, y, maze) {
	if (x == 0) { // is actually Y
		possibleDirections = removeDirection(possibleDirections, TOP)
	} else if (x == (maze.length - 1)) {
		possibleDirections = removeDirection(possibleDirections, BOTTOM)
	}
	if (y == 0) {
		possibleDirections = removeDirection(possibleDirections, LEFT)
	} else if (y == (maze[0].length - 1)) {
		possibleDirections = removeDirection(possibleDirections, RIGHT)
	}
}

var removeDirection = function (possibleDirections, toRemove) {
	var index = possibleDirections.indexOf(toRemove)
	index != -1 ? possibleDirections.splice(index, 1) : possibleDirections;
	return possibleDirections 
}

var removeInternalInfo = function (maze, infoToRemove) {
	for (var i = 0; i < maze.length; i++) {
		for (var j = 0; j < maze[0].length; j++) {
			for (var k = 0; k < infoToRemove.length; k++) {
				delete maze[i][j][infoToRemove]
			}
		}
	}
}

module.exports = generateMaze