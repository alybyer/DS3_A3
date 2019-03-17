const express   = require('express');
const app       = express();
const http      = require('http');
const server    = http.createServer(app);
const socketIO  = require('socket.io')(server); //hello I am new

const LISTEN_PORT = 8080; //make sure greater than 3000. Some ports are reserved/blocked by firewall ...

app.use((express.static(__dirname + '/public'))); //set root dir to the public folder

//routes
app.get('/pattern', function(req,res) {
    res.sendFile(__dirname + '/public/Collaberative/pattern.html');
});

app.get('/controller', function(req,res) {
    res.sendFile(__dirname + '/public/Collaberative/controller.html');
});

//websocket stuff
socketIO.on('connection', function(socket) {
    console.log(socket.id + ' has connected!');

    socket.on('disconnect', function(data) {
        console.log(socket.id + ' has disconnected');
    });

    //custom events
    //socket = one client
    //socketIO.sockets = all clients
    socket.on('red', function(data) {
        console.log('red event heard');
        socketIO.sockets.emit('color_change', {r:255, g:91, b:91});
    });

    socket.on('green', function(data) {
        console.log('green event heard');
        socketIO.sockets.emit('color_change', {r:153, g:255, b:153});
    });

    socket.on('blue', function(data) {
        console.log('blue event heard');
        socketIO.sockets.emit('color_change', {r:135, g:206, b:250});
    });

    socket.on('yellow', function(data) {
        console.log('yellow event heard');
        socketIO.sockets.emit('color_change', {r:255, g:255, b:102});
    });

    socket.on('pink', function(data) {
        console.log('pink event heard');
        socketIO.sockets.emit('color_change', {r:255, g:182, b:193});
    });
});

//finally, start server
server.listen(LISTEN_PORT);
console.log('listening to port: ' + LISTEN_PORT);