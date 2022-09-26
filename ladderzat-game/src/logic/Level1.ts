import Constants from '../assets/data/constants.yml';
import GameContext from '../model/GameContext';
import {MixerSprite} from '../model/MixerSprite';
import LevelLogic from './LevelLogic';
import GameObjectFactory = Phaser.GameObjects.GameObjectFactory;

export default class Level1 extends LevelLogic {
	private timerNextBucket: number;
	private collectibles = 0;

	constructor() {
		super(1);
	}

	init(context: GameContext, add: GameObjectFactory) {
		this.timerNextBucket = 0;
		this.collectibles = 0;
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
			bucket.y = Constants.world.height - 223
			this.timerNextBucket += (Math.random() * 500) + 4000;
		}
	}

	collectibleCollision(context: GameContext, collectible: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
		super.collectibleCollision(context, collectible);
		const type = collectible.data.get('collect');
		if (type === 'coin')
			return;

		this.collectibles++;
		if(this.collectibles == 3){
			let shadow = context.getObjectByName('exit-shadow');
			if(shadow)
				shadow.destroy(true);
		}
	}

	public canExit(context: GameContext) : boolean{
		if(this.collectibles == 3)
			return true;

		if(context.input.introTimer == 0)
			context.input.createIntroText();
		else
			context.input.introTimer = 180;
		return false;
	}
}
