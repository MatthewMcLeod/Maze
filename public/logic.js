$(document).ready(function() {


var socket = io();
var mazeInfo
var restartPause = false;

socket.on('update maze', function(maze){
		mazeInfo = maze;
		makeTable(mazeInfo)
})
socket.on('end found', function(maze){
	restartPause = true;
	mazeInfo = maze;
	makeTable(mazeInfo)
	$('#restart_bar').text('Congratulations! You solved the maze');
})

socket.on('restart', function(x){
	if (x != 0){
		$('#restart_bar').text('Restarting in ' + x);
	}
	else {
		$('#restart_bar').text('');
		restartPause = false;
	}
})

$(document).keydown(function(e) {
	if (!restartPause){
        var loc = findLocation(mazeInfo);

    switch(e.which) {
        case 37: // left
            if (loc != {row:-1,col:-1}){
                var move = {row:loc.row, col:loc.col - 1};
                if (checkMove(mazeInfo,move, "left", loc)){
					socket.emit('arrow key', {mazeState:mazeInfo, move: move , oldLocation:loc})
                }
            }
            break;

        case 38: // up
            if (loc != {row:-1,col:-1}){
                var move = {row:loc.row - 1, col:loc.col};
                if (checkMove(mazeInfo,move,"top", loc)){
					socket.emit('arrow key', {mazeState:mazeInfo, move: move , oldLocation:loc})
                }
            }
            break;

        case 39: // right
            if (loc != {row:-1,col:-1}){
                var move = {row:loc.row, col:loc.col + 1};
                if (checkMove(mazeInfo,move, "right", loc)){
					socket.emit('arrow key', {mazeState:mazeInfo, move: move , oldLocation:loc})
                }
            }
            break;

        case 40: // down
            if (loc != {row:-1,col:-1}){
                var move = {row:loc.row + 1, col:loc.col};
                if (checkMove(mazeInfo,move, "bottom", loc)){
					socket.emit('arrow key', {mazeState:mazeInfo, move: move , oldLocation:loc})
                }
            }
            break;

        default: return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
	}
});
    var checkMove = function(mazeInfo, wantedMove, direction, location){
			if (mazeInfo[location.row][location.col][direction] === true) {
				// wall is there
				return false;
			} else {
				return true;
			}
    }
    var findLocation = function(mazeInfo){
        for(var i=0; i<mazeInfo.length; i++){
            for (var j = 0; j < mazeInfo[i].length; j++){
                if (mazeInfo[i][j].isPlayer){
                    return {row:i,col:j}
                }
            }
        }
        return {row:-1,col:-1}
    }
    var makeTable = function (maze) {
        $('#my_table').empty();
        var table = $('<table border = "1"></table>').addClass("table");
				for (var i = 0; i < maze.length; i++) {
					var row = $('<tr></tr>').addClass('rows');
					for (var j = 0; j < maze[0].length; j++){
						var cell = $('<td></td>').addClass("cells")
						if (!maze[i][j].right) {
							cell.addClass("right-hole");
						}
						if (!maze[i][j].left) {
							cell.addClass("left-hole");
						}
						if (!maze[i][j].top) {
							cell.addClass("top-hole");
						}
						if (!maze[i][j].bottom) {
							cell.addClass("bottom-hole");
						}
						if (maze[i][j].isPlayer){
							cell.addClass("cur-spot");
						}
						if (maze[i][j].isFinish){
							cell.addClass("end-spot");
						}
						row.append(cell)
					}
					table.append(row)
				}
        $('#my_table').append(table);
    }
})
