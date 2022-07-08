import {Scene} from 'phaser';
import {ImageLoader} from '../loader/ImageLoader';
import {PlatformLoader} from '../loader/PlatformLoader';

export class InitScene extends Scene {
	private images: ImageLoader;

	constructor() {
		super('init');
	}

	preload() {
		this.images = new ImageLoader(this.load);
		this.images.loadImages();
		this.cameras.main.setBounds(0, 0, 192, 1024);
	}

	update(time: number, delta: number) {
		if(this.load.progress == 1){
			this.scene.start('gameplay')
			this.scene.launch('ui');
		}
	}
}
