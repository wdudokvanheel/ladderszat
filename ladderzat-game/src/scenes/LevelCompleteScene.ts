import {Scene} from 'phaser';
import GameContext from '../model/GameContext';
import {GameplayScene} from './GameplayScene';

export class LevelCompleteScene extends Scene {
	private context: GameContext;
	private timer = 2500;

	constructor() {
		super('levelcomplete');
	}

	create() {
		this.add.sprite(0, 32, 'titlebg').setOrigin(0, 0);

		let textLevel = this.add.bitmapText(0, 0, 'main', this.context.leveldata.title, 12);
		textLevel.setPosition((160 - textLevel.width) / 2, 44);
		textLevel.setTintFill(Phaser.Display.Color.ValueToColor(this.context.leveldata.titleColor).color32);

		textLevel = this.add.bitmapText(0, 0, 'main', 'Level complete!', 8);
		textLevel.setPosition((160 - textLevel.width) / 2, 32+36);
		textLevel.setTintFill(Phaser.Display.Color.ValueToColor('#74a130').color32);
	}

	update(time: number, delta: number) {
		this.timer -= delta;
		if (this.timer <= 0) {
			this.timer = 2000;
			this.scene.stop();
			this.setNextLevel();
			if(this.context.player) {
				this.context.destroyPlayer();
				this.context.isAlive = false;
			}

			(this.scene.get('gameplay') as GameplayScene).scene.restart();
		}
	}

	private setNextLevel() {
		if (this.context.level < 3) {
			this.context.progress = this.context.getMaxProgressionForLevel(this.context.level);
			this.context.level++;
		}
	}
}
