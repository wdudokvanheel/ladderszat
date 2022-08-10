import Constants from '../assets/data/constants.yml'
import PlatformFactory from '../factory/PlatformFactory';
import {sample} from '../main';
import GameContext from '../model/GameContext';
import LevelLogic from './LevelLogic';
import GameObjectFactory = Phaser.GameObjects.GameObjectFactory;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export default class Level3 extends LevelLogic {
	private levels = 20;
	private platformFactory = new PlatformFactory();

	constructor() {
		super(3);
	}

	init(context: GameContext, factory: GameObjectFactory) {
		for (let i = 0; i < this.levels; i++) {
			this.platformFactory.createPlatform(context.platforms, 'platform-studio', 50 + (i % 2 == 0 ? 50 : 0), 15 * i + 20);
		}
		this.createCollectibles(context, factory);
	}

	update(context: GameContext, delta: number) {
	}

	private createCollectibles(context: GameContext, factory: GameObjectFactory) {
		for (let i = 0; i < this.levels; i++) {
			let sprite = this.objectFactory.createBouncingSprite(factory,59 + (i % 2 == 0 ? 50 : 0), 15 * i + 25, 'collect-drink-' + sample(Constants.object.drinks), 2, 550);
			context.collectibles.add(sprite, false);
			(sprite as SpriteWithDynamicBody).body.setAllowGravity(false);
			sprite.setDataEnabled();
			sprite.data.set('collect', 'drink');
		}
	}
}
