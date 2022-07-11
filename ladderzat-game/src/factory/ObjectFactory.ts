import ArcadePhysics = Phaser.Physics.Arcade.ArcadePhysics;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import Constants from '../assets/data/constants.yml'

export class ObjectFactory {
	createPlayer(physics : ArcadePhysics): SpriteWithDynamicBody {
		const player = physics.add.sprite(Constants.screen.width / 2 - 12, 150, 'kris-stand');
		player.setBounce(0);
		player.setDataEnabled();
		player.setCollideWorldBounds(true);
		player.body.setMaxVelocityY(400);
		return player;
	}
}
