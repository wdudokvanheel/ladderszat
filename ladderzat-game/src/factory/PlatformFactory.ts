import ArcadePhysics = Phaser.Physics.Arcade.ArcadePhysics;
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import Constants from '../assets/data/constants.yml'

export default class PlatformFactory {
	public createPlatforms(physics: ArcadePhysics, level: string, data): StaticGroup {
		const platforms = physics.add.staticGroup();
		console.debug(`Loaded ${data.length} platforms`)

		data.forEach(platform => {
			var name = 'platform-';
			if (platform.type)
				name += platform.type;
			else
				name += level

			this.createPlatform(platforms, name, platform.x, platform.y, platform.segments, platform.angled)
		});
		return platforms;
	}

	public createPlatform(group: StaticGroup, name: string, x: number, y: number, segments = 1, angled = '') {
		let angle = 0;

		if (angled) {
			if (angled === 'up')
				angle = 1;
			else if (angled === 'down')
				angle = -1;
		}

		for (let i = 0; i < (segments ?? 1); i++) {
			group.create(x + (i * Constants.object.platform.width), (-(y + (i * angle))) + Constants.world.height, name).setOrigin(0, 0).refreshBody();
		}
	}
}
