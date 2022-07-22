import {Scene} from 'phaser';
import Constants from '../assets/data/constants.yml';
import {DEBUG_CONTROLLER, DebugController} from '../controller/DebugController';
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

	private dpadButtons: Sprite[] = [];
	private jumpButton: Sprite;

	private jumpInputKeys: Key[] = new Array();
	private isJumpKeyDown = false;
	private isJumpTouchDown = false;

	private horizontalTouchDirection: string = undefined;
	private verticalTouchDirection: string = undefined;
	private horizontalKeyboardDirection: string = undefined;
	private verticalKeyboardDirection: string = undefined;

	private debugText;

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

		this.debugText = this.add.bitmapText(0, 278, 'main', '', 8);
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

		this.updateDPadButtonStates();
		this.debugText.setText(DEBUG_CONTROLLER.getValues());
	}

	private updateDPadButtonStates() {
		this.dpadButtons.forEach(btn => btn.setFrame(0));
		if (this.getHorizontalDirection() == 'right')
			this.dpadButtons[1].setFrame(1);
		else if (this.getHorizontalDirection() == 'left')
			this.dpadButtons[3].setFrame(1);

		if (this.getVerticalDirection() == 'up')
			this.dpadButtons[0].setFrame(1);
		else if (this.getVerticalDirection() == 'down')
			this.dpadButtons[2].setFrame(1);
	}


	public getHorizontalDirection(): string {
		if (this.horizontalTouchDirection === 'left' || this.horizontalKeyboardDirection === 'left')
			return "left";
		else if (this.horizontalTouchDirection === 'right' || this.horizontalKeyboardDirection === 'right')
			return "right";

		return undefined;
	}

	public getVerticalDirection(): string {
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

	public isJumping(): boolean {
		//Extract the values to a variable, as doing an OR check will not guarantee the isJumpingTouch will be called
		const key = this.isJumpingKey();
		const touch = this.isJumpingTouch();

		return key || touch;
	}

	public isJumpingKey(): boolean {
		if (!this.isAnyJumpKeyDown()) {
			this.isJumpKeyDown = false;
			return false;
		}

		//If key was already down (jumped earlier) ignore jump request
		if (this.isJumpKeyDown)
			return false;
		else {
			this.isJumpKeyDown = true;
			return true;
		}
	}

	private isAnyJumpKeyDown(): boolean {
		for (const key of this.jumpInputKeys) {
			if (key.isDown)
				return true;
		}
		return false;
	}

	private isJumpingTouch(): boolean {
		if (this.isJumpTouchDown) {
			this.isJumpTouchDown = false;
			return true;
		}
		return false;
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
			ui.isJumpTouchDown = true;
			this.setFrame(1);
		});

		this.jumpButton.on('pointerup', function () {
			this.setFrame(0);
		});

		this.jumpButton.on('pointerout', function () {
			this.setFrame(0);
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
}
