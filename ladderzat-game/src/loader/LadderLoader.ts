import GameObjectCreator = Phaser.GameObjects.GameObjectCreator;
import GameObjectFactory = Phaser.GameObjects.GameObjectFactory;
import ArcadePhysics = Phaser.Physics.Arcade.ArcadePhysics;
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import TextureManager = Phaser.Textures.TextureManager;
import Constants from '../assets/data/constants.yml'

export class LadderLoader {
	public createLadders(physics: ArcadePhysics, creator: GameObjectCreator, factory: GameObjectFactory, textures: TextureManager, data): StaticGroup {
		const ladders = physics.add.staticGroup();

		console.debug(`Loaded ${data.length} ladders`)

		data.forEach(ladder => {
			let height = (ladder.segments ?? 1) * Constants.object.ladder.height;
			let y = (-ladder.y) + Constants.world.height;
			const key = 'ladder-' + (ladder.segments ?? 1);

			//Create texture with required amount of steps if it doesn't exist
			if (!textures.exists(key)) {
				//Create a render texture for the ladder
				const texture = creator.renderTexture({
					width: 10,
					height,
				}, false);
				texture.setOrigin(0, 1);

				//Render the segments in
				for (let i = 0; i < ladder.segments ?? 1; i++) {
					texture.draw('ladder', 0, i * 5);
				}
				texture.saveTexture(key);
			}

			factory.sprite(ladder.x, y, key).setOrigin(0, 1)

			//Create a matching rectangle for collision detection as it seems impossible with Phaser to center the physics offset with setSize(x, y, center)
			var collision = factory.rectangle(ladder.x + 4, y, 1, height);
			collision.setOrigin(0, 1);
			ladders.add(collision);
		});

		return ladders;
	}
}
