import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import ArcadePhysics = Phaser.Physics.Arcade.ArcadePhysics;
import platformsdata from '../assets/data/platforms.json'
import constants from '../assets/data/constants.json'

export class PlatformLoader {
	public getPlatforms(physics: ArcadePhysics): StaticGroup {
		const platforms = physics.add.staticGroup();
		const data = this.loadPlatformsFromJson();
		console.debug(`Loaded ${data.length} platforms`)

		data.forEach(platform => {
			let delta = 0;
			if (platform.angled) {
				if (platform.angled === 'up')
					delta = 1;
				else if (platform.angled === 'down')
					delta = -1;
			}

			for (let i = 0; i < (platform.segments ?? 1); i++) {
				platforms.create(platform.x + (i * constants.PLATFORM_WIDTH), -(platform.y + (i * delta)) + constants.GAMEPLAY_HEIGHT, 'rail').setOrigin(0, 0).refreshBody();
			}
		});
		return platforms;
	}

	private loadPlatformsFromJson(): Platform[] {
		const data = platformsdata as Platform[];
		return data;
	}
}
