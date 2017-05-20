var socket = io();

var radius = getRandomInt(20, 50);
var color = 'rgba(' + getRandomInt(0,255) + ',' + getRandomInt(0,255) + ',' + getRandomInt(0,255) + ',1)';
var cur;
var mouseX = 0;
var mouseY = 0;
var p = "px";

var roomId = '';


function newTable() {

	roomId = (Math.random().toString(36)).substring(2, 6);
	alert('Вы создали комнату ' + roomId);
	socket.emit('create table', roomId);
};

function connectTable() {
	roomId = prompt("Введите ID комнаты", "");
	if (roomId == null) 
		return;
	if (roomId != '' && roomId.indexOf(' ') < 0)
		socket.emit('create table', roomId);
	else
		wrongTable();					
};

function wrongTable() {

	roomId = prompt("Неверно введен ID \nВведите ID комнаты", "");
	if (roomId == null) 
		return;
	if (roomId != '' && roomId.indexOf(' ') < 0)
		socket.emit('create table', roomId);
	else
		wrongTable();			
};

socket.on('connecting', function(playerID) {
	document.title = "RoomID: " + roomId;
	document.body.innerHTML = "<div id='my' style='width: " + radius + p + "; height: " +  radius + p + "; background-color: " + color + "'></div>";
	document.body.innerHTML += "<div id='grid'></div>";
	
	//Добавление управляемого объекта
	var cir = document.getElementById('my');
	cir.style.left = getRandomInt(0, window.innerWidth) - (radius/2) + p;
	cir.style.top  = getRandomInt(0, window.innerHeight) - (radius/2) + p;	
	
	mouseX = cir.style.left;
	mouseY = cir.style.top;		
	
	//Добавление курсора
	//document.body.innerHTML += "<img id='my_cur' class='cursor' src='/static/cur.png' width='25' height='25'></img>";
	//cur = document.getElementById('my_cur');
	
	//console.log('connecting room ' + roomId)
	document.addEventListener('mousemove', move);
	socket.emit('connected', playerID, parseFloat(cir.style.left), parseFloat(cir.style.top), color, radius, parseFloat(mouseX), parseFloat(mouseY), roomId);
});
			
//first loading of players
socket.on('show players', function(players) {
	for (player in players)
		if (roomId == players[player].room)
			showPlayer(player, players[player].x, players[player].y, players[player].clr, players[player].r);
});

//new player
socket.on('imready', function(ID, x, y, color, radius, xCur, yCur, room) {
	console.log('imready pl: ' + roomId + ' get: ' + room);
	if (roomId == room)
		showPlayer(ID, x, y, color, radius, xCur, yCur);
});

socket.on('player moved', function(playerID, x, y, room, rad, clr) {
	console.log('player moved pl: ' + roomId + ' get: ' + room);
	if (roomId == room) {
		var cir = document.getElementById(playerID);
		
		cir.style.left = x + p;
		cir.style.top  = y + p;
		
		CreateTail(x, y, clr, rad);
	}
	
});

socket.on('create tail', function(playerID, x, y, color, radius, room) {
	if (roomId == room) {
			parent = document.getElementById('my');
			let circle = document.createElement('div');				
			circle.className = "circle opacityT"; 
			circle.style.backgroundColor = color;
			circle.style.width = radius + "px"; 
			circle.style.height = radius + "px";
			parent.appendChild(circle);
			circle.style.left = x + 'px';
			circle.style.top  = y + 'px';
			circle.addEventListener("animationend", function() {
				circle.remove();
		});
	}
});
		
//player disconnected
socket.on('dis', function(playerID) {
	let cir = document.getElementById(playerID);
	cir.remove();
});		

socket.on('imoved', function(x, y){
	var d = new Date();
	
	var cir = document.getElementById('my');
	cir.style.left = x + p;
	cir.style.top = y + p;	
	CreateTail(x, y, color, radius);
});							

function showPlayer(ID, x, y, color, radius) {
	console.log("show me: " + ID);
	
	document.body.innerHTML += "<div id='"+ ID + "' style='width: " + radius + p + "; height: " +  radius + p + "; background-color: " + color + "'></div>";
	
	window[ID] = radius;
	
	var cir = document.getElementById(ID);
	
	cir.style.left = x + p;
	cir.style.top  = y + p;	
}

function CreateTail(X,Y, color, radius){
	parent = document.getElementById('my');
	let circle = document.createElement('div');				
	circle.className = "circle opacityT"; 
	circle.style.backgroundColor = color;
	circle.style.width = radius + "px"; 
	circle.style.height = radius + "px";
	parent.appendChild(circle);
	circle.style.left = X + p;
	circle.style.top  = Y + p;
	circle.addEventListener("animationend", function() {
		circle.remove();
	});
};

function move(evt) {
	socket.emit('mouse moved', evt.x, evt.y);
	//socket.emit('player moved', evt.x - (radius/2), evt.y - (radius/2));
};

function tchmove(evt) {
	event.preventDefault();
	var left = evt.touches[0].pageX;
	var top = evt.touches[0].pageY; 
	

	socket.emit('mouse moved', left - (radius/2), top - (radius/2));
};


//circle is on pointer
function interval(a, b) 
{	
	return ((a < (b + 10)) && (a > (b - 10)));
}

function getRandomInt(min, max)			
{		
	return Math.floor(Math.random() * (max - min + 1)) + min;		
}

function getRandom(min, max)			
{		
	return Math.random() * (max - min) + min;		
}