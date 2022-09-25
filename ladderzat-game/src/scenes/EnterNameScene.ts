import {Scene} from 'phaser';
import Constants from '../assets/data/constants.yml';
import GameContext from '../model/GameContext';
import {HighscoreScene} from './HighscoreScene';
import BitmapText = Phaser.GameObjects.BitmapText;

export class EnterNameScene extends Scene {
	private readonly context: GameContext;
	private index = 0;
	private selectorUp;
	private selectorDown;
	private name = [];
	private nameBitmaps = [];
	private inputTimer = 0;

	private submitBtn;
	private submitDisabled;

	constructor() {
		super('entername');
	}

	create() {
		let _this = this;

		this.add.sprite(0, 17, 'gameover').setOrigin(0, 0);
		this.submitBtn = this.add.sprite(0, 192, 'submit').setOrigin(0, 0);
		this.submitDisabled = this.add.sprite(0, 192, 'submit-disabled').setOrigin(0, 0);
		this.submitDisabled.setPosition((Constants.screen.width - this.submitDisabled.width) / 2, this.submitDisabled.y);

		this.submitBtn.setPosition((Constants.screen.width - this.submitBtn.width) / 2, this.submitBtn.y);
		this.submitBtn.setInteractive();
		this.submitBtn.on('pointerdown', function () {
			_this.context.gameplay.events.emit('selector');
			_this.submit();
		});
		this.renderTextCenter('Highscore', 48, '#ad2537', 14);
		this.renderTextCenter('Score', 80, '#dedede', 8);
		this.renderTextCenter('' + this.context.score, 92, '#601de7', 14);

		this.renderTextCenter('Enter your name', 120, '#dedede', 8);
		this.renderTextCenter('SUBMIT', 196, '#dedede', 8);

		this.input.keyboard.on('keydown', function (e) {
			if (e.keyCode >= 65 && e.keyCode <= 90) {
				_this.name[_this.index] = e.key.toUpperCase();
				if (_this.index < _this.name.length - 1)
					_this.nextChar();
			} else if (e.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE) {
				_this.name[_this.index] = ' ';
				if (_this.index < _this.name.length - 1)
					_this.nextChar();
			} else if (e.keyCode === Phaser.Input.Keyboard.KeyCodes.BACKSPACE) {
				if (_this.name[_this.index] === ' ' && _this.index > 0)
					_this.prevChar();
				else
					_this.name[_this.index] = ' ';
			} else if (e.keyCode === Phaser.Input.Keyboard.KeyCodes.DELETE) {
				_this.name[_this.index] = ' ';
			} else if (e.keyCode === Phaser.Input.Keyboard.KeyCodes.DOWN)
				_this.charDown();
			else if (e.keyCode === Phaser.Input.Keyboard.KeyCodes.UP)
				_this.charUp();
			else if (e.keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT)
				_this.prevChar();
			else if (e.keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT)
				_this.nextChar();
			else if (e.keyCode === Phaser.Input.Keyboard.KeyCodes.ENTER)
				_this.submit();
		});

		for (let i = 0; i < 8; i++) {
			this.add.sprite(26 + i * 15, 164, 'keyspace').setOrigin(0, 0);
			this.nameBitmaps.push(this.add.bitmapText(26 + i * 15, 139+24, 'main', 'X', 10).setOrigin(0, 1));
			this.name.push(' ');
		}

		this.selectorUp = this.add.sprite(-100, 100, 'keyselector').setOrigin(0, 0);
		this.selectorUp.setFlipY(true);
		this.selectorUp.setInteractive();
		this.selectorUp.on('pointerdown', function() {
			_this.charUp();
		});
		this.selectorDown = this.add.sprite(-100, 100, 'keyselector').setOrigin(0, 0);
		this.selectorDown.setInteractive();
		this.selectorDown.on('pointerdown', function() {
			_this.charDown();
		});

		this.context.input.ignoreKeyboard = true;
	}

	renderTextCenter(text: string, y: number, color: string, size: number): BitmapText {
		let bitmapText = this.add.bitmapText(0, y, 'main', text, size);
		bitmapText.setTintFill(Phaser.Display.Color.ValueToColor(color).color32);
		bitmapText.setPosition((Constants.screen.width - bitmapText.width) / 2, bitmapText.y);
		return bitmapText;
	}

	submit() {
		if (this.verifyName()) {
			this.context.gameplay.events.emit('selector');
			this.scene.stop();
			this.scene.launch('highscore');
			(this.scene.get('highscore') as HighscoreScene).submitScore(this.context.score, this.name.join('').trim().toUpperCase());
		}
	}

	private verifyName() {
		return this.name.join('').trim().length > 0
	}

	update(time: number, delta: number) {
		if(this.verifyName()){
			this.submitDisabled.setAlpha(0);
			this.submitBtn.setAlpha(1);
		}
		else{
			this.submitDisabled.setAlpha(1);
			this.submitBtn.setAlpha(0);
		}
		this.selectorUp.setPosition(26 + this.index * 15, 119+24);
		this.selectorDown.setPosition(26 + this.index * 15, 146+24);

		for (let i = 0; i < 8; i++) {
			let character = this.name[i];

			if (character == undefined)
				character = '';

			this.nameBitmaps[i].text = character;
		}

		let vert = this.context.input.getVerticalDirection(true);
		let horiz = this.context.input.getHorizontalDirection(true);

		if (vert == undefined && horiz == undefined && !this.context.input.getJumpInput().touch)
			this.inputTimer = 0;

		if (this.inputTimer > 0) {
			this.inputTimer -= delta;
			return;
		}

		if (vert != undefined) {
			if (vert === 'down')
				this.charDown();
			else if (vert === 'up')
				this.charUp()

			this.inputTimer = 200;
		} else if (horiz != undefined) {
			if (horiz === 'left')
				this.prevChar();
			else if (horiz === 'right')
				this.nextChar();

			this.inputTimer = 200;
		} else if (this.context.input.getJumpInput().touch) {
			this.nextChar();
			this.inputTimer = 200;
		}
	}

	private charDown() {
		this.context.gameplay.events.emit('selector');
		let next = String.fromCharCode(this.name[this.index].charCodeAt(0) + 1);
		if (this.name[this.index] === 'Z')
			next = ' ';
		if (this.name[this.index] === ' ')
			next = 'A';

		this.name[this.index] = next;
	}

	private charUp() {
		this.context.gameplay.events.emit('selector');
		let next = String.fromCharCode(this.name[this.index].charCodeAt(0) - 1);
		if (this.name[this.index] === 'A')
			next = ' ';
		if (this.name[this.index] === ' ')
			next = 'Z';

		this.name[this.index] = next;
	}

	private prevChar() {
		this.context.gameplay.events.emit('selector');
		this.index--;
		if (this.index < 0)
			this.index = this.name.length - 1;
	}

	private nextChar() {
		this.context.gameplay.events.emit('selector');
		this.index++;
		if (this.index >= this.name.length)
			this.index = 0;
	}
}
