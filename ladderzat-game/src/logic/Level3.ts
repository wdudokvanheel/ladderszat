import Constants from '../assets/data/constants.yml'
import {sample} from '../main';
import GameContext from '../model/GameContext';
import LevelLogic from './LevelLogic';
import GameObjectFactory = Phaser.GameObjects.GameObjectFactory;

export default class Level3 extends LevelLogic {
	private timerNextBucket: number;

	constructor() {
		super(3);
	}

	init(context: GameContext, factory: GameObjectFactory) {
		this.timerNextBucket = 1000;
	}

	update(context: GameContext, delta: number) {
		this.timerNextBucket -= delta;
		if (this.timerNextBucket <= 0) {
			let bucket = this.objectFactory.createBucket(context.buckets, sample(Constants.gfx.bucket.colors));
			bucket.setBounce(0);
			bucket.setCollideWorldBounds(true);
			bucket.setVelocityX(Math.random() * 200 - 100);
			bucket.setVelocityY(-50 - (Math.random() * 50));
			// bucket.body.setAllowGravity(false);
			bucket.setGravityY(-200);
			bucket.setGravityX(0);
			bucket.x = 80;
			bucket.y = Constants.world.height - 135
			this.timerNextBucket += 500;
		}
	}

	bucketCollision(context: GameContext, bucket: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
		if (bucket.name === 'corpsed')
			return;
		bucket.destroy(true);
	}
}
