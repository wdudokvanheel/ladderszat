import {Scene} from 'phaser';
import Constants from '../assets/data/constants.yml';
import {DEBUG_CONTROLLER} from '../controller/DebugController';
import GameContext from '../model/GameContext';
import JumpInputModel from '../model/JumpInput';
import BitmapText = Phaser.GameObjects.BitmapText;
import Sprite = Phaser.GameObjects.Sprite;
import Key = Phaser.Input.Keyboard.Key;
import Vector2 = Phaser.Math.Vector2;

export class UIOverlayScene extends Scene {
	private jumpKeyCodes = [Phaser.Input.Keyboard.KeyCodes.ENTER, Phaser.Input.Keyboard.KeyCodes.SPACE, Phaser.Input.Keyboard.KeyCodes.E, Phaser.Input.Keyboard.KeyCodes.O];
	private directions = ["up", "right", "down", "left"];
	private buttonPos = [
		new Vector2(29, 9),
		new Vector2(48, 27),
		new Vector2(29, 45),
		new Vector2(12, 27)
	];

	private context: GameContext;

	private dpadButtons: Sprite[] = [];
	private jumpButton: Sprite;

	private jumpInputKeys: Key[] = new Array();
	private jumpTouchDown = false;

	private horizontalTouchDirection: string = undefined;
	private verticalTouchDirection: string = undefined;
	private horizontalKeyboardDirection: string = undefined;
	private verticalKeyboardDirection: string = undefined;

	private debugText;

	//Progresbar
	private progress = 0;
	private progressPart: Sprite;
	private progressEnd: Sprite;

	//Score & waster indicator
	private score: BitmapText;
	private wasted: BitmapText;

	private drunkText = false;
	private drunkTextTimer = 0;
	private highlight = false;
	private highlightTimer = 0;

	public introTimer = 0;
	private introText;

	public overrideHorizontal: string;

	constructor() {
		super('ui');
	}

	preload() {
		//Add extra pointer to control with two thumbs
		this.input.addPointer(2);
		this.add.sprite(0, 0, 'window').setOrigin(0, 0);
		// this.add.sprite(Constants.screen.width - 8, 8	, 'logo').setOrigin(1, 0);

		this.createDPad();
		this.createJumpButton();
		this.createKeyboardListeners();
		this.createProgressbar();
		this.createUiTexts();
	}

	update(time: number, delta: number) {
		const inputs = [this.input.pointer1, this.input.pointer2, this.input.mousePointer];

		this.verticalTouchDirection = undefined;
		this.horizontalTouchDirection = undefined;

		for (let i = 0; i < inputs.length; i++) {
			if (this.isPointerInDpad(inputs[i])) {
				this.horizontalTouchDirection = this.getPointerHorizontalDirection(inputs[i]);
				this.verticalTouchDirection = this.getPointerVerticalDirection(inputs[i]);
				break;
			}
		}

		this.updateButtonStates();
		this.updateProgressbar();
		this.updateUiTexts();
		this.debugText.setText(DEBUG_CONTROLLER.getValues());
	}

	reset() {
		this.highlight = false;
		this.drunkText = false;
		this.overrideHorizontal = undefined;
		this.createIntroText();
	}

	private updateButtonStates() {
		this.dpadButtons.forEach(btn => btn.setFrame(0));
		if (this.getHorizontalDirection() == 'right')
			this.dpadButtons[1].setFrame(1);
		else if (this.getHorizontalDirection() == 'left')
			this.dpadButtons[3].setFrame(1);

		if (this.getVerticalDirection() == 'up')
			this.dpadButtons[0].setFrame(1);
		else if (this.getVerticalDirection() == 'down')
			this.dpadButtons[2].setFrame(1);

		if (this.context.jumpInput.key || this.context.jumpInput.touch)
			this.jumpButton.setFrame(1);
		else
			this.jumpButton.setFrame(0);
	}

	public getHorizontalDirection(): string {
		if (this.overrideHorizontal != undefined)
			return this.overrideHorizontal;

		if (this.horizontalTouchDirection === 'left' || this.horizontalKeyboardDirection === 'left')
			return "left";
		else if (this.horizontalTouchDirection === 'right' || this.horizontalKeyboardDirection === 'right')
			return "right";

		return undefined;
	}

	public getVerticalDirection(): string {
		if (this.overrideHorizontal != undefined)
			return undefined;

		if (this.verticalTouchDirection === 'up' || this.verticalKeyboardDirection === 'up')
			return 'up';
		else if (this.verticalTouchDirection === 'down' || this.verticalKeyboardDirection === 'down')
			return 'down';

		return undefined;
	}

	private getPointerVerticalDirection(pointer: Phaser.Input.Pointer): string {
		if (pointer.y < Constants.controls.dpad.center.y - Constants.controls.dpad.deadzone.y)
			return "up";
		if (pointer.y > Constants.controls.dpad.center.y + Constants.controls.dpad.deadzone.y)
			return "down";

		return undefined;
	}

