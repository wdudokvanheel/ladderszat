import Phaser from 'phaser';
import Constants from '../assets/data/constants.yml'
import CollisionController from '../controller/CollisionController';
import GraphicsController from '../controller/GraphicsController';
import {PhysicsController} from '../controller/PhysicsController';
import {ObjectFactory} from '../factory/ObjectFactory';
import {LadderLoader} from '../loader/LadderLoader';
import {PlatformLoader} from '../loader/PlatformLoader';
import GameContext from '../model/GameContext';
import {UIOverlayScene} from './UIOverlayScene';
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export class GameplayScene extends Phaser.Scene {
	private platformLoader: PlatformLoader;
	private ladderLoader: LadderLoader;
	private objectFactory: ObjectFactory;

	private physicsController: PhysicsController;
	private collisionController: CollisionController;
	private graphicsController: GraphicsController;

	private timerNextBucket;
	private timerDeath;

	private running = true;
	private readonly context: GameContext;
	private targetTimeScale = 1;

	constructor() {
		super('gameplay')
		this.context = new GameContext(this);
	}

	preload() {
		this.platformLoader = new PlatformLoader();
		this.ladderLoader = new LadderLoader();
		this.objectFactory = new ObjectFactory();
	}

	create() {
		this.context.buckets = this.physics.add.group();

		//Create game objects
		this.context.platforms = this.platformLoader.getPlatforms(this.physics);
		this.context.ladders = this.ladderLoader.getLadders(this.physics, this.make, this.add);
		this.context.exit = this.objectFactory.createExit(this.physics);

		this.context.input = this.scene.get('ui') as UIOverlayScene;

		//Setup camera
		this.cameras.main.setSize(Constants.screen.width, Constants.layout.gameplay.height);
		this.cameras.main.setBounds(0, 0, Constants.screen.width, Constants.world.height);
		this.physics.world.setBounds(1, 1, Constants.screen.width - 2, Constants.world.height - 2, true, true, true, true);

		this.physicsController = new PhysicsController(this.context);
		this.collisionController = new CollisionController(this.physics, this.context);
		this.collisionController.setupCollisionDetection();
		this.graphicsController = new GraphicsController(this.context);

		this.setupNewGame();

		console.debug("EHIGHT:", this.sys.game.canvas.height);
		console.debug("EHIGHT:", getComputedStyle(document.documentElement).getPropertyValue("--sat"));
	}

	update(time: number, delta: number) {
		if (this.targetTimeScale != this.physics.world.timeScale)
			this.updateTimescale(delta);

		//Check if player is dead and update should be skipped
		if (this.isPlayerDead(delta))
			return;

		this.generateBuckets(delta);

		//Update camera to follow player
		this.cameras.main.setBounds(0, this.getCameraY(), Constants.screen.width, Constants.screen.height);
		this.physicsController.update(delta);
		this.graphicsController.update();

		// DEBUG_CONTROLLER.setValue('V', this.context.player.body.velocity.x, false)
		// DEBUG_CONTROLLER.setValue('G', this.context.isGrounded)
		// DEBUG_CONTROLLER.setValue('J', this.context.isJumping)
		// DEBUG_CONTROLLER.setValue('T', this.context.isTouchingLadder)
		// DEBUG_CONTROLLER.setValue('C', this.context.isClimbing)
		// // DEBUG_CONTROLLER.setValue('F', this.player.body.allowGravity)
		// DEBUG_CONTROLLER.setValue('O', this.context.isOnTopOfLadder)

		this.context.resetLadderValues();
	}

	private updateTimescale(delta: number) {
		let diff = this.targetTimeScale - this.physics.world.timeScale;

		if (Math.abs(diff) < 0.3) {
			this.physics.world.timeScale = this.targetTimeScale;
			this.anims.globalTimeScale = this.targetTimeScale;
			return;
		}

		let accelRate = 0.5;
		let movement = Math.pow(Math.abs(diff) * accelRate, 0.5) * Math.sign(diff);
		this.physics.world.timeScale += movement;
		this.anims.globalTimeScale = this.physics.world.timeScale;
	}

	private isPlayerDead(delta: number): boolean {
		if (!this.context.alive) {
			this.graphicsController.update();
			this.timerDeath -= delta;

			if (this.timerDeath < 250 && this.physics.world.timeScale != 1) {
				this.targetTimeScale = 1;
			}

			if (this.timerDeath <= 0)
				this.scene.launch('gameover');

			return true;
		}
		return false;
	}

	public onHit(enemy: SpriteWithDynamicBody) {
		if (!this.context.alive)
			return;

		this.context.alive = false;

		//Slow down time
		this.targetTimeScale = 8;

		const corpse = this.objectFactory.createPlayerCorpse(this.physics, this.context);

		//Add some forces away from the collision to the corpse and the colliding bucket
		enemy.setVelocityY(-100);
		if (enemy.body.x > this.context.player.body.x) {
			corpse.setVelocityX(-75);
			enemy.setVelocityX(65);
			corpse.setFlipX(true);
		} else {
			corpse.setVelocityX(75);
			enemy.setVelocityX(-65);
			corpse.setFlipX(false);
		}

		this.context.destroyPlayer();
	}

	private generateBuckets(delta: number) {
		this.timerNextBucket -= delta;
		if (this.timerNextBucket <= 0) {
			var bucket = this.objectFactory.createBucket(this.context.buckets);
			bucket.x = -5;
			bucket.y = 820;
			this.timerNextBucket += (Math.random() * 1000) + 1500;
		}
	}

	public setupNewGame() {
		this.running = true;
		this.context.reset();
		this.timerDeath = 2000;
		this.timerNextBucket = 2000;
		this.context.player = this.objectFactory.createPlayer(this.physics);
		this.collisionController.createPlayerColliders();
	}

	private getCameraY(): number {
		return Math.min(Constants.world.height - Constants.layout.gameplay.height, this.context.player.y - ((Constants.layout.gameplay.height) / 2) - this.context.player.height);
	}

	public onExit() {
		this.context.destroyPlayer();
		this.context.alive = false;
		this.running = false;
		this.scene.launch('gameover');
	}
}
