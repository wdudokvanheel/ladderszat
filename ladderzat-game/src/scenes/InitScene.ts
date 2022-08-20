import {Scene} from 'phaser';
import Constants from '../assets/data/constants.yml'
import {ImageLoader} from '../loader/ImageLoader';

export class InitScene extends Scene {
	private images: ImageLoader;

	constructor() {
		super('init');
	}

	preload() {
		this.images = new ImageLoader(this.load, this.anims);
		this.images.loadImages();
		this.cameras.main.setBounds(0, 0, Constants.screen.width, Constants.screen.height);

		this.load.bitmapFont('main', '../assets/fonts/atari-classic.png', '../assets/fonts/atari-classic.xml');
		this.load.audio('lvl1-bg', ['../assets/audio/rarekwast.m4a', '../assets/audio/rarekwast.mp3']);
		this.load.audio('lvl2-bg', ['../assets/audio/rarekwast.m4a', '../assets/audio/rarekwast.mp3']);
		this.load.audio('lvl3-bg', ['../assets/audio/ladderszat.m4a', '../assets/audio/ladderszat.mp3']);
	}

	update(time: number, delta: number) {
		if (this.load.progress == 1) {
			this.images.generateAnimations();
			this.scene.start('gameplay')
			this.scene.launch('ui');
		}
	}
}
