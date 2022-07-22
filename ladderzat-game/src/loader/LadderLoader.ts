import GameObjectCreator = Phaser.GameObjects.GameObjectCreator;
import GameObjectFactory = Phaser.GameObjects.GameObjectFactory;
import ArcadePhysics = Phaser.Physics.Arcade.ArcadePhysics;
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import Constants from '../assets/data/constants.yml'
import ladderdata from '../assets/data/ladders.json'
import Ladder from '../model/Ladder';

export class LadderLoader {
	public getLadders(physics: ArcadePhysics, creator: GameObjectCreator, factory: GameObjectFactory): StaticGroup {
		const ladders = physics.add.staticGroup();
		const data = this.loadLaddersFromJSON();

		console.debug(`Loaded ${data.length} ladders`)

		data.forEach(ladder => {
			let height = (ladder.segments ?? 1) * Constants.object.ladder.height;
			let y = (-ladder.y) + Constants.world.height;

			//Create a render texture for the ladder
			const texture = creator.renderTexture({
				width: Constants.object.ladder.width,
				height,
			}, true);
			texture.setOrigin(0, 1);

			//Render the segments in
			for (let i = 0; i < ladder.segments ?? 1; i++)
				texture.draw('ladder', 0, i * 5);

			//Set position
			texture.setPosition(ladder.x, y);

			//Create a matching rectangle for collision detection as it seems impossible with Phaser to center the physics offset with setSize(x, y, center)
			var collision = factory.rectangle(ladder.x + 3, y, 4, height);
			collision.setOrigin(0, 1);
			ladders.add(collision);
		});

		return ladders;
	}

	private loadLaddersFromJSON(): Ladder[] {
		const data = ladderdata as Ladder[];
		return data;
	}
}
