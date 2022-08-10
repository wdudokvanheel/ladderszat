import Phaser from 'phaser';
import Constants from '../assets/data/constants.yml'
import CollisionController from '../controller/CollisionController';
import GraphicsController from '../controller/GraphicsController';
import {PhysicsController} from '../controller/PhysicsController';
import {ObjectFactory} from '../factory/ObjectFactory';
import {LevelDataLoader} from '../loader/LevelDataLoader';
import Level1 from '../logic/Level1';
import Level2 from '../logic/Level2';
import Level3 from '../logic/Level3';
import GameContext from '../model/GameContext';
import {UIOverlayScene} from './UIOverlayScene';
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import SpriteWithStaticBody = Phaser.Types.Physics.Arcade.SpriteWithStaticBody;

export class GameplayScene extends Phaser.Scene {
	private objectFactory: ObjectFactory;
	private levelLoader: LevelDataLoader;

	private physicsController: PhysicsController;
	private collisionController: CollisionController;
	private graphicsController: GraphicsController;

	private levelLogic = [];

	private readonly context: GameContext;
	private playing = true;
	private timerDeath;
	private targetTimeScale = 1;

	constructor() {
		super('gameplay')
		this.levelLogic.push(new Level1(), new Level2(), new Level3());
	}

	preload() {
		this.context.gameplay = this;
	}

	create() {
		this.levelLoader = new LevelDataLoader();
		this.objectFactory = new ObjectFactory();
		this.physicsController = new PhysicsController(this.context);
		this.collisionController = new CollisionController(this.physics, this.context);
		this.graphicsController = new GraphicsController(this.context);

		this.context.input = this.scene.get('ui') as UIOverlayScene;

		this.initLevel();
	}

	private initLevel() {
		console.debug('Initializing gameplay scene');
		this.context.reset();
		this.levelLoader.loadLevelDataToContext(this.context, this.physics, this.make, this.add, this.textures);

		//Init level-specific logic
		this.levelLogic.forEach(logic => {
			if (logic.level == this.context.level)
				logic.init(this.context, this.add);
		});

		//Setup collision handling
		this.collisionController.setupCollisionDetection();
		this.collisionController.createPlayerColliders();

		//Setup camera
		this.cameras.main.setSize(Constants.screen.width, Constants.layout.gameplay.height);
		this.cameras.main.setBounds(0, 0, Constants.screen.width, Constants.world.height);

		//Set timescale values
		this.targetTimeScale = 1;
		this.physics.world.timeScale = 1;
		this.anims.globalTimeScale = 1;

		this.playing = true;
		this.timerDeath = 2000;
		this.input.on('pointerdown', (e) => console.log('Click @ ', Math.round(e.worldX - .5), Math.round((Constants.world.height - e.worldY - .5))));
	}

	update(time: number, delta: number) {
		this.context.jumpInput = this.context.input.getJumpInput();

		if (this.targetTimeScale != this.physics.world.timeScale)
			this.updateTimescale(delta);

		//Check if player is dead and update should be skipped
		if (this.isPlayerDead(delta))
			return;

		//Update level specific logic
		this.updateLevelLogic(delta);

		//Check if still alive after level logic
		if (!this.context.isAlive)
			return;

		//Update camera to follow player
		this.cameras.main.setBounds(0, this.getCameraY(), Constants.screen.width, Constants.screen.height);

		this.physicsController.update(delta);
		this.graphicsController.update();

		//Reset values so Phaser's collision system can rewrite the values before the next update
		this.context.resetCollisionValues();
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

	private getCameraY(): number {
		return Math.min(Constants.world.height - Constants.layout.gameplay.height, this.context.player.y - ((Constants.layout.gameplay.height) / 2) - this.context.player.height);
	}

	public onExit() {
		this.context.destroyPlayer();
		this.context.isAlive = false;
		this.playing = false;
		this.scene.launch('levelcomplete');
	}

	onCollect(player: SpriteWithDynamicBody, object: SpriteWithStaticBody) {
		var type = object.getData('collect');
		if (!type)
			return;

		if (type === 'coin') {
			object.destroy();
			this.context.score += 100;
		} else if (type === 'key' || object.getData('collect') === 'mic' || object.getData('collect') === 'speakers' || object.getData('collect') === 'guitar-purple') {
			this.collectProgressItem();
			object.destroy();
			this.context.score += 500;
		} else if (type === 'drink') {
			object.destroy();
			this.context.drunk += .1;
			this.collectProgressItem();
		}
	}

	private collectProgressItem() {
		if (!this.context.leveldata.progressCollectibles)
			return;

		let delta = (this.context.getMaxProgressionForLevel(this.context.level) - this.context.getMinProgressionForLevel(this.context.level)) / (this.context.leveldata.progressCollectibles + 1);
		this.context.progress += delta;
	}

	private updateLevelLogic(delta: number) {
		this.levelLogic.forEach(logic => {
			if (logic.level == this.context.level)
				logic.update(this.context, delta);
		});
	}
}
