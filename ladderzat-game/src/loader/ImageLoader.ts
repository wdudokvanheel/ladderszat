import Constants from '../assets/data/constants.yml'
import images from "../assets/images/*/*.png";
import AnimationManager = Phaser.Animations.AnimationManager;

import LoaderPlugin = Phaser.Loader.LoaderPlugin;

export class ImageLoader {
	loader: LoaderPlugin;
	anims: AnimationManager;

	constructor(loader: Phaser.Loader.LoaderPlugin, anims: AnimationManager) {
		this.loader = loader;
		this.anims = anims;
	}

	public loadImages() {
		this.loader.spritesheet('button-dpad-up', images['ui']['button-dpad-up'], {frameWidth: 17, frameHeight: 16});
		this.loader.spritesheet('button-dpad-right', images['ui']['button-dpad-right'], {frameWidth: 15, frameHeight: 18});
		this.loader.spritesheet('button-dpad-down', images['ui']['button-dpad-down'], {frameWidth: 17, frameHeight: 16});
		this.loader.spritesheet('button-dpad-left', images['ui']['button-dpad-left'], {frameWidth: 15, frameHeight: 18});
		this.loadBuckets();

		this.loader.image('background', images['ui']['background'])
		this.loader.image('rail', images['objects']['rail'])
		this.loader.image('ladder', images['objects']['ladder'])
		this.loader.image('kris-stand', images['kris']['stand'])
		this.loader.spritesheet('button-jump', images['ui']['button-jump'], {frameWidth: 39, frameHeight: 42})

	}

	private loadBuckets() {
		for (let i = 0; i < Constants.gfx.bucket.colors.length; i++) {
			const color = Constants.gfx.bucket.colors[i];
			this.loader.spritesheet('bucket-' + color, images['objects']['bucket-' + color], {frameWidth: 9, frameHeight: 9});
		}
	}

	public generateAnimations() {
		for (let i = 0; i < Constants.gfx.bucket.colors.length; i++) {
			const color = Constants.gfx.bucket.colors[i];

			this.anims.create({
				key: 'roll-' + color,
				frameRate: 15,
				frames: this.anims.generateFrameNumbers('bucket-' + color, {start: 0, end: 1}),
				repeat: -1
			});
		}
	}
}
