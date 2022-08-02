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
		this.loader.spritesheet('coin', images['objects']['coin'], {frameWidth: 9, frameHeight: 10})
		this.loader.image('gameover', images['ui']['gameover'])
		this.loader.image('window', images['ui']['window'])
		this.loader.image('platform-factory', images['objects']['platform-factory'])
		this.loader.image('hang-light', images['objects']['hang-light'])
		this.loader.image('platform-studio', images['objects']['platform-studio'])
		this.loader.image('platform-danger', images['objects']['platform-danger'])
		this.loader.image('platform-wood-floor', images['objects']['platform-woodfloor'])
		this.loader.image('ladder-studio', images['objects']['ladder-studio'])
		this.loader.image('ladder-studio-head', images['objects']['ladder-studio-head'])
		this.loader.image('ladder-factory', images['objects']['ladder-factory'])
		this.loader.image('ladder-factory-head', images['objects']['ladder-factory-head'])
		this.loader.image('crate', images['objects']['crate'])
		this.loader.image('mic', images['objects']['mic'])
		this.loader.image('beams', images['objects']['beams'])
		this.loader.image('beams-double', images['objects']['beams-double'])
		this.loader.image('beams-triple', images['objects']['beams-triple'])
		this.loader.image('key', images['objects']['key'])
		this.loader.image('mixer', images['objects']['mixer'])
		this.loader.image('bucket-stack', images['objects']['bucket-stack'])

		this.loader.image('exit', images['objects']['exit'])
		this.loader.image('logo', images['ui']['logo'])
		this.loader.image('bg-level-1', images['bg']['level-1'])
		this.loader.image('bg-level-2', images['bg']['level-2'])
		this.loader.spritesheet('button-jump', images['ui']['button-jump'], {frameWidth: 39, frameHeight: 42})
		this.loader.spritesheet('alarm', images['objects']['alarm'], {frameWidth: 3, frameHeight: 3})


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
			this.loader.spritesheet('mixer-' + color, images['objects']['mixer-' + color], {frameWidth: 17, frameHeight: 25});
			this.loader.image('static-bucket-' + color, images['objects']['static-bucket-' + color]);
		}
	}

	public generateAnimations() {
		this.anims.create({
			key: 'coin',
			frames: this.anims.generateFrameNumbers('coin', {start: 0, end: 5}),
			frameRate: 7,
			repeat: -1
		});

		this.anims.create({
			key: 'alarm',
			frames: this.anims.generateFrameNumbers('alarm', {start: 0, end: 3}),
			frameRate: 5,
			repeat: -1
		});

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
				key: 'mixer-' + color,
				frameRate: 60,
				frames: this.anims.generateFrameNumbers('mixer-' + color, {start: 0, end: 3}),
				repeat: -1
			});

			this.anims.create({
				key: 'bucket-' + color,
				frameRate: 30,
				frames: this.anims.generateFrameNumbers('bucket-' + color, {start: 0, end: 3}),
				repeat: -1
			});
		}
	}
}
