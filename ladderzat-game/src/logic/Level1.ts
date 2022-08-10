import Constants from '../assets/data/constants.yml';
import GameContext from '../model/GameContext';
import {MixerSprite} from '../model/MixerSprite';
import LevelLogic from './LevelLogic';
import GameObjectFactory = Phaser.GameObjects.GameObjectFactory;

export default class Level1 extends LevelLogic {
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
			let bucket = this.objectFactory.createBucket(context.buckets, mixer.getData('color'));
			mixer.resetMixing()
			bucket.x = 19;
			bucket.y = Constants.world.height - 200
			this.timerNextBucket += (Math.random() * 500) + 3000;
		}
	}
}
