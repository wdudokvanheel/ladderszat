import Phaser from 'phaser';
import Constants from '../assets/data/constants.yml'
import LevelData from '../assets/data/levels/*.json'
import CollisionController from '../controller/CollisionController';
import GraphicsController from '../controller/GraphicsController';
import {PhysicsController} from '../controller/PhysicsController';
import {ObjectFactory} from '../factory/ObjectFactory';
import {LadderLoader} from '../loader/LadderLoader';
import {PlatformLoader} from '../loader/PlatformLoader';
import GameContext from '../model/GameContext';
import {MixerSprite} from '../model/MixerSprite';
import {UIOverlayScene} from './UIOverlayScene';
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import SpriteWithStaticBody = Phaser.Types.Physics.Arcade.SpriteWithStaticBody;

export class GameplayScene extends Phaser.Scene {
	private platformLoader: PlatformLoader;
	private ladderLoader: LadderLoader;
	private objectFactory: ObjectFactory;

	private physicsController: PhysicsController;
	private collisionController: CollisionController;
	private graphicsController: GraphicsController;

	private timerNextBucket;
	private timerDeath;

	private playing = true;
	private readonly context: GameContext;
	private targetTimeScale = 1;

	constructor() {
		super('gameplay')
	}

	preload() {
		this.context.gameplay = this;
		this.platformLoader = new PlatformLoader();
		this.ladderLoader = new LadderLoader();
		this.objectFactory = new ObjectFactory();
	}

	create() {
		this.physicsController = new PhysicsController(this.context);
		this.collisionController = new CollisionController(this.physics, this.context);
		this.graphicsController = new GraphicsController(this.context);

		this.context.input = this.scene.get('ui') as UIOverlayScene;

		this.initLevel();
	}

	private loadLevelData() {
		this.context.leveldata = LevelData['level-' + this.context.level];
		console.debug('Loading data for level ' + this.context.level + ': ' + this.context.leveldata.name);

		//Create game objects
		this.add.sprite(0, Constants.world.height, "bg-level-" + this.context.level).setOrigin(0, 1);

		this.context.buckets = this.physics.add.group();
		this.context.platforms = this.platformLoader.createPlatforms(this.physics, this.context.leveldata.platforms);
		this.context.ladders = this.ladderLoader.createLadders(this.physics, this.make, this.add, this.textures, this.context.leveldata.ladders);
		this.context.exit = this.objectFactory.createExit(this.physics, this.context.leveldata.exit);
		this.context.collectibles = this.objectFactory.createCollectibles(this.physics, this.add, this.context);
	}

	private initLevel() {
		console.debug('Initializing gameplay scene');
		this.context.reset();
		this.loadLevelData();
		this.context.player = this.objectFactory.createPlayer(this.physics);
		this.context.player.setPosition(this.context.leveldata.start.x, Constants.world.height - this.context.leveldata.start.y);

		this.collisionController.setupCollisionDetection();
		this.collisionController.createPlayerColliders();

		//Setup camera
		this.cameras.main.setSize(Constants.screen.width, Constants.layout.gameplay.height);
		this.cameras.main.setBounds(0, 0, Constants.screen.width, Constants.world.height);

		//Set timescale
		this.targetTimeScale = 1;
		this.physics.world.timeScale = 1;
		this.anims.globalTimeScale = 1;

		this.playing = true;
		this.timerDeath = 2000;
		this.timerNextBucket = 2000;
		this.input.on('pointerdown', (e) => console.log('Click @ ', Math.round(e.worldX - .5), Math.round((Constants.world.height - e.worldY - .5))));
	}

	update(time: number, delta: number) {
		this.context.jumpInput = this.context.input.getJumpInput();

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

		this.context.collectibles.runChildUpdate = true;
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
		if (!this.context.isAlive) {
			this.graphicsController.update();
			this.timerDeath -= delta;

			if (this.timerDeath < 250 && this.physics.world.timeScale != 1) {
				this.targetTimeScale = 1;
			}

			if (this.timerDeath <= 0 && this.playing) {
				this.playing = false;
				this.scene.launch('gameover');
			}

			return true;
		}
		return false;
	}

	public onHit(player: SpriteWithDynamicBody, enemy: SpriteWithDynamicBody) {
		if (!this.context.isAlive)
			return;

		this.context.isAlive = false;

		//Slow down time
		this.targetTimeScale = 8;
		const corpse = this.objectFactory.createPlayerCorpse(this.physics, this.context);

		//Add some forces away from the collision to the corpse and the colliding bucket
		enemy.setVelocityY(-150);
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
		let mixer = this.context.getObjectByName('mixer') as MixerSprite;
		if (!mixer)
			return;

		this.timerNextBucket -= delta;
		if (this.timerNextBucket <= 0) {
			let bucket = this.objectFactory.createBucket(this.context.buckets, mixer.getData('color'));
			mixer.resetMixing()
			bucket.x = 19;
			bucket.y = Constants.world.height - 200
			this.timerNextBucket += (Math.random() * 500) + 2000;
		}
	}

	private getCameraY(): number {
		return Math.min(Constants.world.height - Constants.layout.gameplay.height, this.context.player.y - ((Constants.layout.gameplay.height) / 2) - this.context.player.height);
	}

	public onExit() {
		this.context.level = 2;
		this.context.destroyPlayer();
		this.context.isAlive = false;
		this.playing = false;
		this.scene.launch('gameover');
	}

	onCollect(player: SpriteWithDynamicBody, object: SpriteWithStaticBody) {
		if (object.getData('collect') === 'coin') {
			object.destroy();
			this.context.score += 100;
		} else if (object.getData('collect') === 'key') {
			object.destroy();
			this.context.score += 500;
		}
	}
}
