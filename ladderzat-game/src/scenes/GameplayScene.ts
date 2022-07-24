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

	private nextBucket = 0;

	private running = true;
	private readonly context: GameContext;

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

		this.context.player = this.objectFactory.createPlayer(this.physics);
		this.context.input = this.scene.get('ui') as UIOverlayScene;

		//Setup camera
		this.cameras.main.setSize(Constants.screen.width, Constants.layout.gameplay.height);
		this.cameras.main.setBounds(0, 0, Constants.screen.width, Constants.world.height);
		this.physics.world.setBounds(0, 0, Constants.screen.width, Constants.world.height, true, true, true, true);

		this.physicsController = new PhysicsController(this.context);
		this.collisionController = new CollisionController(this.physics, this.context);
		this.collisionController.setupCollisionDetection();
		this.graphicsController = new GraphicsController(this.context);
	}

	update(time: number, delta: number) {
		if (!this.running) {
			this.graphicsController.update();
			return;
		}

		this.generateBuckets(delta);

		//Update camera to follow player
		this.cameras.main.setBounds(0, this.getCameraY(), Constants.screen.width, Constants.screen.height);
		this.physicsController.update(delta);
		this.graphicsController.update();

		// DEBUG_CONTROLLER.setValue('A', this.context.alive)
		// DEBUG_CONTROLLER.setValue('G', this.context.isGrounded)
		// DEBUG_CONTROLLER.setValue('J', this.context.isJumping)
		// DEBUG_CONTROLLER.setValue('T', this.context.isTouchingLadder)
		// DEBUG_CONTROLLER.setValue('C', this.context.isClimbing)
		// // DEBUG_CONTROLLER.setValue('F', this.player.body.allowGravity)
		// DEBUG_CONTROLLER.setValue('O', this.context.isOnTopOfLadder)

		this.context.resetLadderValues();
	}

	public onHit(enemy: SpriteWithDynamicBody) {
		this.running = false;
		this.context.alive = false;

		var sprite = this.physics.add.sprite(this.context.player.x, this.context.player.y, "kris-dead") as SpriteWithDynamicBody;
		sprite.anims.playAfterDelay("kris-dead", 250);
		this.context.buckets.add(sprite, false);

		sprite.body.setSize(sprite.width, sprite.height - 1);
		sprite.body.setAllowDrag(true);
		sprite.body.setDragX(0.05);
		sprite.body.setDamping(true);
		sprite.refreshBody();

		enemy.setVelocityY(-100);
		sprite.setVelocityY(-50);

		//Enemy is on the right
		if (enemy.body.x > this.context.player.body.x) {
			sprite.setVelocityX(-65);
			enemy.setVelocityX(50);
			sprite.setFlipX(true);
		} else {
			sprite.setVelocityX(65);
			enemy.setVelocityX(-50);
			sprite.setFlipX(false);
		}

		this.context.destroyPlayer();
		this.scene.launch('gameover');
	}

	private generateBuckets(delta: number) {
		this.nextBucket -= delta;
		if (this.nextBucket <= 0) {
			var bucket = this.objectFactory.createBucket(this.context.buckets);
			bucket.x = Math.random() * 190;
			bucket.x = 50;
			if (Math.random() > .5) {
				bucket.x = 150;
				bucket.setVelocityX(-50);
			}

			bucket.y = 800;
			this.nextBucket += (Math.random() * 500) + 1000;
		}
	}

	public reset() {
		this.running = true;
		this.context.reset();
		this.context.player = this.objectFactory.createPlayer(this.physics);
		this.collisionController.createPlayerColliders();
	}

	private getCameraY(): number {
		return Math.min(Constants.world.height - Constants.layout.gameplay.height, this.context.player.y - ((Constants.layout.gameplay.height) / 2) - this.context.player.height);
	}
}