	private getPointerHorizontalDirection(pointer: Phaser.Input.Pointer): string {
		if (pointer.x > Constants.controls.dpad.center.x + Constants.controls.dpad.deadzone.x)
			return "right";
		if (pointer.x < Constants.controls.dpad.center.x - Constants.controls.dpad.deadzone.x)
			return "left";

		return undefined;
	}

	private isPointerInDpad(pointer: Phaser.Input.Pointer): boolean {
		return pointer.isDown && pointer.x < 73 && pointer.y > 218;
	}

	public getJumpInput(): JumpInputModel {
		const key = this.isJumpKeyDown();
		const touch = this.isJumpTouchDown();

		if(this.overrideHorizontal != undefined)
			return new JumpInputModel(false, false);

		return new JumpInputModel(key, touch);
	}

	public isJumpKeyDown(): boolean {
		return this.isAnyJumpKeyDown();
	}

	private isAnyJumpKeyDown(): boolean {
		for (const button of this.jumpInputKeys) {
			if (button.isDown)
				return true;
		}
		return false;
	}

	private isJumpTouchDown(): boolean {
		return this.jumpTouchDown;
	}

	private createDPad() {
		for (let i = 0; i < this.directions.length; i++) {
			const button = this.add.sprite(this.buttonPos[i].x, this.buttonPos[i].y + Constants.screen.height - Constants.layout.input.height, 'button-dpad-' + this.directions[i]);
			button.setOrigin(0, 0);
			button.setScrollFactor(0, 0);
			button.setName('button-dpad-' + (i % 2 == 0 ? '-vertical-' : 'horizontal') + this.directions[i]);
			button['dirName'] = this.directions[i];
			this.dpadButtons[i] = button;
		}
	}

	private createJumpButton() {
		const ui = this;

		this.jumpButton = this.add.sprite(Constants.screen.width - 12, Constants.screen.height - Constants.layout.input.height + 14, 'button-jump')
			.setOrigin(1, 0)
			.setInteractive()
			.setScrollFactor(0, 0)
			.setName('button-jump');

		this.jumpButton.on('pointerdown', function () {
			ui.jumpTouchDown = true;
		});

		this.jumpButton.on('pointerup', function () {
			ui.jumpTouchDown = false;
		});

		this.jumpButton.on('pointerout', function () {
			ui.jumpTouchDown = false;
		});
	}

	private createKeyboardListeners() {
		const ui = this;

		//Add jump keys
		this.jumpKeyCodes.forEach(key => this.jumpInputKeys.push(this.input.keyboard.addKey(key, true, false)));

		this.input.keyboard.on('keydown', function (event) {
			switch (event.keyCode) {
				case Phaser.Input.Keyboard.KeyCodes.A:
				case Phaser.Input.Keyboard.KeyCodes.J:
				case Phaser.Input.Keyboard.KeyCodes.LEFT:
				case Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR:
					ui.horizontalKeyboardDirection = 'left';
					break;
				case Phaser.Input.Keyboard.KeyCodes.D:
				case Phaser.Input.Keyboard.KeyCodes.L:
				case Phaser.Input.Keyboard.KeyCodes.RIGHT:
				case Phaser.Input.Keyboard.KeyCodes.NUMPAD_SIX:
					ui.horizontalKeyboardDirection = 'right'
					break;
				case Phaser.Input.Keyboard.KeyCodes.W:
				case Phaser.Input.Keyboard.KeyCodes.I:
				case Phaser.Input.Keyboard.KeyCodes.UP:
				case Phaser.Input.Keyboard.KeyCodes.NUMPAD_EIGHT:
					ui.verticalKeyboardDirection = 'up';
					break;
				case Phaser.Input.Keyboard.KeyCodes.S:
				case Phaser.Input.Keyboard.KeyCodes.K:
				case Phaser.Input.Keyboard.KeyCodes.DOWN:
				case Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO:
					ui.verticalKeyboardDirection = 'down';
					break;
			}
		});

		this.input.keyboard.on('keyup', function (event) {
			switch (event.keyCode) {
				case Phaser.Input.Keyboard.KeyCodes.A:
				case Phaser.Input.Keyboard.KeyCodes.J:
				case Phaser.Input.Keyboard.KeyCodes.LEFT:
				case Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR:
					if (ui.horizontalKeyboardDirection === 'left')
						ui.horizontalKeyboardDirection = undefined;
					break;
				case Phaser.Input.Keyboard.KeyCodes.D:
				case Phaser.Input.Keyboard.KeyCodes.L:
				case Phaser.Input.Keyboard.KeyCodes.RIGHT:
				case Phaser.Input.Keyboard.KeyCodes.NUMPAD_SIX:
					if (ui.horizontalKeyboardDirection === 'right')
						ui.horizontalKeyboardDirection = undefined;
					break;
				case Phaser.Input.Keyboard.KeyCodes.W:
				case Phaser.Input.Keyboard.KeyCodes.I:
				case Phaser.Input.Keyboard.KeyCodes.UP:
				case Phaser.Input.Keyboard.KeyCodes.NUMPAD_EIGHT:
					if (ui.verticalKeyboardDirection === 'up')
						ui.verticalKeyboardDirection = undefined;
					break;
				case Phaser.Input.Keyboard.KeyCodes.S:
				case Phaser.Input.Keyboard.KeyCodes.K:
				case Phaser.Input.Keyboard.KeyCodes.DOWN:
				case Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO:
					if (ui.verticalKeyboardDirection === 'down')
						ui.verticalKeyboardDirection = undefined;
					break;
			}
		});
	}

