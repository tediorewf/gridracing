#!/usr/bin/env node
import { createServer } from 'http';
import { Server } from 'socket.io';

const xDefault = 1,
      yDefault = 1,
      angleDefault = 0;

const xFinishPos = 23, yFinishPos = 16;

class Car {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
    }

    move(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
    }

    hasReachedFinish() {
        const hasReachedXFinishPos = this.x === xFinishPos;
        const hasReachedYFinishPos = this.y === yFinishPos;
        const hasFinished = hasReachedXFinishPos && hasReachedYFinishPos;
        return hasFinished;
    }

    static spawn() {
        let spawned = new Car(xDefault, yDefault, angleDefault);
        return spawned;
    }
}

let cars = new Map();

const httpServer = createServer();
const serverConfig = {
    cors: {
        origin: '*'
    }
};
const io = new Server(httpServer, serverConfig);

io.on('connection', (socket) => {
    console.log(`Client has connected: ${socket.id}`);

    socket.emit('setId');

    cars.forEach((car, id) => {
        console.log(`Transmit car for client ${id}: x=${car.x}, y=${car.y}, angle=${car.angle}`);
        socket.emit('spawnCar', id, car.x, car.y, car.angle);
    });

    let car = Car.spawn();
    cars.set(socket.id, car);
    console.log(`Spawned car for client ${socket.id}: x=${car.x}, y=${car.y}, angle=${car.angle}`);
    io.emit('spawnCar', socket.id, car.x, car.y, car.angle);

    socket.on('moveCar', (x, y, angle) => {
        let car = cars.get(socket.id);
        car.move(x, y, angle);
        console.log(`Client ${socket.id} has moved his car: x=${x}, y=${y}, angle=${angle}`);
        io.emit('moveCar', socket.id, x, y, angle);
        if (car.hasReachedFinish()) {
            io.emit('hasReachedFinish', (socket.id));
        }
    });

    socket.on('disconnect', (reason) => {
        console.log(`Client ${socket.id} has disconnected: ${reason}`);
        cars.delete(socket.id);
        io.emit('killCar', socket.id);
    });
});

const port = 3000;
httpServer.listen(port, () => {
    console.log('Server has started!');
});
