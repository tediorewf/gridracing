import GridScene from './scenes/grid-scene';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    pixelArt: true,
    backgroundColor: '#1a1a2d',
    scene: GridScene
};

export default new Phaser.Game(config);
