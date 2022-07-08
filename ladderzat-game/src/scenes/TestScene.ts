import Phaser from 'phaser'
import {ImageLoader} from '../loader/ImageLoader';
import {PlatformLoader} from '../loader/PlatformLoader';

import Image = Phaser.GameObjects.Image;
import Vector2 = Phaser.Math.Vector2;

export default class TestScene extends Phaser.Scene {
	private WIDTH = 192;
	private HEIGHT = 276;
	private TOP_OFFSET = 10;
	private BUTTON_AREA = 60;

	private player;
	private ladders = undefined;
	horizontalDirectionTouch = undefined;
	verticalDirectionTouch = undefined;
	horizontalDirectionKeyboard = undefined;
	verticalDirectionKeyboard = undefined;
	onLadder = false;
	platformLoader = new PlatformLoader();

	constructor() {
		super('ladder-zat')
	}

	preload() {
		new ImageLoader(this.load).loadImages();
	}

	create() {
		this.addBackground();
		this.input.addPointer(2);

		// var rails = this.createRails();
		var rails = this.platformLoader.loadPlatforms(this.physics);

		this.createLadder(130, this.HEIGHT - this.BUTTON_AREA - 27, 5);

		this.player = this.createPlayer();

		this.physics.add.overlap(this.player, this.ladders, this.isOnLadder, null, this);

		this.physics.add.collider(this.player, rails);
		this.addUi();
	}

	update(time: number, delta: number) {
		if (this.horizontalDirectionTouch === 'left' || this.horizontalDirectionKeyboard === 'left')
			this.player.setVelocityX(-75);
		else if (this.horizontalDirectionTouch === 'right' || this.horizontalDirectionKeyboard === 'right')
			this.player.setVelocityX(75);


		if (this.horizontalDirectionTouch == undefined && this.horizontalDirectionKeyboard == undefined) {
			this.player.setVelocityX(0);
		}

		if (this.onLadder)
			this.player.setVelocityY(0);

		if (this.onLadder) {
			if (this.verticalDirectionTouch === 'up' || this.verticalDirectionKeyboard === 'up')
				this.player.setVelocityY(-75);
			else if (this.verticalDirectionTouch === 'down' || this.verticalDirectionKeyboard === 'down')
				this.player.setVelocityY(75);
		}

		if (!this.onLadder)
			this.player.body.setAllowGravity(true);
		this.onLadder = false;
	}

	createPlayer() {
		// var kris = this.addImage('kris-stand', 120, 100)
		const player = this.physics.add.sprite(86, -50, 'kris-stand');
		player.setBounce(0.1);
		player.setMaxVelocity(150);
		// player.setCollideWorldBounds(true);
		return player;
	}

	createLadder(x: number, y: number, segments: number = 1) {
		if (this.ladders == undefined) {
			this.ladders = this.physics.add.staticGroup();
		}
		for (let i = 0; i < segments; i++) {
			const ladder = this.ladders.create(x, y - (i * 10), 'ladder').setOrigin(0, 0);
			ladder.body.immovable = true;
			ladder.refreshBody();
		}
	}

	isOnLadder() {
		this.onLadder = true;
		this.player.body.setAllowGravity(false);
	}

	createRails() {
		const platforms = this.physics.add.staticGroup();

		for (let i = 0; i < 5; i++) {
			platforms.create((i * 50), (this.HEIGHT - this.BUTTON_AREA) - i, 'rail');
		}
		platforms.create(46, 105, 'rail');
		platforms.create(-4, 104, 'rail');

		platforms.create(130, 150, 'rail');
		platforms.create(180, 151, 'rail');

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
			btn.setName('button-dpad-' + (i % 2 == 0 ? '-vertical-' : 'horizontal') + directions[i]);
			btn['dirName'] = directions[i];
			btn.on('gameobjectover', function (pointer, gameObject) {
				console.log(btn.name)
			});
		}

