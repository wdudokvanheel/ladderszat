import ArcadePhysics = Phaser.Physics.Arcade.ArcadePhysics;
import Group = Phaser.Physics.Arcade.Group;
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import Constants from '../assets/data/constants.yml';
import {GameplayScene} from '../scenes/GameplayScene';
import {UIOverlayScene} from '../scenes/UIOverlayScene';

export class PhysicsController {
	private gameplay: GameplayScene;
	private physics: ArcadePhysics;
	private ui: UIOverlayScene;

	private readonly player: SpriteWithDynamicBody;
	private readonly platforms: StaticGroup;
	private readonly ladders: StaticGroup;
	private readonly buckets: Group;

	private onLadder = false;
	private touchingLadder = undefined;
	private isJumping = true;
	private timeInAir = 0;

	constructor(gameplay: GameplayScene, ui: UIOverlayScene, player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, platforms: Phaser.Physics.Arcade.StaticGroup, ladders: Phaser.Physics.Arcade.StaticGroup, buckets: Phaser.Physics.Arcade.Group) {
		this.gameplay = gameplay;
		this.physics = gameplay.physics;
		this.ui = ui;
		this.player = player;
		this.platforms = platforms;
		this.ladders = ladders;
		this.buckets = buckets;
	}

	public update(delta: number) {
		this.updatePlayerVelocity();
		this.updatePlayerJumping();

		this.updateInAirTimer(delta);
		this.updatePlayerGravityOnLadder();
	}

	public setupCollisionDetection() {
		//Just a check if a player is on a ladder
		this.physics.add.overlap(this.player, this.ladders, this.onLadderCheck, null, this);

		//Collider for player -> platforms
		this.physics.add.collider(this.player, this.platforms, undefined, this.doesPlatformCollide, this);

		//Overlap collider for ladders to disable gravity when on ladder
		this.physics.add.overlap(this.player, this.ladders, this.onLadderOverlap, null, this);

		//Collider to be able to stand on the top of a ldder
		this.physics.add.collider(this.player, this.ladders, null, this.isLadderBlocking, this);

		//Collider for buckets and platform
		this.physics.add.collider(this.buckets, this.platforms, function (bucket: SpriteWithDynamicBody) {
			if (bucket.body.y > Constants.world.height - 24)
				bucket.body.setCollideWorldBounds(false);
		});

		this.physics.add.collider(this.buckets, this.buckets);

		this.physics.add.collider(this.player, this.buckets, function (player: SpriteWithDynamicBody, bucket: SpriteWithDynamicBody) {
			this.gameplay.onHit(bucket);
		}, null, this);
	}

	private isLadderBlocking(player: SpriteWithDynamicBody, ladder: SpriteWithDynamicBody): boolean {
		const segment = ladder.data.values['segment'];
		const playerY = Math.floor(player.y + player.height);
		const ladderY = ladder.y;

		if (player.y + player.height <= ladder.y - ladder.height && this.ui.getVerticalDirection() != 'down')
			return true;
		if (playerY > ladderY && segment == 0)
			return true;

		return false;
	}

	private doesPlatformCollide(player, platform): boolean {
		// if (player.y + player.height < platform.y)
		// 	return false;

		if (this.player.body.velocity.y <= 0)
			return false;

		//Only collide if on a ladder that doesn't go through the platform
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


	private updatePlayerGravityOnLadder() {
		if (!this.onLadder && !this.player.body.allowGravity)
			this.player.body.setAllowGravity(true);
		else if (this.onLadder && this.isJumping)
			this.player.body.setAllowGravity(true);

		this.onLadder = false;
		this.touchingLadder = undefined;
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
			if (vert == undefined)
				this.player.setVelocityY(0);
			else if (vert == 'up' && this.player.y + this.player.height > this.touchingLadder.y - this.touchingLadder.height) {
				this.player.setVelocityY(-Constants.player.speed.ladder.up);
			} else if (vert == 'down')
				this.player.setVelocityY(Constants.player.speed.ladder.down);
		}
	}

	private updatePlayerJumping() {
		if (this.player.body.touching.down && this.isJumping)
			this.isJumping = false;

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

	private updateInAirTimer(delta: number) {
		if (this.player.body.touching.down) {
			this.timeInAir = 0;
			return;
		}

		this.timeInAir += delta;
	}
}
