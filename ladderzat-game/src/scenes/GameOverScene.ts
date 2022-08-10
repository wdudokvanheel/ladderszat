import {Scene} from 'phaser';
import GameContext from '../model/GameContext';
import {GameplayScene} from './GameplayScene';

export class GameOverScene extends Scene {
	private readonly context: GameContext;
	private timer = 5000;

	constructor() {
		super('gameover');
	}

	create() {
		this.add.sprite(0, 0, 'gameover').setOrigin(0, 0);
	}

	update(time: number, delta: number) {
		this.timer -= delta;
		if(this.timer <= 0){
			this.timer = 5000;
			this.scene.stop();
			this.context.reset();
			(this.scene.get('gameplay') as GameplayScene).scene.restart();
		}
	}
}