	private createProgressbar() {
		this.add.sprite(0, 0, "progress-base").setOrigin(0, 0);
		this.add.sprite(2, 4, "progress-start").setOrigin(0, 0);
		this.progressPart = this.add.sprite(4, 4, "progress-part").setOrigin(0, 0);
		this.progressEnd = this.add.sprite(10, 4, "progress-end").setOrigin(0, 0);
	}

	private createUiTexts() {
		this.debugText = this.add.bitmapText(0, 278, 'main', '', 8);
		this.score = this.add.bitmapText(80, 4, 'main', '0', 8);
		this.score.setTintFill(Phaser.Display.Color.ValueToColor('#dedede').color32);
		this.score.setOrigin(0, 0)

		this.wasted = this.add.bitmapText(80, this.score.y, 'main', 'LADDERS ZAT', 8);
		this.wasted.alpha = 0;
		this.wasted.setTintFill(Phaser.Display.Color.ValueToColor('#ed0e69').color32);
		this.wasted.setOrigin(0, 0)
		this.wasted.setPosition((Constants.screen.width - this.wasted.width) / 2, this.wasted.y);
		this.createIntroText();
	}

	public createIntroText(title = true) {
		if (this.introTimer > 0) {
			return;
		}
		this.introTimer = 180;

		if (this.introText) {
			this.introText.texture.clear();
			this.introText.setAlpha(1);
		} else {
			this.introText = this.make.renderTexture({
				width: Constants.screen.width,
				height: 64,
				x: 0,
				y: 32
			}, true);
			this.introText.setOrigin(0, 0);
		}

		var level = this.make.dynamicBitmapText({
			font: 'main',
			text: this.context.leveldata.title,
			size: 12
		}, false);

		var goalA = this.make.dynamicBitmapText({
			font: 'main',
			text: this.context.leveldata.introA,
			size: 8
		}, false);

		var goalB = this.make.dynamicBitmapText({
			font: 'main',
			text: this.context.leveldata.introB,
			size: 8
		}, false);

		level.setTintFill(Phaser.Display.Color.ValueToColor(this.context.leveldata.titleColor).color32);
		goalA.setTintFill(Phaser.Display.Color.ValueToColor('#dedede').color32);
		goalB.setTintFill(Phaser.Display.Color.ValueToColor('#dedede').color32);

		this.introText.draw('titlebg', 0, 0);
		this.introText.draw(level, (Constants.screen.width - level.width) / 2, 12);
		this.introText.draw(goalA, (Constants.screen.width - goalA.width) / 2, 36);
		this.introText.draw(goalB, (Constants.screen.width - goalB.width) / 2, 48);
		this.introText.setAlpha(1);
	}

	private updateProgressbar() {
		if (this.progress < this.context.progress) {
			let diff = this.context.progress - this.progress;
			let accelRate = 0.0003;
			let delta = Math.pow(Math.abs(diff) * accelRate, 0.5) * Math.sign(diff);
			this.progress += delta;
		}

		this.progress = Math.min(this.progress, this.context.progress);
		this.progress = Math.max(0, this.progress);
		this.progress = Math.min(this.progress, 1);

		let prog = this.progress * Constants.gfx.progress.width.total;
		this.progressPart.displayWidth = prog;
		this.progressEnd.setPosition(4 + prog, 4);
	}

	private updateUiTexts() {
		if (this.introTimer > 0) {
			if (--this.introTimer < 60) {
				const alpha = this.introTimer / 60;
				this.introText.setAlpha(alpha);
			}
		}

		this.score.setText('' + this.context.score);
		this.score.setPosition((Constants.screen.width - this.score.width) / 2, this.score.y);

		if (this.highlight) {
			this.score.setTintFill(Phaser.Display.Color.ValueToColor('#ed0e69').color32);
			this.wasted.setTintFill(Phaser.Display.Color.ValueToColor('#ed0e69').color32);
		} else {
			this.score.setTintFill(Phaser.Display.Color.ValueToColor('#dedede').color32);
			this.wasted.setTintFill(Phaser.Display.Color.ValueToColor('#dedede').color32);
		}
		if (this.drunkText) {
			this.score.alpha = 0;
			this.wasted.alpha = 1;
		} else {
			this.score.alpha = 1;
			this.wasted.alpha = 0;
		}

		if (this.context.progress >= 1) {
			this.drunkTextTimer--;

			if (this.drunkTextTimer <= 0) {
				if (this.drunkText)
					this.drunkTextTimer = 180;
				else
					this.drunkTextTimer = 120;
				this.drunkText = !this.drunkText
			}

			this.highlightTimer--;
			if (this.highlightTimer <= 0) {
				this.highlight = !this.highlight;
				this.highlightTimer = 15;
			}
		}
	}
}
