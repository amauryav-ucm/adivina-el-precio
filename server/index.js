const csv = require('csv-parser');
const fs = require('fs');

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

const http = require('http').createServer();

const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

const io = require('socket.io')(server, {
    cors: { origin: '*' },
});

let lobbies = {};

io.on('connection', (socket) => {
    console.log('A new user has connected: ', socket.id);
    socket.on('message', (message) => {
        console.log(message);
    });

    socket.on('create-lobby', (obj, cb) => {
        console.log('Intentando crear un lobby');
        const _lobbyCode = createLobbyCode();
        lobbies[_lobbyCode] = {
            creator: null,
            lobbyCode: _lobbyCode,
            players: {},
            active: false,
            currentProduct: null,
        };
        cb(_lobbyCode);
    });

    socket.on('join-lobby', (obj, cb) => {
        if (obj.lobbyCode in lobbies) {
            cb(obj.lobbyCode);
        } else {
            cb(null);
        }
    });

    socket.on('joined-lobby', (obj, cb) => {
        if (!(obj.lobbyCode in lobbies)) {
            socket.emit('missing-lobby');
            return;
        }
        console.log('Recibido nuevo jugador');
        if(lobbies[obj.lobbyCode].creator === null){
          lobbies[obj.lobbyCode].creator = socket.id;
          socket.emit('give-controls');
        }

        lobbies[obj.lobbyCode].players[socket.id] = {
            name: obj.playerName,
            score: 0,
            lastGuess: 0,
        };
        socket.join(obj.lobbyCode);
        socket.to(obj.lobbyCode).emit('player-joined', {
            playerName: obj.playerName,
            players: lobbies[obj.lobbyCode].players,
        });
        cb({ players: lobbies[obj.lobbyCode].players });
    });

    socket.on('start-game', (obj) => {
        if (lobbies[obj.lobbyCode].active === true) return;
        lobbies[obj.lobbyCode].active = true;
        game(obj.lobbyCode, obj.totalRounds);
    });

    socket.on('send-guess', (obj) => {
        let _player = lobbies[obj.lobbyCode].players[socket.id];
        let _price = lobbies[obj.lobbyCode].currentProduct.precio;
        let _points = scoreGuess(obj.guess, _price);
        _player.lastGuess = obj.guess;
        _player.lastPoints = _points;
        _player.score += Number(_points);
        console.log(
            `Jugador ${_player.name} ha ganado ${_points} puntos adivinando ${obj.guess} cuando era ${_price}, ahora tiene ${_player.score} puntos`
        );
    });
});

function createLobbyCode() {
    return Math.random().toString(36).substring(3, 8).toUpperCase();
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function game(_lobbyCode, totalRounds) {
    await wait(1000);
    let round = 0;
    while (round < totalRounds) {
        round++;
        lobbies[_lobbyCode].currentProduct = getRandomProduct();
        io.to(_lobbyCode).emit('show-product', {
            product: lobbies[_lobbyCode].currentProduct,
        });
        await wait(10000);
        io.to(_lobbyCode).emit('time-finished');
        await wait(500);
        io.to(_lobbyCode).emit('show-round-result', {
            productPrice: lobbies[_lobbyCode].currentProduct.precio,
            players: lobbies[_lobbyCode].players,
        });
        await wait(3000);
    }
    io.to(_lobbyCode).emit('game-finished', {
      players: lobbies[_lobbyCode].players
    });

    await wait(5000);
    
    lobbies[_lobbyCode].active = false;

    io.to(lobbies[_lobbyCode].creator).emit('give-controls');
}

let products = [];

fs.createReadStream('products.csv')
    .pipe(csv())
    .on('data', (row) => {
        products.push(row);
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
    });

function getRandomProduct() {
    const randomIndex = Math.floor(Math.random() * products.length);
    return products[randomIndex];
}

function scoreGuess(guess, actual) {
    ratio =
        Math.abs(Number.parseFloat(guess) - Number.parseFloat(actual)) /
        Number.parseFloat(actual);
    if (ratio >= 1) return 0;
    return ((1.0 - ratio) * 1000).toFixed(0);
}
