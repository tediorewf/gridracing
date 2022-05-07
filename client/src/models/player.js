import { tileWidth, tileHeight, xCenterOffset, yCenterOffset } from '../constants';

export default class Player {
    constructor(car, asset) {
        this.car = car;
        this.asset = asset;
    }

    move(x, y, angle) {
        this.car.move(x, y, angle);
        
        this.asset.x = tileWidth*this.car.x + xCenterOffset;
        this.asset.y = tileHeight*this.car.y + yCenterOffset;
        this.asset.angle = angle;
    }
}