		var game = this;
		this.input.on('gameobjectover', function (pointer, gameObject) {
			if (gameObject && gameObject.name && gameObject.name.startsWith("button-dpad-")) {
				gameObject.setFrame(1);
				if (gameObject.name.startsWith("button-dpad-horizontal")) {
					game.horizontalDirectionTouch = gameObject.dirName;
				} else
					game.verticalDirectionTouch = gameObject.dirName
			}
		});

		this.input.on('gameobjectout', function (pointer, gameObject) {
			if (gameObject && gameObject.name && gameObject.name.startsWith("button-dpad-")) {
				gameObject.setFrame(0);

				if (game.horizontalDirectionTouch === gameObject.dirName)
					game.horizontalDirectionTouch = undefined;
				if (game.verticalDirectionTouch === gameObject.dirName)
					game.verticalDirectionTouch = undefined;
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
			switch (event.keyCode) {
				case Phaser.Input.Keyboard.KeyCodes.A:
				case Phaser.Input.Keyboard.KeyCodes.J:
				case Phaser.Input.Keyboard.KeyCodes.LEFT:
				case Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR:
					game.horizontalDirectionKeyboard = 'left';
					break;
				case Phaser.Input.Keyboard.KeyCodes.D:
				case Phaser.Input.Keyboard.KeyCodes.L:
				case Phaser.Input.Keyboard.KeyCodes.RIGHT:
				case Phaser.Input.Keyboard.KeyCodes.NUMPAD_SIX:
					game.horizontalDirectionKeyboard = 'right'
					break;
				case Phaser.Input.Keyboard.KeyCodes.W:
				case Phaser.Input.Keyboard.KeyCodes.I:
				case Phaser.Input.Keyboard.KeyCodes.UP:
				case Phaser.Input.Keyboard.KeyCodes.NUMPAD_EIGHT:
					game.verticalDirectionKeyboard = 'up';
					break;
				case Phaser.Input.Keyboard.KeyCodes.S:
				case Phaser.Input.Keyboard.KeyCodes.K:
				case Phaser.Input.Keyboard.KeyCodes.DOWN:
				case Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO:
					game.verticalDirectionKeyboard = 'down';
					break;
			}
		});

		this.input.keyboard.on('keyup', function (event) {
			switch (event.keyCode) {
				case Phaser.Input.Keyboard.KeyCodes.A:
				case Phaser.Input.Keyboard.KeyCodes.J:
				case Phaser.Input.Keyboard.KeyCodes.LEFT:
				case Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR:
					if (game.horizontalDirectionKeyboard === 'left')
						game.horizontalDirectionKeyboard = undefined;
					break;
				case Phaser.Input.Keyboard.KeyCodes.D:
				case Phaser.Input.Keyboard.KeyCodes.L:
				case Phaser.Input.Keyboard.KeyCodes.RIGHT:
				case Phaser.Input.Keyboard.KeyCodes.NUMPAD_SIX:
					if (game.horizontalDirectionKeyboard === 'right')
						game.horizontalDirectionKeyboard = undefined;
					break;
				case Phaser.Input.Keyboard.KeyCodes.W:
				case Phaser.Input.Keyboard.KeyCodes.I:
				case Phaser.Input.Keyboard.KeyCodes.UP:
				case Phaser.Input.Keyboard.KeyCodes.NUMPAD_EIGHT:
					if (game.verticalDirectionKeyboard === 'up')
						game.verticalDirectionKeyboard = undefined;
					break;
				case Phaser.Input.Keyboard.KeyCodes.S:
				case Phaser.Input.Keyboard.KeyCodes.K:
				case Phaser.Input.Keyboard.KeyCodes.DOWN:
				case Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO:
					if (game.verticalDirectionKeyboard === 'down')
						game.verticalDirectionKeyboard = undefined;
					break;
			}

			if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.A && game.horizontalDirectionKeyboard === 'left') {
				game.horizontalDirectionKeyboard = undefined;
			} else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.D && game.horizontalDirectionKeyboard === 'right') {
				game.horizontalDirectionKeyboard = undefined;
			}
		});
	}
}
