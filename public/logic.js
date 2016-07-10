$(document).ready(function() {

$('#title').text('You are the green square. Reach the red square.')

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
    switch(e.which) {
        case 37: // left
            var xy = findLocation(mazeInfo);
            if (xy != [-1,-1]){
                var move = [xy[0], xy[1] - 1 ];
                if (checkMove(mazeInfo,move, "left", xy)){
					socket.emit('arrow key', {mazeState:mazeInfo, move: move , oldLocation:xy})
                }
            }
            break;

        case 38: // up
            var xy = findLocation(mazeInfo);
            if (xy != [-1,-1]){
                var move = [xy[0] - 1, xy[1]];
                if (checkMove(mazeInfo,move,"top", xy)){
					socket.emit('arrow key', {mazeState:mazeInfo, move: move , oldLocation:xy})
                }
            }
            break;

        case 39: // right
            var xy = findLocation(mazeInfo);
            if (xy != [-1,-1]){
                var move = [xy[0], xy[1] + 1];
                if (checkMove(mazeInfo,move, "right", xy)){
					socket.emit('arrow key', {mazeState:mazeInfo, move: move , oldLocation:xy})
                }
            }
            break;

        case 40: // down
            var xy = findLocation(mazeInfo);
            if (xy != [-1,-1]){
                var move = [xy[0] + 1, xy[1]];
                if (checkMove(mazeInfo,move, "bottom", xy)){
					socket.emit('arrow key', {mazeState:mazeInfo, move: move , oldLocation:xy})
                }
            }
            break;

        default: return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
	}
});
    var checkMove = function(mazeInfo, wantedMove, direction, location){
			if (mazeInfo[location[0]][location[1]][direction] === true) {
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
                    return [i,j]
                }
            }
        }
        return [-1,-1]
    }
    var makeTable = function (maze) {
        $('#my_table').empty();
				console.log("Making Table")
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
