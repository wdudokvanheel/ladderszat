import {Scene} from 'phaser';
import Constants from '../assets/data/constants.yml';
import GameContext from '../model/GameContext';
import {GameplayScene} from './GameplayScene';
import BitmapText = Phaser.GameObjects.BitmapText;

export class GameOverScene extends Scene {
	private readonly context: GameContext;
	private optionTexts = [];
	private gameOverLabelY = 48;
	private menuY = 134;

	constructor() {
		super('gameover');
	}

	create() {
		let options = [];

		if (this.context.level == 3)
			options.push('SUBMIT');
		if (this.context.level > 1)
			options.push('CONTINUE');
		if (options.length == 0) {
			options.push('RETRY');
		} else {
			options.push('NEW GAME');
		}

		if (this.context.level == 1) {
			this.menuY = 154;
		} else if (this.context.level == 2) {
			this.menuY = 134;
		} else {
			this.gameOverLabelY = 28
			this.menuY = 144;
		}


		this.add.sprite(0, 17, 'gameover').setOrigin(0, 0);
		this.renderTextCenter('GAME OVER', this.gameOverLabelY, '#ad2537', 14);
		this.renderTextCenter('Score', this.gameOverLabelY + 29, '#dedede', 8);
		this.renderTextCenter('' + this.context.score, this.gameOverLabelY + 29 + 12, '#7b47eb', 14);

		if (this.context.level == 3) {
			const y = 102;
			const button = this.add.sprite(0, y, 'ladderzat-button').setOrigin(0, 0);
			this.renderTextCenter("DOWNLOAD", y + 5, '#dedede', 8);
			this.renderTextCenter("LADDERSZAT", y + 18, '#dedede', 8);
			button.setPosition((Constants.screen.width - button.width) / 2, button.y);
			button.setInteractive();
			button.on('pointerup', function (e, a, b) {
				window.open('https://www.sirkris.nl/');
			});
		}

		let y = this.menuY;
		const _this = this;

		for (let option in options) {
			const button = this.add.sprite(0, y - 5, 'submit').setOrigin(0, 0);
			button.setPosition((Constants.screen.width - button.width) / 2, button.y);
			button.setInteractive();
			button.on('pointerdown', function (e, a, b) {
				_this.clickButton(_this.optionTexts[option].text);
				_this.context.gameplay.events.emit('selector');
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
	}
}
