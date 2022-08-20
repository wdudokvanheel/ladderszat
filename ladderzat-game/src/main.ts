import Phaser from 'phaser'
import gameConfig from './GameConfig';

let game: Phaser.Game;

if (module.hot) {
	module.hot.dispose(stopGame);
	module.hot.accept(startGame);
}

if (!game)
	startGame();

function startGame() {
	if (game)
		return;
	game = new Phaser.Game(gameConfig);
}

function stopGame() {
	if (!game)
		return;

	//Context plugin must be destroyed, or it will block next newGame
	game.plugins.removeGlobalPlugin('context');
	game.destroy(true);
	game = null;
}

export const sample = (arr: any[]) => arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined
