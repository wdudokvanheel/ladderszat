import ArcadePhysics = Phaser.Physics.Arcade.ArcadePhysics;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export class ObjectFactory {
	createPlayer(physics : ArcadePhysics): SpriteWithDynamicBody {
		// var kris = this.addImage('kris-stand', 120, 100)
		const player = physics.add.sprite(86, -50, 'kris-stand');
		player.setBounce(0.1);
		player.setMaxVelocity(150);
		player.setDataEnabled();
		// player.setCollideWorldBounds(true);
		return player;
	}
}
