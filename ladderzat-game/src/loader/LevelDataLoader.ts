import Constants from '../assets/data/constants.yml';
import LevelData from '../assets/data/levels/*.json'
import {LadderFactory} from '../factory/LadderFactory';
import {ObjectFactory} from '../factory/ObjectFactory';
import PlatformFactory from '../factory/PlatformFactory';
import GameContext from '../model/GameContext';
import GameObjectCreator = Phaser.GameObjects.GameObjectCreator;
import GameObjectFactory = Phaser.GameObjects.GameObjectFactory;
import ArcadePhysics = Phaser.Physics.Arcade.ArcadePhysics;
import TextureManager = Phaser.Textures.TextureManager;

export class LevelDataLoader {
	private platformFactory: PlatformFactory;
	private ladderFactory: LadderFactory;
	private objectFactory: ObjectFactory;

	constructor() {
		this.platformFactory = new PlatformFactory();
		this.ladderFactory = new LadderFactory();
		this.objectFactory = new ObjectFactory();
	}

	public loadLevelDataToContext(context: GameContext, physics: ArcadePhysics, creator: GameObjectCreator, factory: GameObjectFactory, textures: TextureManager) {
		context.leveldata = LevelData['level-' + context.level];
		console.debug('Loading data for level ' + context.level + ': ' + context.leveldata.name);

		//Create game objects
		factory.sprite(0, Constants.world.height, "bg-level-" + context.level).setOrigin(0, 1);

		context.buckets = physics.add.group();
		context.props = this.objectFactory.createProps(factory, context);
		context.platforms = this.platformFactory.createPlatforms(physics, context.leveldata.name, context.leveldata.platforms);
		context.ladders = this.ladderFactory.createLadders(physics, creator, factory, textures, context);
		context.exit = this.objectFactory.createExit(physics, context.leveldata.exit);
		context.collectibles = this.objectFactory.createCollectibles(physics, factory, context);
		context.objects = this.objectFactory.createObjects(physics, factory, context);

		context.player = this.objectFactory.createPlayer(physics);
		context.player.setPosition(context.leveldata.start.x, Constants.world.height - context.leveldata.start.y);
	}
}
