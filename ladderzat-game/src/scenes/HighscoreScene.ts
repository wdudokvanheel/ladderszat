import {Scene} from 'phaser';
import Constants from '../assets/data/constants.yml';
import {DEBUG_CONTROLLER} from '../controller/DebugController';
import GameContext from '../model/GameContext';
import Highscore from '../model/Highscore';
import HighscoreSubmission from '../model/HighscoreSubmission';
import {GameplayScene} from './GameplayScene';
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import Sprite = Phaser.GameObjects.Sprite;
import BitmapText = Phaser.GameObjects.BitmapText;

export class HighscoreScene extends Scene {
	private readonly context: GameContext;
	private loading = true;
	private top5 = false;
	private contextTop;
	private mine;

	constructor() {
		super('highscore');
	}

	create() {
		const _this = this;

		this.add.sprite(0, 17, 'gameover').setOrigin(0, 0);

		this.renderTextCenter('Highscores', 24, '#601de7', 14);

		var top = this.context.highscore.getTop();
		if (this.top5)
			top = top.slice(0, 5);
		else
			top = top.slice(0, 10);

		let y = 44;
		this.renderText('Rank', 44, y, '#851b26', 8).setOrigin(1, 0);
		this.renderText('Name', 48, y, '#851b26', 8);
		this.renderText('Score', 156, y, '#851b26', 8).setOrigin(1, 0);
		y += 12;
		for (let score of top) {
			let color = '#dedede';
			if (this.mine && score.rank == this.mine.rank)
				color = '#ffe629';

			this.renderText('' + score.rank, 44, y, color, 8).setOrigin(1, 0);
			this.renderText(score.name.toUpperCase(), 48, y, color, 8);
			this.renderText('' + score.score, 156, y, color, 8).setOrigin(1, 0);
			y += 12;
		}

		if (this.top5) {
			this.renderText('..', 44, y, '#dedede', 8).setOrigin(1, 0);
			this.renderText('........', 48, y, '#dedede', 8);
			this.renderText('....', 156, y, '#dedede', 8).setOrigin(1, 0);
			y += 14;
			for (let score of this.contextTop) {
				let color = '#dedede';
				if (this.mine && score.rank == this.mine.rank)
					color = '#ffe629';

				this.renderText('' + score.rank, 44, y, color, 8).setOrigin(1, 0);
				this.renderText(score.name.toUpperCase(), 48, y, color, 8);
				this.renderText('' + score.score, 156, y, color, 8).setOrigin(1, 0);
				y += 12;
			}
		}

		if (!this.loading) {
			const button = this.add.sprite(0, 192, 'submit').setOrigin(0, 0);
			button.setPosition((Constants.screen.width - button.width) / 2, button.y);
			button.setInteractive();
			button.on('pointerdown', function () {
				if (!_this.loading)
					_this.newGame();
			});
			this.renderTextCenter('New Game', 197, '#dedede', 8);
		} else {
			this.renderTextCenter('Loading...', 197, '#dedede', 8);
		}
	}

	renderTextCenter(text: string, y: number, color: string, size: number): BitmapText {
		let bitmapText = this.add.bitmapText(0, y, 'main', text, size);
		bitmapText.setTintFill(Phaser.Display.Color.ValueToColor(color).color32);
		bitmapText.setPosition((Constants.screen.width - bitmapText.width) / 2, bitmapText.y);
		return bitmapText;
	}

	renderText(text: string, x: number, y: number, color: string, size: number) {
		let bitmapText = this.add.bitmapText(x, y, 'main', text, size);
		bitmapText.setTintFill(Phaser.Display.Color.ValueToColor(color).color32);
		return bitmapText;
	}

	private newGame() {
		this.scene.stop();
		this.context.reset();
		(this.scene.get('gameplay') as GameplayScene).scene.restart();
	}

	submitScore(score: number, name: string) {
		this.loading = true;
		let _this = this;
		this.context.highscore.submitScore(name, score, function (score: HighscoreSubmission) {
			_this.mine = score.score;
			if (score.score.rank > 10) {
				_this.top5 = true;
				_this.contextTop = new Array();
				_this.contextTop = _this.contextTop.concat(score.better);
				_this.contextTop.push(score.score);
				_this.contextTop = _this.contextTop.concat(score.worse);
			}
			else{

			}
			_this.loading = false;
			_this.scene.restart();
		});
	}

	update(time: number, delta: number) {

	}
}
