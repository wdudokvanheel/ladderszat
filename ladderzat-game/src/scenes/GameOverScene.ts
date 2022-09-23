import {Scene} from 'phaser';
import Constants from '../assets/data/constants.yml';
import GameContext from '../model/GameContext';
import {GameplayScene} from './GameplayScene';
import BitmapText = Phaser.GameObjects.BitmapText;

export class GameOverScene extends Scene {
	private readonly context: GameContext;
	private optionTexts = [];
	private menuY = 134;

	constructor() {
		super('gameover');
	}

	create() {
		this.add.sprite(0, 17, 'gameover').setOrigin(0, 0);
		this.renderTextCenter('GAME OVER', 48, '#ad2537', 14);
		this.renderTextCenter('Score', 80, '#dedede', 8);
		this.renderTextCenter('' + this.context.score, 92, '#601de7', 14);

		let options = [];

		if (this.context.level == 3)
			options.push('SUBMIT');
		if (this.context.level > 1)
			options.push('CONTINUE');

		if (options.length == 0) {
			this.menuY = 154;
			options.push('RETRY');
		} else {
			this.menuY = 134;
			options.push('NEW GAME');
		}

		var y = this.menuY;

		const _this = this;
		for (let option in options) {
			const button = this.add.sprite(0, y - 5, 'submit').setOrigin(0, 0);
			button.setPosition((Constants.screen.width - button.width) / 2, button.y);
			button.setInteractive();
			button.on('pointerdown', function (e, a, b) {
				_this.clickButton(_this.optionTexts[option].text);
			});

			this.optionTexts[option] = this.renderTextCenter(options[option], y, '#dedede', 8);
			y += 24;
		}
	}

	public clickButton(button: string) {
		this.time.delayedCall(250, function () {
			if (button.startsWith("NEW") || button.startsWith("RETRY")) {
				this.scene.stop();
				this.context.reset();
				(this.scene.get('gameplay') as GameplayScene).scene.restart();
			} else if (button.startsWith("CONT")) {
				this.scene.stop();
				this.context.reset(this.context.level);
				(this.scene.get('gameplay') as GameplayScene).scene.restart();
			} else if (button.startsWith("SUBMIT")) {
				this.scene.stop();
				this.scene.launch('entername');
			}
		}, null, this);
	}

	renderTextCenter(text: string, y: number, color: string, size: number): BitmapText {
		let bitmapText = this.add.bitmapText(0, y, 'main', text, size);
		bitmapText.setTintFill(Phaser.Display.Color.ValueToColor(color).color32);
		bitmapText.setPosition((Constants.screen.width - bitmapText.width) / 2, bitmapText.y);
		return bitmapText;
	}

	update(time: number, delta: number) {
``
	}
}
