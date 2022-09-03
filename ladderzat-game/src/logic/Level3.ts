import Constants from '../assets/data/constants.yml'
import {sample} from '../main';
import GameContext from '../model/GameContext';
import LevelLogic from './LevelLogic';
import GameObjectFactory = Phaser.GameObjects.GameObjectFactory;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export default class Level3 extends LevelLogic {
	private nextBadDropTimer: number;
	private nextGoodDropTimer: number;
	private nextMedTimer: number;
	private nextBadDropSleep = 1000;
	private nextGoodDropSleep = 2000;
	private nextMedSleep = 8000;
	private maxSpeed = 65;
	private factory: GameObjectFactory;
	private hasMedPack = false;
	private reachedLadderzat = false;

	constructor() {
		super(3);
	}

	init(context: GameContext, factory: GameObjectFactory) {
		this.nextBadDropTimer = 1000;
		this.nextGoodDropTimer = 1000;
		this.nextMedTimer = 500;
		this.factory = factory;
	}

	update(context: GameContext, delta: number) {
		this.generateBadDrops(context, delta);
		this.generateGoodDrop(context, delta);
		this.generateMedPack(context, delta);
	}

	private generateGoodDrop(context: GameContext, delta: number) {
		this.nextGoodDropTimer -= delta;
		let x = context.player.x < 80 ? 113: 50;
		if (this.nextGoodDropTimer <= 0) {
			let sprite = context.collectibles.create(x, Constants.world.height - 200, 'collect-drink-' + sample(Constants.object.drinks));
			sprite.setDataEnabled();
			sprite.setData('collect', 'drink');
			sprite.setMaxVelocity(this.maxSpeed, this.maxSpeed);
			this.nextGoodDropTimer = this.nextGoodDropSleep;
		}
	}

	private generateBadDrops(context: GameContext, delta: number) {
		this.nextBadDropTimer -= delta;
		if (this.nextBadDropTimer <= 0) {
			let object = this.objectFactory.createBucket(context.buckets, sample(Constants.gfx.bucket.colors));
			object.setBounce(0);
			object.setCollideWorldBounds(true);
			object.setVelocityX(Math.random() * 150 - 75);
			object.setVelocityY(-50 - (Math.random() * 50));
			object.setMaxVelocity(50, this.maxSpeed)
			object.x = 80;
			object.y = Constants.world.height - 135
			this.nextBadDropTimer += this.nextBadDropSleep;
		}
	}

	private increaseDifficulty(context: GameContext){
		// if(context.progress < 1)
		// 	return;
		this.nextBadDropSleep *= .85;
		this.maxSpeed *= 1.15;
		this.nextMedSleep *= 1.15;
	}

	collectibleCollision(context: GameContext, collectible: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody){
		let type = collectible.getData('collect');
		collectible.destroy();

		if(type === 'medpack') {
			context.drunk = 0;
			this.hasMedPack = false;
			return;
		}

		context.drunk += .1;

		let progression = (context.getMaxProgressionForLevel(context.level) - context.getMinProgressionForLevel(context.level)) / (context.leveldata.progressCollectibles + 1);
		context.progress += progression;
		if(context.progress >= 1)
			this.reachedLadderzat = true;
	}

	bucketCollision(context: GameContext, bucket: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
		if (bucket.name === 'corpsed')
			return;
		bucket.destroy(true);
	}

	private generateMedPack(context: GameContext, delta: number) {
		if(this.hasMedPack || !this.reachedLadderzat || context.drunk < .9)
			return;

		let x = context.player.x < 80 ? 130: 20;

		this.nextMedTimer -= delta;
		if (this.nextMedTimer <= 0) {
			let sprite = this.objectFactory.createBouncingSprite(this.factory, x,65, 'medpack') as SpriteWithDynamicBody;
			context.collectibles.add(sprite, false);
			sprite.body.setAllowGravity(false);
			sprite.setDataEnabled();
			sprite.data.set('collect', 'medpack');
			this.nextMedTimer = this.nextMedSleep;
			this.hasMedPack = true;
		}
	}
}
