$(document).ready(function() {

$('#title').text('You are the green square. Reach the red square.')

var socket = io();
var mazeInfo
var restartPause = false;

socket.on('update maze', function(maze){
		mazeInfo = maze;
//		console.log(mazeInfo)
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
                if (checkMove(mazeInfo,move)){
					socket.emit('arrow key', {mazeState:mazeInfo, move: move , oldLocation:xy})
                }
            }
            break;

        case 38: // up
            var xy = findLocation(mazeInfo);
            if (xy != [-1,-1]){
                var move = [xy[0] - 1, xy[1]];
                if (checkMove(mazeInfo,move)){
					socket.emit('arrow key', {mazeState:mazeInfo, move: move , oldLocation:xy})
                }
            }
            break;

        case 39: // right
            var xy = findLocation(mazeInfo);
            if (xy != [-1,-1]){
                var move = [xy[0], xy[1] + 1];
                if (checkMove(mazeInfo,move)){
					socket.emit('arrow key', {mazeState:mazeInfo, move: move , oldLocation:xy})
                }
            }
            break;

        case 40: // down
            var xy = findLocation(mazeInfo);
            if (xy != [-1,-1]){
                var move = [xy[0] + 1, xy[1]];
                if (checkMove(mazeInfo,move)){
					socket.emit('arrow key', {mazeState:mazeInfo, move: move , oldLocation:xy})
                }
            }
            break;

        default: return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
	}
});
    var checkMove = function(mazeInfo, wantedMove){
        if ( wantedMove[0] >= mazeInfo.length || wantedMove[1] >= mazeInfo[0].length || wantedMove[0] < 0 || wantedMove[1] < 0 || mazeInfo[wantedMove[0]][wantedMove[1]] === "X"){
            return false;
        }
        else {
            return true
        }
    }
    var findLocation = function(mazeInfo){
        for(var i=0; i<mazeInfo.length; i++){
            for (var j = 0; j < mazeInfo[i].length; j++){
                if (mazeInfo[i][j] == 'O'){
                    return [i,j]
                }
            }
        }
        return [-1,-1]
    }
    var makeTable = function (mazeInfo) {
        $('#my_table').empty();
        var table = $('<table></table>').addClass('table');
        for(var i=0; i<mazeInfo.length; i++){
            var row = $('<tr></tr>').addClass('rows');
            for (var j = 0; j < mazeInfo[i].length; j++){
                var cell = $('<td></td>').addClass("cells").text(mazeInfo[i][j])
                if (mazeInfo[i][j] == 'X'){
                    cell.addClass("blocked")
                }
				if ( i == (mazeInfo.length-1) && j == (mazeInfo[i].length-1)) {
                    cell.text('')
                    cell.addClass("end-spot")
                }
				
                if (mazeInfo[i][j] == 'O'){
                    cell.text('')
                    cell.addClass("cur-spot")
                }
                row.append(cell);
            }
            table.append(row);
        }
        $('#my_table').append(table);
    }
    //makeTable(mazeInfo)
})