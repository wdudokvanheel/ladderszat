import Constants from '../assets/data/constants.yml'
import images from "../assets/images/*/*.png";
import paintParticles from "../assets/images/particles/paint.json"
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

		this.loader.image('particle-plus', images['particles']['plus'])
		this.loader.image('particle-water', images['particles']['water'])
		this.loader.image('particle-power', images['particles']['power'])
		this.loader.image('particle-white', images['particles']['white'])
		this.loader.image('particle-pickup', images['particles']['pickup'])

		this.loader.image('background', images['ui']['background'])
		this.loader.spritesheet('coin', images['objects']['coin'], {frameWidth: 9, frameHeight: 10})
		this.loader.image('gameover', images['ui']['gameover'])
		this.loader.image('window', images['ui']['window'])
		this.loader.image('platform-factory', images['objects']['platform-factory'])
		this.loader.image('hang-light', images['objects']['hang-light'])
		this.loader.image('platform-studio', images['objects']['platform-studio'])
		this.loader.image('platform-danger', images['objects']['platform-danger'])
		this.loader.image('platform-wood-floor', images['objects']['platform-woodfloor'])
		this.loader.image('platform-bar', images['objects']['platform-bar'])
		this.loader.image('platform-barseats', images['objects']['platform-barseats'])
		this.loader.image('platform-carpet', images['objects']['platform-carpet'])
		this.loader.image('pipe-damage', images['objects']['pipe-damage'])
		this.loader.image('ladder-studio', images['objects']['ladder-studio'])
		this.loader.image('ladder-studio-head', images['objects']['ladder-studio-head'])
		this.loader.image('ladder-factory', images['objects']['ladder-factory'])
		this.loader.image('ladder-factory-head', images['objects']['ladder-factory-head'])
		this.loader.image('ladder-bar-head', images['objects']['ladder-bar-head'])
		this.loader.image('ladder-bar', images['objects']['ladder-bar'])
		this.loader.image('crate', images['objects']['crate'])
		this.loader.image('pipe', images['objects']['pipe'])
		this.loader.image('pen', images['objects']['pen'])
		this.loader.image('paper', images['objects']['paper'])
		this.loader.image('mic', images['objects']['mic'])
		this.loader.image('drums', images['objects']['drums'])
		this.loader.image('drums-shadow', images['objects']['drums-shadow'])
		this.loader.image('rhodes', images['objects']['rhodes'])
		this.loader.image('rhodes-shadow', images['objects']['rhodes-shadow'])
		this.loader.image('beams', images['objects']['beams'])
		this.loader.image('guitar-acoustic', images['objects']['guitar-acoustic'])
		this.loader.image('guitar-purple', images['objects']['guitar-purple'])
		this.loader.image('guitar-purple-shadow', images['objects']['guitar-purple-shadow'])
		this.loader.image('board', images['objects']['board'])
		this.loader.image('studio-desk', images['objects']['studio-desk'])
		this.loader.image('studio-desk-shadow', images['objects']['studio-desk-shadow'])
		this.loader.image('mic-stand', images['objects']['mic-stand'])
		this.loader.image('mic-shadow', images['objects']['mic-shadow'])
		this.loader.image('speakers', images['objects']['speakers'])
		this.loader.image('nm-logo', images['objects']['nm-logo'])
		this.loader.image('beams-double', images['objects']['beams-double'])
		this.loader.image('beams-triple', images['objects']['beams-triple'])
		this.loader.image('key', images['objects']['key'])
		this.loader.image('medpack', images['objects']['medpack'])
		this.loader.image('mixer', images['objects']['mixer'])
		this.loader.image('bucket-stack', images['objects']['bucket-stack'])
		this.loader.image('breaker-box', images['objects']['breaker-box'])
		this.loader.image('studio-ground', images['objects']['studio-ground'])
		this.loader.image('studio-ground-shadow', images['objects']['studio-ground-shadow'])

		this.loader.image('note', images['objects']['note'])
		this.loader.image('exit', images['objects']['exit'])
		this.loader.image('exit-shadow', images['objects']['exit-shadow'])
		this.loader.image('warning', images['objects']['warning'])
		this.loader.image('logo', images['ui']['logo'])
		this.loader.image('selector', images['ui']['selector']);
		this.loader.image('keyselector', images['ui']['keyselector']);
		this.loader.image('keyspace', images['ui']['keyspace']);
		this.loader.image('ladderzat-button', images['ui']['ladderzat-button']);
		this.loader.image('submit', images['ui']['submit']);
		this.loader.image('submit-disabled', images['ui']['submit-disabled']);
		this.loader.image('bg-level-1', images['bg']['level-1'])
		this.loader.image('bg-level-2', images['bg']['level-2'])
		this.loader.image('bg-level-3', images['bg']['level-3'])
		this.loader.spritesheet('button-jump', images['ui']['button-jump'], {frameWidth: 39, frameHeight: 42})
		this.loader.spritesheet('alarm', images['objects']['alarm'], {frameWidth: 3, frameHeight: 3})
		this.loader.spritesheet('breaker-box-wire', images['objects']['breaker-box-wire'], {frameWidth: 15, frameHeight: 8})
		this.loader.spritesheet('wire', images['objects']['wire'], {frameWidth: 23, frameHeight: 13})
		this.loader.spritesheet('water', images['objects']['water'], {frameWidth: 89, frameHeight: 5})

		this.loader.image('kris-idle', images['kris']['idle'])
		this.loader.spritesheet('kris-dead', images['kris']['dead'], {frameWidth: 21, frameHeight: 10})
		this.loader.spritesheet('kris-shocked', images['kris']['shocked'], {frameWidth: 20, frameHeight: 23})
		this.loader.spritesheet('kris-walk', images['kris']['walk'], {frameWidth: 13, frameHeight: 22});
		this.loader.spritesheet('kris-climb', images['kris']['climb'], {frameWidth: 11, frameHeight: 22});
		this.loader.spritesheet('koos', images['objects']['koos'], {frameWidth: 7, frameHeight: 23});

		this.loader.image('titlebg', images['ui']['titlebg']);
		this.loader.image('progress-base', images['ui']['progress-base']);
		this.loader.image('progress-start', images['ui']['progress-start']);
		this.loader.image('progress-part', images['ui']['progress-part']);
		this.loader.image('progress-end', images['ui']['progress-end']);

		this.loader.atlas('paint', images['particles']['paint'], paintParticles);

		this.loadCollectibles();
		this.loadBuckets();
	}

	private loadCollectibles(){
		Constants.object.drinks.forEach(drink =>{
			this.loader.image('collect-drink-' + drink, images['collectibles']['drink-' + drink])
		})
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
			key: 'koos-throw',
			frames: this.anims.generateFrameNumbers('koos', {start: 0, end: 1}),
			frameRate: 3,
			repeat: 0
		});

		this.anims.create({
			key: 'wire-on',
			frames: this.anims.generateFrameNumbers('wire', {start: 0, end: 2}),
			frameRate: 3,
		});

		this.anims.create({
			key: 'water',
			frames: this.anims.generateFrameNumbers('water', {start: 0, end: 9}),
			frameRate: 65,
			repeat: -1
		});

		this.anims.create({
			key: 'breaker-box-wire',
			frames: this.anims.generateFrameNumbers('breaker-box-wire', {start: 0, end: 3}),
			frameRate: 3,
			repeat: -1
		});

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
			key: 'kris-shocked',
			frames: this.anims.generateFrameNumbers('kris-shocked', {start: 0, end: 5}),
			frameRate: 16,
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
