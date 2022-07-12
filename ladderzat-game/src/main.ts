import Phaser from 'phaser'
import gameConfig from './GameConfig';

let game;

if (module.hot) {
	module.hot.dispose(destroyGame);
	module.hot.accept(newGame);
}

if (!game)
	newGame();

function newGame() {
	if (game)
		return;
	game = new Phaser.Game(gameConfig);
}

function destroyGame() {
	if (!game)
		return;
	game.destroy(true);
	game.runDestroy();
	game = null;
}

export const sample = (arr: any[]) => arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined

