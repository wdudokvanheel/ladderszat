import Phaser from 'phaser';
import Constants from '../assets/data/constants.yml'
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

	private onLadder = false;
	private touchingLadder = undefined;
	private isJumping = true;
	private timeInAir = 0;
	private nextBucket = 2000;

	private count = 0;

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

		this.setupCollisionDetection();
	}

	private setupCollisionDetection() {
		//Setup collision with player
		const game = this;
		// this.physics.add.overlap(this.player, this.ladders, this.onLadderOverlap, null, this);

		this.physics.add.overlap(this.player, this.ladders, this.onLadderCheck, null, this);

		this.physics.add.collider(this.player, this.platforms, undefined, this.doesPlatformCollide, this);
		this.physics.add.overlap(this.player, this.ladders, this.onLadderOverlap, null, this);

		this.physics.add.collider(this.player, this.ladders, function () {
		}, this.isLadderBlocking, this);

		this.physics.add.collider(this.buckets, this.platforms, function (bucket: SpriteWithDynamicBody) {
			if (bucket.body.y > Constants.world.height - 24)
				bucket.body.setCollideWorldBounds(false);
		});
	}

	private isLadderBlocking(player: SpriteWithDynamicBody, ladder: SpriteWithDynamicBody): boolean {
		const segment = ladder.data.values['segment'];
		const playerY = Math.floor(player.y + player.height);
		const ladderY = ladder.y;

		if (player.y + player.height <= ladder.y - ladder.height && this.ui.getVerticalDirection() != 'down')
			return true;
		if (playerY > ladderY && segment == 0) {
			return true;
		}

		return false;
	}

	private doesPlatformCollide(player, platform): boolean {
		if (player.y + player.height < platform.y)
			return false;

		if (this.player.body.velocity.y <= 0)
			return false;

		if (this.onLadder && (this.touchingLadder.data.get('segment') != 0 || (this.player.y + this.player.height < this.touchingLadder.y)))
			return false;

		return true;
	}

	private onLadderCheck(player: SpriteWithDynamicBody, ladder: SpriteWithDynamicBody) {
		this.onLadder = true;
		this.touchingLadder = ladder;
	}

	private onLadderOverlap() {
		if (!this.isJumping)
			this.player.body.setAllowGravity(false);
		else {
			if (this.isJumping && this.player.body.velocity.y > 0)
				this.player.setVelocityY(0);
		}
		return true;
	}

	update(time: number, delta: number) {
		this.count++;
		this.generateBuckets(delta);

		this.updatePlayerVelocity();
		this.updatePlayerJumping();

		//Update camera to follow player
		this.cameras.main.setBounds(0, this.getCameraY(), Constants.screen.width, Constants.screen.height);

		this.updateInAirTimer(delta);
		this.updatePlayerGravityOnLadder();

	}

	private generateBuckets(delta: number) {
		this.nextBucket -= delta;
		if (this.nextBucket <= 0) {
			this.objectFactory.createBucket(this.buckets);
			this.nextBucket += (Math.random() * 1000) + 1000;
		}
	}


	private updatePlayerGravityOnLadder() {
		if (!this.onLadder && !this.player.body.allowGravity)
			this.player.body.setAllowGravity(true);
		else if (this.onLadder && this.isJumping)
			this.player.body.setAllowGravity(true);

		this.onLadder = false;
		this.touchingLadder = undefined;
	}

	private updatePlayerJumping() {
		if (this.player.body.touching.down && this.isJumping) {
			this.isJumping = false;
		}

		if (this.isJumping)
			return;

		if (this.ui.isJumping()) {
			if (!this.onLadder && (this.player.body.touching.down || this.timeInAir <= Constants.jump.inairpass))
				this.performJump();
			if (this.onLadder && !this.isJumping) {
				this.performJump();
			}
		}
	}

	private performJump() {
		this.isJumping = true;
		this.player.setVelocityY(-Constants.player.jump.power);
	}

	private updatePlayerVelocity() {
		const horiz = this.ui.getHorizontalDirection();
		const vert = this.ui.getVerticalDirection();

		if (horiz != undefined) {
			if (horiz === 'left')
				this.player.setVelocityX(-Constants.player.speed.walk);
			else
				this.player.setVelocityX(Constants.player.speed.walk);
		} else
			this.player.setVelocityX(0);

		if (this.onLadder && !this.isJumping) {
			if (vert == undefined) {
				this.player.setVelocityY(0);
			} else if (vert == 'up') {
				if (this.player.y + this.player.height > this.touchingLadder.y - this.touchingLadder.height)
					this.player.setVelocityY(-Constants.player.speed.ladder.up);
			} else if (vert == 'down')
				this.player.setVelocityY(Constants.player.speed.ladder.down);
		}
	}

	private getCameraY(): number {
		return Math.min(Constants.world.height - Constants.layout.gameplay.height, this.player.y - ((this.player.height + Constants.layout.gameplay.height) / 2));
	}

	private updateInAirTimer(delta: number) {
		if (this.player.body.touching.down) {
			this.timeInAir = 0;
			return;
		}

		this.timeInAir += delta;
	}
}
