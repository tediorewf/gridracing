import Phaser from 'phaser';
import io from 'socket.io-client';

import Car from '../models/car';
import Player from '../models/player';
import { 
    tileWidth, tileHeight, xCenterOffset, yCenterOffset,
    angleLeft, angleRight, angleUp, angleDown 
} from '../constants';

export default class GridScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Grid' });
    }

    alertCantMove(direction) {
        alert(`Blocked, you can\'t move ${direction}!`);
    }

    preload() {
        this.load.image('tiles', 'assets/tilemaps/tiles/drawtiles-spaced.png');
        this.load.image('car', 'assets/sprites/car90.png');
        this.load.tilemapCSV('map', 'assets/tilemaps/csv/grid.csv');
    }
    
    create() {
        const map = this.make.tilemap({ key: 'map', tileWidth: tileWidth, tileHeight: tileHeight });
        const tileset = map.addTilesetImage('tiles', null, tileWidth, tileHeight, 1, 2);
        const layer = map.createLayer(0, tileset, 0, 0);

        this.players = new Map();

        const self = this;

        const server_uri = 'http://127.0.0.1:3000';
        this.socket = io(server_uri);

        this.me = null;
        this.myId = null;

        this.socket.on('setId', () => {
            self.myId = self.socket.id;
        });

        this.socket.on('connect_error', (err) => {
            alert(`Connection error occured: ${err.message}`);
            self.players.forEach((player, _id) => {
                player.asset.destroy();
            });
            self.players.clear();
        });

        this.socket.on('hasReachedFinish', (id) => {
            const message = self.myId === id ? 'You have FINISHED the race!' : 'You have LOST the race :(';
            alert(message)
        });

        this.socket.on('spawnCar', (id, x, y, angle) => {
            let asset = self.add.image(
                tileWidth*x + xCenterOffset, 
                tileHeight*y + yCenterOffset, 
                'car'
            );
            asset.angle = angle;
            let car = new Car(x, y, angle);
            let player = new Player(car, asset);
            self.players.set(id, player);

            if (self.myId === id) {
                self.me = player;
            }
        });

        this.socket.on('moveCar', (id, x, y, angle) => {
            let player = self.players.get(id);
            player.move(x, y, angle);
        });

        this.socket.on('killCar', (id) => {
          let player = self.players.get(id);
          self.players.delete(id);
          player.asset.destroy();
        });
  
        // Left
        this.input.keyboard.on('keydown-A', (_event) => {
            let player = self.me;
            let tile = layer.getTileAtWorldXY(player.asset.x - tileWidth, player.asset.y, true)
    
            if (tile.index === 2) {
                this.alertCantMove('LEFT');
            } else {
                let xToMove = player.car.x - 1;
                let yToMove = player.car.y;
                self.socket.emit('moveCar', xToMove, yToMove, angleLeft);
            }
        });
    
        // Right
        this.input.keyboard.on('keydown-D', (_event) => {
            let player = self.me;
            let tile = layer.getTileAtWorldXY(player.asset.x + tileWidth, player.asset.y, true)
    
            if (tile.index === 2) {
                this.alertCantMove('RIGHT');
            } else {
                let xToMove = player.car.x + 1;
                let yToMove = player.car.y;
                self.socket.emit('moveCar', xToMove, yToMove, angleRight);
            }
        });
    
        // Up
        this.input.keyboard.on('keydown-W', (_event) => {
            let player = self.me;
            let tile = layer.getTileAtWorldXY(player.asset.x, player.asset.y - tileHeight, true)
    
            if (tile.index === 2) {
                this.alertCantMove('UP');
            } else {
                let xToMove = player.car.x;
                let yToMove = player.car.y - 1;
                self.socket.emit('moveCar', xToMove, yToMove, angleUp);
            }
        });
    
        // Down
        this.input.keyboard.on('keydown-S', (_event) => {
            let player = self.me;
            let tile = layer.getTileAtWorldXY(player.asset.x, player.asset.y + tileHeight, true)
    
            if (tile.index === 2) {
                this.alertCantMove('DOWN');
            } else {
                let xToMove = player.car.x;
                let yToMove = player.car.y + 1;
                self.socket.emit('moveCar', xToMove, yToMove, angleDown);
            }
        });
    }
}
