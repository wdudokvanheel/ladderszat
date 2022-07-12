import ArcadePhysics = Phaser.Physics.Arcade.ArcadePhysics;
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import Constants from '../assets/data/constants.yml'
import ladderdata from '../assets/data/ladders.json'
import {Ladder} from '../model/Ladder';

export class LadderLoader {
	public getLadders(physics: ArcadePhysics): StaticGroup {
		const ladders = physics.add.staticGroup();
		const data = this.loadLaddersFromJSON();
		console.debug(`Loaded ${data.length} ladders`)

		data.forEach(ladder => {
			for (let i = 0; i < (ladder.segments ?? 1); i++) {
				const sprite = ladders.create(ladder.x, -(ladder.y + (i * Constants.object.ladder.height)) + Constants.world.height, 'ladder')
					.setOrigin(0, 1)
					.refreshBody()
					.setDataEnabled();
				sprite.setData('segment', i);
			}
		});
		return ladders;
	}

	private loadLaddersFromJSON(): Ladder[] {
		const data = ladderdata as Ladder[];
		return data;
	}
}
