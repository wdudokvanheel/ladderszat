import Phaser from 'phaser'
import {GameplayScene} from './scenes/GameplayScene';
import {InitScene} from './scenes/InitScene';
import {UIScene} from './scenes/UIScene';

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
	fps: {
		// target: 60,
		forceSetTimeOut: true
	},
	physics: {
		default: 'arcade',
		arcade: {
			fps: 144	,
			gravity: { y: 500 },
			debug: false
		}
	},
	scene: [InitScene, GameplayScene, UIScene]
};

export default new Phaser.Game(config)



