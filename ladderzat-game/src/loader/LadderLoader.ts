import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import ArcadePhysics = Phaser.Physics.Arcade.ArcadePhysics;
import ladderdata from '../assets/data/ladders.json'
import Constants from '../assets/data/constants.yml'
import {Ladder} from '../model/Ladder';

export class LadderLoader {
	public getLadders(physics: ArcadePhysics): StaticGroup {
		const ladders = physics.add.staticGroup();
		const data = this.loadLaddersFromJSON();
		console.debug(`Loaded ${data.length} ladders`)

		data.forEach(ladder => {
			for (let i = 0; i < (ladder.segments ?? 1); i++) {
				ladders.create(ladder.x, -(ladder.y + (i * 20)) + Constants.layout.gameplay.height  + Constants.world.height, 'ladder').setOrigin(0, 1).refreshBody();
			}
		});
		return ladders;
	}

	private loadLaddersFromJSON(): Ladder[] {
		const data = ladderdata as Ladder[];
		return data;
	}
}
