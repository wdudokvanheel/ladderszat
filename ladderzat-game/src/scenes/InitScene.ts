import {Scene} from 'phaser';
import Constants from '../assets/data/constants.yml'
import {ImageLoader} from '../loader/ImageLoader';

export class InitScene extends Scene {
	private images: ImageLoader;

	constructor() {
		super('init');
	}

	preload() {
		this.images = new ImageLoader(this.load);
		this.images.loadImages();
		this.cameras.main.setBounds(0, 0, Constants.screen.width, Constants.screen.height);
	}

	update(time: number, delta: number) {
		if(this.load.progress == 1){
			this.scene.start('gameplay')
			this.scene.launch('ui');
		}
	}
}
