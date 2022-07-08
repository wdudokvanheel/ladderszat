import Phaser from 'phaser';
import Constants from '../assets/data/constants.yml'
import {ObjectFactory} from '../factory/ObjectFactory';
import {LadderLoader} from '../loader/LadderLoader';
import {PlatformLoader} from '../loader/PlatformLoader';
import {UIScene} from './UIScene';
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export class GameplayScene extends Phaser.Scene {
	private platformLoader: PlatformLoader;
	private ladderLoader: LadderLoader;
	private objectFactory: ObjectFactory;

	private player: SpriteWithDynamicBody;
	private ui: UIScene;

	private onLadder = false;
	private isJumping = true;

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
		//Create game objects
		const platforms = this.platformLoader.getPlatforms(this.physics);
		const ladders = this.ladderLoader.getLadders(this.physics);

		this.player = this.objectFactory.createPlayer(this.physics);
		this.ui = this.scene.get('ui') as UIScene;

		//Setup collision with player
		const game = this;
		this.physics.add.overlap(this.player, ladders, this.onLadderOverlap, null, this);
		this.physics.add.collider(this.player, platforms, undefined, function () {
			return game.check();
		});
	}

	private check(): boolean {
		if (this.onLadder || this.player.body.velocity.y < 0)
			return false
		return true;
	}

	private onLadderOverlap() {
		this.onLadder = true;
		if (!this.isJumping)
			this.player.body.setAllowGravity(false);
	}

	update(time: number, delta: number) {
		this.count++;
		this.updatePlayerVelocity();
		this.updatePlayerJumping();

		if (!this.onLadder && !this.player.body.allowGravity)
			this.player.body.setAllowGravity(true);
		else if (this.onLadder && this.isJumping)
			this.player.body.setAllowGravity(true);

		this.onLadder = false;
	}

	private updatePlayerJumping() {
		if (this.player.body.touching.down && this.isJumping) {
			this.isJumping = false;
		}

		if (this.isJumping)
			return;

		if (this.ui.isJumping()) {
			if (!this.onLadder && this.player.body.touching.down)
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
			} else if (vert == 'up')
				this.player.setVelocityY(-Constants.player.speed.ladder.up);
			else if (vert == 'down')
				this.player.setVelocityY(Constants.player.speed.ladder.down);
		}
	}
}
