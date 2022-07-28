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

		this.loader.image('background', images['ui']['background'])
		this.loader.image('gameover', images['ui']['gameover'])
		this.loader.image('window', images['ui']['window'])
		this.loader.image('platform', images['objects']['platform'])
		this.loader.image('platform-danger', images['objects']['platform-danger'])
		this.loader.image('ladder', images['objects']['ladder'])
		this.loader.image('exit', images['objects']['exit'])
		this.loader.image('logo', images['ui']['logo'])
		this.loader.image('bg-level-1', images['bg']['level-1'])
		this.loader.image('bg-level-2', images['bg']['level-2'])
		this.loader.spritesheet('button-jump', images['ui']['button-jump'], {frameWidth: 39, frameHeight: 42})

		this.loader.image('kris-idle', images['kris']['idle'])
		this.loader.spritesheet('kris-dead', images['kris']['dead'], {frameWidth: 21, frameHeight: 10})
		this.loader.spritesheet('kris-walk', images['kris']['walk'], {frameWidth: 13, frameHeight: 22});
		this.loader.spritesheet('kris-climb', images['kris']['climb'], {frameWidth: 11, frameHeight: 22});

		this.loadBuckets();
	}

	private loadBuckets() {
		for (let i = 0; i < Constants.gfx.bucket.colors.length; i++) {
			const color = Constants.gfx.bucket.colors[i];
			this.loader.spritesheet('bucket-' + color, images['objects']['bucket-' + color], {frameWidth: 7, frameHeight: 7});
		}
	}

	public generateAnimations() {
		this.anims.create({
			key: 'kris-climb',
			frames: this.anims.generateFrameNumbers('kris-climb', {start: 0, end: 1}),
			frameRate: 8,
			repeat: -1
		});

		this.anims.create({
			key: 'kris-dead',
			frames: this.anims.generateFrameNumbers('kris-dead', {start: 0, end: 9}),
			frameRate: 3,
			repeat: 0
		});

		this.anims.create({
			key: 'kris-walk',
			frames: this.anims.generateFrameNumbers('kris-walk', {start: 0, end: 3}),
			frameRate: 10,
			repeat: -1
		});

		for (let i = 0; i < Constants.gfx.bucket.colors.length; i++) {
			const color = Constants.gfx.bucket.colors[i];

			this.anims.create({
				key: 'bucket-' + color,
				frameRate: 15,
				frames: this.anims.generateFrameNumbers('bucket-' + color, {start: 0, end: 3}),
				repeat: -1
			});
		}
	}
}
