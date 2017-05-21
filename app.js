var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use("/static", express.static(__dirname + "/static"));

var players = {};
var timers = {};

io.on('connection', onConnection);

function onConnection(socket) {
	
	socket.on('create table', function(roomID) {
		
		socket.emit('connecting', socket.id);

		socket.emit('show players', players);

		socket.on('connected', function(userID, X, Y, color, radius, XCur, YCur, roomID, userW, userH) {
			console.log("get: ", userID, "  ", X, " ", Y, " ", color, " ", radius, " in room: ", roomID);
			players[userID] = {
				x: X,
				y: Y,
				clr: color,
				r: radius,
				xCur: XCur,
				yCur: YCur,
				room: roomID,
				timerId: 0,
				uW: userW,
				uH: userH,
			};
			let uHeight = players[socket.id].uH;
			let uWeight = players[socket.id].uW;
			let originX = XCur;
			let originY = YCur;
			
			timers[socket.id] = setInterval(function() {
				let xCir = players[socket.id].x;
				let yCir = players[socket.id].y;
				let mouseX = players[socket.id].xCur;
				let mouseY = players[socket.id].yCur;
				
				
				console.log('uW = ' + players[socket.id].uW + ' uH = ' + players[socket.id].uH);
				console.log("\nxCir = ", xCir,
							"\nyCir = ", yCir,
							"\nmouseX = ", mouseX,
							"\nmouseX = ", mouseY);		
				var x;
				var y;
				
				if (interval(mouseX, xCir) && interval(mouseY, yCir)) {					
					console.log("\n      I exit    ");
					return;
				}
				
				if (((xCir < uWeight / 2 - players[socket.id].r - 10) && (originX < uWeight / 2)) || ((xCir > uWeight / 2) && (originX > uWeight / 2))) {
					let diffX = mouseX - xCir;
					let diffY = mouseY - yCir;
					if (diffX < 0) diffX = -diffX;
					if (diffY < 0) diffY = -diffY;
					
					let speed = 20;
					let trail = 0;
					
					//console.log("calculating");
					
					if (diffX > diffY) {
						
						//console.log("dX > dY");
						
						trail = (diffX * 1.0/speed)
						if (xCir > mouseX)
							x = xCir - trail;
						else 
							x = xCir + trail;
						y = ((x - xCir) / (mouseX - xCir) * (mouseY - yCir) + yCir);	
					} else {
						
						//console.log("dY > dX");
						
						trail = (diffY * 1.0 / speed)
						if (yCir > mouseY)
							y = yCir - trail;
						else 
							y = yCir + trail;
						x = ((y - yCir) / (mouseY - yCir) * (mouseX - xCir) + xCir);	
					}
					
					players[userID].x = x;
					players[userID].y = y;
					
					console.log("send: \nx = ", x, "\ny = ", y);
					console.log("\ncol = ", players[socket.id].r, "\ny = ", players[socket.id].clr);
					
					socket.emit("imoved", x, y);
					socket.broadcast.emit('player moved', socket.id, x, y, players[socket.id].room, players[socket.id].r, players[socket.id].clr);
				} else {
					if (originX < uWeight / 2) {
						x = xCir - 5;
						y = yCir;
						players[userID].x = x - 5;
						players[userID].y = y;
						socket.emit("imoved", x, y);
						socket.broadcast.emit('player moved', socket.id, x, y, players[socket.id].room, players[socket.id].r, players[socket.id].clr);
					}
					if (originX > uWeight / 2) {
						x = xCir + 5;
						y = yCir;
						players[userID].x = x + 5;
						players[userID].y = y;
						socket.emit("imoved", x, y);
						socket.broadcast.emit('player moved', socket.id, x, y, players[socket.id].room, players[socket.id].r, players[socket.id].clr);
					}
				};
				
			}, 50);
			
			//console.log("connected: ", socket.id, " in room ", room," mouse in: ", players[userID].xCur, '-', players[userID].yCur);
			socket.broadcast.emit('imready', socket.id, players[userID].x, players[userID].y, players[userID].clr, players[userID].r, players[userID].xCur, players[userID].yCur, players[userID].room);
		});

		socket.on('mouse moved', function(XCur, YCur) {
			//console.log("moved: ", socket.id, " mouse in: ", XCur, '-', YCur);
			players[socket.id].xCur = XCur;
			players[socket.id].yCur = YCur;
			//socket.broadcast.emit('mouse moved', socket.id, XCur, YCur);
		});

		socket.on('player moved', function(x, y){
			console.log('room ' + players[socket.id].room);
			if (!players[socket.id])
				return;
			console.log("moving: ", socket.id, " mouse in: ", x, '-', y);
			socket.emit('imoved', x, y);
			socket.broadcast.emit('player moved', socket.id, x, y, players[socket.id].room);
			socket.broadcast.emit('create tail', socket.id, x, y, players[socket.id].clr, players[socket.id].r, players[socket.id].room);
			if (x && y)
			{
				players[socket.id].x = x;
				players[socket.id].y = y;
			}
			
		});
		socket.on('disconnect', function(){
			clearInterval(timers[socket.id]);
			socket.broadcast.emit('dis', socket.id);
			delete players[socket.id];
			console.log("delete: ", socket.id, "\nnow: ", players.length, "\n");
		});
	});
};

function interval(a, b) 
{	
	console.log("a = ", a, "b + 10 = ", b + 10);
	console.log("a = ", a, "b + 10 = ", b - 10);
	return ((a <= (b + 10)) && (a >= (b - 10)));
}


 

http.listen(port, function(){
  console.log('listening on *:' + port);
});