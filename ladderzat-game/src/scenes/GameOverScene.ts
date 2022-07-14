import {Scene} from 'phaser';
import {GameplayScene} from './GameplayScene';

export class GameOverScene extends Scene {
	private timer = 3000;

	constructor() {
		super('gameover');
	}

	create() {
		this.add.sprite(0, 0, 'gameover').setOrigin(0, 0);
	}

	update(time: number, delta: number) {
		this.timer -= delta;
		if(this.timer <= 0){
			this.timer = 3000;
			this.scene.stop('gameplay');
			this.scene.start('gameplay');
			(this.scene.get('gameplay') as GameplayScene).reset();
			this.scene.stop();
		}
	}
}
