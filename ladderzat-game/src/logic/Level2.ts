import Constants from '../assets/data/constants.yml'
import {sample} from '../main';
import GameContext from '../model/GameContext';
import {LevelLogic} from './LevelLogic';
import GameObjectFactory = Phaser.GameObjects.GameObjectFactory;
import Sprite = Phaser.GameObjects.Sprite;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import SpriteWithStaticBody = Phaser.Types.Physics.Arcade.SpriteWithStaticBody;

export class Level2 extends LevelLogic {
	private state;
	private timer;
	private shocking = false;
	private emitters = [];
	private timerNextBucket = 2000;

	constructor() {
		super(2);
	}

	init(context: GameContext, add: GameObjectFactory) {
		this.emitters = [];
		this.timer = 0;
		this.shocking = false;
		this.state = undefined;
		this.timerNextBucket = 2000;

		let wire = context.getObjectByName("wire");
		let water = context.getObjectByName("water") as SpriteWithStaticBody;

		if (wire) {
			let particles = add.particles('particle-white');
			let emitter = particles.createEmitter({
				lifespan: 300,
				speed: {min: 50, max: 70},
				collideTop: false,
				gravityY: 100,
				collideBottom: true,
				frequency: 10,
			});
			emitter.startFollow(wire, 2, -1);
			this.emitters.push(emitter);
		}

		if (water) {
			//Add power particle emitter
			let particles = add.particles('particle-white');
			let emitter = particles.createEmitter({
				y: water.y - 5,
				x: {min: water.x, max: water.x + 100},
				lifespan: 350,
				angle: {min: 200, max: 350},
				speed: {min: 100, max: 120},
				collideTop: false,
				gravityY: 300,
				collideBottom: true,
				quantity: 2,
				frequency: 10,
			});
			this.emitters.push(emitter);

			water.body.setSize(water.width - 6, water.height, true);
		}

		var sprite = context.getObjectByName('pipe-damage') as SpriteWithDynamicBody;
		var particles = add.particles('particle-water');
		var emitter = particles.createEmitter({
			lifespan: 5000,
			angle: {min: 220, max: 315},
			speed: {min: 50, max: 85},
			bounds: {x: 26, y: sprite.y, w: 86, h: 55},
			bounce: 0.2,
			frequency: 1,
			quantity: 3,
			gravityY: 300,
			collideTop: false,
			collideBottom: true,
		});
		emitter.startFollow(sprite, 3, -3);
		particles.depth = 0;
	}

	update(context: GameContext, delta: number) {
		this.updateWire(context, delta);
		this.updateShockEmitters(context);

		if (context.touchingWater)
			context.player.body.maxSpeed = Constants.level2.water.maxspeed;
		else
			context.player.body.maxSpeed = undefined;

		if (this.shocking && context.touchingWater) {
			var water = context.getObjectByName('water') as SpriteWithStaticBody;
			context.isAlive = false;

			var shock = context.props.create(context.player.x - 6, water.y - water.height - 1);
			shock.setOrigin(0, 1);
			shock.anims.play('kris-shocked');
			context.destroyPlayer();
		}

		this.timerNextBucket -= delta;
		if (this.timerNextBucket <= 0) {
			let bucket = this.objectFactory.createBucket(context.buckets, sample(Constants.gfx.bucket.colors));
			bucket.x = 160;
			bucket.y = Constants.world.height - 415;
			bucket.setCollideWorldBounds(false);
			bucket.setVelocityX(-bucket.body.velocity.x);
			this.timerNextBucket += 3000;
		}
	}

	private updateShockEmitters(context: GameContext) {
		let water = context.getObjectByName("water") as Sprite;

		if (this.state == "shock") {
			this.emitters.forEach(emitter => emitter.start());
			water.anims.play('water', true);
		} else {
			this.emitters.forEach(emitter => emitter.stop());
			water.anims.setProgress(0);
			water.anims.pause();
		}
	}

	private updateWire(context: GameContext, delta: number) {
		const wire = context.getObjectByName("wire") as Sprite;
		if (!wire)
			return;

		this.timer -= delta;
		if (this.timer > 0)
			return;

		if (this.state == undefined) {
			this.timer = 200;
			this.state = "swingdown";
			wire.setFrame(1);
		} else if (this.state === "swingdown") {
			this.state = "shock";
			this.shocking = true;
			this.timer = Constants.level2.wire.shocktime;
			wire.setFrame(2);
		} else if (this.state === "shock") {
			this.state = "swingout1"
			this.timer = 200;
			wire.setFrame(1);
		} else if (this.state === "swingout1") {
			this.shocking = false;
			this.state = "swingout2"
			this.timer = 200;
			wire.setFrame(0);
		} else if (this.state === "swingout2") {
			this.state = "return"
			this.timer = Constants.level2.wire.resttime;
			;
			wire.setFrame(5);
		} else if (this.state === "return") {
			this.state = undefined
			this.timer = 200;
			wire.setFrame(0);
		}
	}
}
