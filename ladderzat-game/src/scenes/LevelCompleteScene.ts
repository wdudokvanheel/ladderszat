import {Scene} from 'phaser';
import GameContext from '../model/GameContext';
import {GameplayScene} from './GameplayScene';

export class LevelCompleteScene extends Scene {
	private context: GameContext;
	private timer = 2000;

	constructor() {
		super('levelcomplete');
	}

	create() {
		let textLevel = this.add.bitmapText(0, 0, 'main', 'Level ' + this.context.level, 8);
		textLevel.setPosition((160 - textLevel.width) / 2, 32);
		textLevel.setTintFill(Phaser.Display.Color.ValueToColor('#74a130').color32);

		textLevel = this.add.bitmapText(0, 0, 'main', 'Complete', 8);
		textLevel.setPosition((160 - textLevel.width) / 2, 48);
		textLevel.setTintFill(Phaser.Display.Color.ValueToColor('#74a130').color32);
	}

	update(time: number, delta: number) {
		this.timer -= delta;
		if (this.timer <= 0) {
			this.timer = 2000;
			this.scene.stop();
			this.setNextLevel();
			(this.scene.get('gameplay') as GameplayScene).scene.restart();
		}
	}

	private setNextLevel() {
		if (this.context.level < 3) {
			this.context.level++;
		}
	}
}
