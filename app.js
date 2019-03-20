const express   = require('express');
const app       = express();
const http      = require('http');
const server    = http.createServer(app);
const socketIO  = require('socket.io')(server); //hello I am new

const LISTEN_PORT = 8080; //make sure greater than 3000. Some ports are reserved/blocked by firewall ...

app.use((express.static(__dirname + '/public'))); //set root dir to the public folder

let contollerTurn = true;
const colours = {
    red: {r:255, g:91, b:91},
    green: {r:153, g:255, b:153},
    blue: {r:135, g:206, b:250},
    yellow: {r:255, g:255, b:102},
    pink: {r:255, g:182, b:193}
}

let players = {};
let scores = {};

//routes
app.get('/pattern', function(req,res) {
    res.sendFile(__dirname + '/public/Collaberative/pattern.html');
});

app.get('/controller', function(req,res) {
    res.sendFile(__dirname + '/public/Collaberative/controller.html');
});

app.get('/click', function(req,res) {
    res.sendFile(__dirname + '/public/Competitive/click.html');
});

//websocket stuff
socketIO.on('connection', function(socket) {
    console.log(socket.id + ' has connected!');
    console.log(players);
    players[socket.id] = false;

    socket.on('disconnect', function(data) {
        console.log(socket.id + ' has disconnected');
        delete players[socket.id];
    });

    socket.on('colour_send', function(data) {
        console.log('data');
        socketIO.sockets.emit('color_change', {colour: colours[data], key:data});
    });

    socket.on('controller_done', function(data) {
        controllerTurn = false;
        socketIO.sockets.emit('pattern_start');
    });

    socket.on('pattern_complete', function(data) {
        controllerTurn = true;
        socketIO.sockets.emit('controller_start', true);
    });

    socket.on('pattern_failed', function(data) {
        controllerTurn = true;
        socketIO.sockets.emit('controller_start', false);
    });

    socket.on('player_ready', function(data) {
        console.log(socket.id + "is ready");
        players[socket.id] = true;

        startGame();
    });

    socket.on('score', (data) => {
        scores[socket.id] = data;
        console.log('got score ' + Object.keys(scores).length + " " + Object.keys(players).length);

        
        if (Object.keys(scores).length === Object.keys(players).length) {
            let winner = '';
            let max = 0;

            const list = Object.keys(scores);

            list.forEach(player => {
                if (scores[player] > max) {
                    max = scores[player];
                    winner = player;
                }
            });

            list.forEach(player => {
                socketIO.to(player).emit('results', winner === player);
            });

            players = {};
            scores = {};
        }
    });
});

function startGame() {
    let allReady = true;

    const list = Object.keys(players);
    list.forEach(player => {
        allReady = players[player];
    });

    console.log("Checking allReady: " + allReady + " length: " + list.length);
    if (!allReady || list.length < 2) return;

    socketIO.sockets.emit('start');
    console.log('Starting game!');

    setTimeout(endGame, 10000);
}

function endGame() {
    socketIO.sockets.emit('stop');
    console.log('stoping game');

    const list = Object.keys(players);
    list.forEach(player => {
        players[player] = false;
    });

}

//finally, start server
server.listen(LISTEN_PORT);
console.log('listening to port: ' + LISTEN_PORT);
