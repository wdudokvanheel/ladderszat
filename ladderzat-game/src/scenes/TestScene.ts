import Phaser from 'phaser'
import images from '../assets/images/*/*.png'
import Image = Phaser.GameObjects.Image;
import Vector2 = Phaser.Math.Vector2;

export default class TestScene extends Phaser.Scene {
	private WIDTH = 192;
	private HEIGHT = 276;
	private TOP_OFFSET = 10;
	private BUTTON_AREA = 60;

	private player;
	touchDirection = undefined;
	keyDirection = undefined;

	constructor() {
		super('ladder-zat')
	}

	preload() {
		this.load.spritesheet('button-dpad-up', images['ui']['button-dpad-up'], {frameWidth: 17, frameHeight: 16});
		this.load.spritesheet('button-dpad-right', images['ui']['button-dpad-right'], {frameWidth: 15, frameHeight: 18});
		this.load.spritesheet('button-dpad-down', images['ui']['button-dpad-down'], {frameWidth: 17, frameHeight: 16});
		this.load.spritesheet('button-dpad-left', images['ui']['button-dpad-left'], {frameWidth: 15, frameHeight: 18});
		this.load.image('background', images['ui']['background'])
		this.load.image('rail', images['objects']['rail'])
		this.load.image('ladder', images['objects']['ladder'])
		this.load.image('kris-stand', images['kris']['stand'])
		this.load.spritesheet('button-jump', images['ui']['button-jump'], {frameWidth: 39, frameHeight: 42})
	}

	create() {
		this.addBackground();
		this.input.addPointer(4);

		var rails = this.createRails();
		this.player = this.createPlayer();

		this.physics.add.collider(this.player, rails);
		this.addUi();
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		if (this.touchDirection === 'left') {
			this.player.setVelocityX(-75);
		} else if (this.touchDirection === 'right') {
			this.player.setVelocityX(75);
		}

		if (this.keyDirection === 'left') {
			this.player.setVelocityX(-75);
		} else if (this.keyDirection === 'right') {
			this.player.setVelocityX(75);
		}

		if (this.keyDirection == undefined && this.touchDirection == undefined) {
			this.player.setVelocityX(0);
		}
	}

	createPlayer() {
		// var kris = this.addImage('kris-stand', 120, 100)
		const player = this.physics.add.sprite(86, -50, 'kris-stand');
		player.setBounce(0.1);
		player.setMaxVelocity(150);
		// player.setCollideWorldBounds(true);
		return player;
	}

	createRails() {
		const platforms = this.physics.add.staticGroup();

		for (let i = 0; i < 5; i++) {
			platforms.create((i * 50), this.HEIGHT - this.BUTTON_AREA - i, 'rail');
		}
		platforms.create(46, 105, 'rail');
		platforms.create(-4, 104, 'rail');

		platforms.create(130, 150, 'rail');
		platforms.create(180, 151, 'rail');

		this.add.image(130, this.HEIGHT - this.BUTTON_AREA - 7, 'ladder').setOrigin(0, 1);
		this.add.image(130, this.HEIGHT - this.BUTTON_AREA - 17, 'ladder').setOrigin(0, 1);
		this.add.image(130, this.HEIGHT - this.BUTTON_AREA - 27, 'ladder').setOrigin(0, 1);
		this.add.image(130, this.HEIGHT - this.BUTTON_AREA - 37, 'ladder').setOrigin(0, 1);
		this.add.image(130, this.HEIGHT - this.BUTTON_AREA - 42, 'ladder').setOrigin(0, 1);


		platforms.create(this.WIDTH - 45, 40, 'rail');
		this.add.image(46, 105 - 4, 'ladder').setOrigin(0, 1);
		this.add.image(46, 105
			- 4 - 20, 'ladder').setOrigin(0, 1);

		this.add.image(8, this.HEIGHT - this.BUTTON_AREA - 4, 'ladder').setOrigin(0, 1);
		this.add.image(8, this.HEIGHT - this.BUTTON_AREA - 14, 'ladder').setOrigin(0, 1);

		return platforms;
	}

	addImage(name: string, x: number, y: number): Image {
		const image = this.add.image(x, y + this.TOP_OFFSET, name);
		image.setOrigin(0, 0);
		return image;
	}

	addBackground() {
		// this.addImage('bg', this.WINDOW_SIZE.x / 2, this.WINDOW_SIZE.y / 2);
		var bg = this.addImage('background', 0, 0);
		bg.setOrigin(0, 0);
	}

	addUi() {
		var directions = ["up", "right", "down", "left"];
		var buttonPos = [
			new Vector2(29, 6),
			new Vector2(48, 24),
			new Vector2(29, 41),
			new Vector2(12, 24)
		];

		for (let i = 0; i < directions.length; i++) {
			var btn = this.addImage('button-dpad-' + directions[i], buttonPos[i].x, this.HEIGHT + this.TOP_OFFSET - this.BUTTON_AREA + buttonPos[i].y).setOrigin(0, 1);
			btn.setInteractive()
			btn.setName('button-dpad-' + directions[i]);
			btn['dirName'] = directions[i];
			btn.on('gameobjectover', function (pointer, gameObject) {
				console.log(btn.name)
			});
		}

		var game = this;
		this.input.on('gameobjectover', function (pointer, gameObject) {
			if (gameObject && gameObject.name && gameObject.name.startsWith("button-dpad")) {
				gameObject.setFrame(1);
				game.touchDirection = gameObject.dirName;
			}
		});

		this.input.on('gameobjectout', function (pointer, gameObject) {
			if (gameObject && gameObject.name && gameObject.name.startsWith("button-dpad")) {
				if (game.touchDirection === gameObject.dirName)
					game.touchDirection = undefined;
				gameObject.setFrame(0);
			}
		});

		const p = this.player;
		const jump = this.add.sprite(this.WIDTH - 12, this.HEIGHT + this.TOP_OFFSET - 12, 'button-jump')
			.setOrigin(1, 1)
			.setInteractive()
			.setName('button-jump');

		jump.on('pointerdown', function () {
			this.setFrame(1);
			if (p.body.touching.down)
				p.setVelocityY(-150);
		});
		jump.on('pointerup', function () {
			this.setFrame(0);
		});
		jump.on('pointerout', function () {
			this.setFrame(0);
		});

		this.input.keyboard.on('keydown-SPACE', function (event) {
			event.stopPropagation();
			if (p.body.touching.down)
				p.setVelocityY(-150);
		});

		this.input.keyboard.on('keydown', function (event) {
			if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.A) {
				game.keyDirection = 'left';
			}
			else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.D) {
				game.keyDirection = 'right';
			}
		});

		this.input.keyboard.on('keyup', function (event) {
			if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.A && game.keyDirection === 'left') {
				game.keyDirection = undefined;
			}
			else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.D && game.keyDirection === 'right') {
				game.keyDirection = undefined;
			}
		});
	}
}
