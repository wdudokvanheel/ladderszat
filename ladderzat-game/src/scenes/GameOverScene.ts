import {Scene} from 'phaser';
import Constants from '../assets/data/constants.yml'
import {ImageLoader} from '../loader/ImageLoader';

export class GameOverScene extends Scene {
	private images: ImageLoader;

	constructor() {
		super('gameover');
	}

	preload() {

	}

	create(){
		this.add.sprite(0, 0, 'gameover').setOrigin(0, 0);
	}

	update(time: number, delta: number) {
		console.debug('GAME OVER');
	}
}
