import Constants from '../assets/data/constants.yml';
import {ObjectFactory} from '../factory/ObjectFactory';
import GameContext from '../model/GameContext';
import {MixerSprite} from '../model/MixerSprite';
import {LevelLogic} from './LevelLogic';
import Group = Phaser.Physics.Arcade.Group;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import GameObjectFactory = Phaser.GameObjects.GameObjectFactory;

export class Level1 extends LevelLogic {
	private timerNextBucket: number;

	constructor() {
		super(1);
	}

	init(context: GameContext, add: GameObjectFactory) {
		this.timerNextBucket = 500;
	}

	update(context: GameContext, delta: number) {
		let mixer = context.getObjectByName('mixer') as MixerSprite;
		if (!mixer)
			return;

		this.timerNextBucket -= delta;
		if (this.timerNextBucket <= 0) {
			let bucket = this.createBucket(context.buckets, mixer.getData('color'));
			mixer.resetMixing()
			bucket.x = 19;
			bucket.y = Constants.world.height - 200
			this.timerNextBucket += (Math.random() * 500) + 3000;
		}
	}

	createBucket(group: Group, color: string): SpriteWithDynamicBody {
		const grp = group.create(10, Constants.world.height - 200, 'bucket-' + color);
		const bucket = grp as SpriteWithDynamicBody;
		bucket.setBounce(1, .6);
		bucket.setCollideWorldBounds(true);
		bucket.setVelocityX(50 + (Math.random() * 10));
		bucket.setVelocityY(-100 - (Math.random() * 50));
		bucket.anims.play('bucket-' + color);
		bucket.refreshBody();
		return bucket;
	}
}
