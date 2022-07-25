import Phaser from 'phaser';
import {GameOverScene} from './scenes/GameOverScene';
import {GameplayScene} from './scenes/GameplayScene';
import {InitScene} from './scenes/InitScene';
import {UIOverlayScene} from './scenes/UIOverlayScene';

export default {
	type: Phaser.AUTO,
	backgroundColor: '#221f1f',
	scale: {
		mode: Phaser.Scale.ScaleModes.FIT,
		autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
		parent: 'game',
		width: 160,
		height: 286,
		zoom: 2,
		pixelArt: true,
		antialias: false
	},
	dom: {
		createContainer: true
	},
	fps: {
		// target: 60,
		forceSetTimeOut: true
	},
	physics: {
		default: 'arcade',
		arcade: {
			fps: 144,
			gravity: {y: 500},
			debug: false
		}
	},
	scene: [InitScene, GameplayScene, UIOverlayScene, GameOverScene]
};
