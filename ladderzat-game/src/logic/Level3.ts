import Constants from '../assets/data/constants.yml'
import {sample} from '../main';
import GameContext from '../model/GameContext';
import LevelLogic from './LevelLogic';
import GameObjectFactory = Phaser.GameObjects.GameObjectFactory;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import Vector2 = Phaser.Math.Vector2;

export default class Level3 extends LevelLogic {
	private nextBadDropTimer: number;
	private nextGoodDropTimer: number;
	private nextMedTimer: number;
	private nextBadDropSleep = 1500;
	private nextGoodDropSleep = 3000;
	private nextMedSleep = 8000;
	private maxSpeed = 65;
	private factory: GameObjectFactory;
	private hasMedPack = false;
	private reachedLadderzat = false;
	private particleDeathzone;

	constructor() {
		super(3);
	}

	init(context: GameContext, factory: GameObjectFactory) {
		this.nextBadDropTimer = 3000;
		this.nextGoodDropTimer = 3000;
		this.nextMedTimer = 500;
		this.factory = factory;

		var rect1 = new Phaser.Geom.Rectangle(0, Constants.world.height - 7, 160, 7);
		var rect2 = new Phaser.Geom.Rectangle(-12, Constants.world.height - 42, 48, 2);
		var rect3 = new Phaser.Geom.Rectangle(124, Constants.world.height - 42, 48, 2);

		this.particleDeathzone = {
			contains: function (x, y)
			{
				return Phaser.Geom.Rectangle.Contains(rect1, x, y) ||
					Phaser.Geom.Rectangle.Contains(rect2, x, y) ||
					Phaser.Geom.Rectangle.Contains(rect3, x, y);
			}
		};
		(context.getObjectByName('koos') as SpriteWithDynamicBody).setFrame(1);
	}

	update(context: GameContext, delta: number) {
		this.generateBadDrops(context, delta);
		this.generateGoodDrop(context, delta);
		this.generateMedPack(context, delta);
	}

	private generateGoodDrop(context: GameContext, delta: number) {
		this.nextGoodDropTimer -= delta;
		let x = context.player.x < 80 ? 113 : 50;
		x += Math.random() * 20 - 10;
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
			object.setVelocityX(Math.random() * 125 - 62);
			object.setVelocityY(-100 - (Math.random() * 50));
			object.setMaxVelocity(50, this.maxSpeed);
			object.setDrag(10, 0);
			object.body.setAllowGravity(true);
			object.x = 80;
			object.y = Constants.world.height - 135
			this.nextBadDropTimer += this.nextBadDropSleep;
			(context.getObjectByName('koos') as SpriteWithDynamicBody).anims.play('koos-throw');
		}
	}

	private increaseDifficulty(context: GameContext) {
		// if(context.progress < 1)
		// 	return;
		this.nextBadDropSleep *= .8;
		// this.maxSpeed *= 1.15;
		this.nextMedSleep *= 1.15;
	}

	collectibleCollision(context: GameContext, collectible: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
		let type = collectible.getData('collect');
		collectible.destroy();

		if (type === 'medpack') {
			context.drunk = 0;
			this.hasMedPack = false;
			this.reachedLadderzat = false;
			return;
		}

		context.drunk += .2;
		let progression = (context.getMaxProgressionForLevel(context.level) - context.getMinProgressionForLevel(context.level)) / (context.leveldata.progressCollectibles + 1);
		context.progress += progression;

		if(context.drunk >= 1 && !this.reachedLadderzat){
			this.increaseDifficulty(context);
			this.reachedLadderzat = true;
			context.gameplay.events.emit('chant');
		}
	}

	bucketCollision(context: GameContext, bucket: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
		if (bucket.name === 'corpsed')
			return;

		var particles = this.factory.particles('paint');
		var emitter = particles.createEmitter({
			frame: ['red', 'purple', 'blue', 'green'],
			angle: {min: 150, max: 400},
			speed: {min: 0, max: 120},
			gravityY: 350,
			lifespan: 1000,
			quantity: 50,
			deathZone: {type: 'onEnter', source: this.particleDeathzone}
		});
		emitter.explode(500, bucket.x, bucket.y + 3)
		bucket.destroy(true);
		this.camera.shake(120, new Vector2(0, 0.010));
		context.gameplay.events.emit('hitfx');
	}

	private generateMedPack(context: GameContext, delta: number) {
		if (this.hasMedPack || !this.reachedLadderzat || context.drunk < .9)
			return;

		let x = context.player.x < 80 ? 130 : 20;

		this.nextMedTimer -= delta;
		if (this.nextMedTimer <= 0) {
			let sprite = this.objectFactory.createBouncingSprite(this.factory, x, 65, 'medpack') as SpriteWithDynamicBody;
			context.collectibles.add(sprite, false);
			sprite.body.setAllowGravity(false);
			sprite.setDataEnabled();
			sprite.data.set('collect', 'medpack');
			this.nextMedTimer = this.nextMedSleep;
			this.hasMedPack = true;
		}
	}
}
