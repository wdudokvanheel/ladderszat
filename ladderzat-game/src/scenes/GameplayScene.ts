import Phaser from 'phaser';
import Constants from '../assets/data/constants.yml'
import {PhysicsController} from '../controller/PhysicsController';
import {ObjectFactory} from '../factory/ObjectFactory';
import {LadderLoader} from '../loader/LadderLoader';
import {PlatformLoader} from '../loader/PlatformLoader';
import {UIOverlayScene} from './UIOverlayScene';
import Group = Phaser.Physics.Arcade.Group;
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export class GameplayScene extends Phaser.Scene {
	private platformLoader: PlatformLoader;
	private ladderLoader: LadderLoader;
	private objectFactory: ObjectFactory;

	private player: SpriteWithDynamicBody;
	private platforms: StaticGroup;
	private ladders: StaticGroup;
	private buckets: Group;
	private ui: UIOverlayScene;

	private physicsController: PhysicsController;

	private nextBucket = 2000;

	private running = true;

	constructor() {
		super('gameplay')
	}

	preload() {
		this.platformLoader = new PlatformLoader();
		this.ladderLoader = new LadderLoader();
		this.objectFactory = new ObjectFactory();
	}

	create() {
		this.buckets = this.physics.add.group();

		//Create game objects
		this.platforms = this.platformLoader.getPlatforms(this.physics);
		this.ladders = this.ladderLoader.getLadders(this.physics);

		this.player = this.objectFactory.createPlayer(this.physics);
		this.ui = this.scene.get('ui') as UIOverlayScene;

		//Setup camera
		this.cameras.main.setSize(Constants.screen.width, Constants.layout.gameplay.height);
		this.cameras.main.setBounds(0, 0, Constants.screen.width, Constants.world.height);
		this.physics.world.setBounds(0, 0, Constants.screen.width, Constants.world.height, true, true, true, true);

		this.physicsController = new PhysicsController(this, this.ui, this.player, this.platforms, this.ladders, this.buckets);
		this.physicsController.setupCollisionDetection();
	}

	update(time: number, delta: number) {
		if (!this.running) {
			this.physics.disableUpdate();
			return;
		}

		this.generateBuckets(delta);

		//Update camera to follow player
		this.cameras.main.setBounds(0, this.getCameraY(), Constants.screen.width, Constants.screen.height);
		this.physicsController.update(delta);
	}

	public onHit(enemy: SpriteWithDynamicBody) {
		this.running = false;
		this.scene.launch('gameover');
	}

	private generateBuckets(delta: number) {
		this.nextBucket -= delta;
		if (this.nextBucket <= 0) {
			var bucket = this.objectFactory.createBucket(this.buckets);
			bucket.x = Math.random() * 190;
			bucket.y = 400;
			this.nextBucket += (Math.random() * 2000) + 1000;
		}
	}

	public reset() {
		this.running = true;
		this.physicsController.reset();
	}

	private getCameraY(): number {
		return Math.min(Constants.world.height - Constants.layout.gameplay.height, this.player.y - ((Constants.layout.gameplay.height) / 2) - this.player.height);
	}
}
