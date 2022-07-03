import Phaser from 'phaser'

import TestScene from './scenes/TestScene'

var config = {
	type: Phaser.AUTO,
	backgroundColor: '#221f1f',
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
		width: 192,
		height: 286,
		zoom: 2,
		pixelArt: true

	},
	scene: [TestScene]
};

export default new Phaser.Game(config)



