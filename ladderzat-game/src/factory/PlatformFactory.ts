import ArcadePhysics = Phaser.Physics.Arcade.ArcadePhysics;
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import Constants from '../assets/data/constants.yml'

export class PlatformFactory {
	public createPlatforms(physics: ArcadePhysics, level: string, data): StaticGroup {
		const platforms = physics.add.staticGroup();
		console.debug(`Loaded ${data.length} platforms`)

		data.forEach(platform => {
			let delta = 0;
			var name = 'platform-';
			if(platform.type)
				name += platform.type;
			else
				name += level

			if (platform.angled) {
				if (platform.angled === 'up')
					delta = 1;
				else if (platform.angled === 'down')
					delta = -1;
			}

			for (let i = 0; i < (platform.segments ?? 1); i++) {
				platforms.create(platform.x + (i * Constants.object.platform.width), (-(platform.y + (i * delta))) + Constants.world.height, name).setOrigin(0, 0).refreshBody();
			}
		});
		return platforms;
	}
}
