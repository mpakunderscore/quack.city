let express = require('express');
let path = require('path');

let app = express();

//STATIC WEB
app.use(express.static(path.join(__dirname, 'web')));

let server = require('http').Server(app);

let io = require('socket.io')(server);

const socketPort = process.env.PORT || 3000;

let map;

exports.run = function (global) {

    map = global;

    server.listen(socketPort, () => console.log('socket listening on: ' + socketPort));

    io.on('connection', (socket) => {

        console.log('connect: ' + socket.id);

        // console.log(map);

        socket.emit('map', JSON.stringify(map));

        socket.on('sound', (message) => receiveSound(socket, message));
        socket.on('location', (region) => receiveLocation(socket, region));
        socket.on('image', (name) => receiveImage(socket, name));
        socket.on('disconnect', () => removeUser(socket));
    });
};

function receiveSound(socket, message) {

    console.log('sound from: ' + socket.id + ' ' + message);

    socket.broadcast.emit('sound', '');
}

function receiveLocation(socket, user) {

    console.log('location ' + JSON.stringify(user) + ' from: ' + socket.id);

    user = JSON.parse(user);

    user.id = socket.id;

    user.time = new Date().getTime();

    map.users[user.id] = user;

    socket.broadcast.emit('location', JSON.stringify(user));
}

function receiveImage(socket, user) {

    console.log('image ' + JSON.stringify(user) + ' from: ' + socket.id);

    user = JSON.parse(user);

    user.id = socket.id;

    user.time = new Date().getTime();

    // map.users[user.id].name = user.name;

    socket.broadcast.emit('image', JSON.stringify(user));
}

function removeUser(socket) {

    console.log('disconnected: ' + socket.id);

    delete map.users[socket.id];

    socket.broadcast.emit('disconnected', socket.id);
}