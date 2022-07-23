import ArcadePhysics = Phaser.Physics.Arcade.ArcadePhysics;
import Group = Phaser.Physics.Arcade.Group;
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import Constants from '../assets/data/constants.yml';
import {GameplayScene} from '../scenes/GameplayScene';
import {UIOverlayScene} from '../scenes/UIOverlayScene';
import {DEBUG_CONTROLLER} from './DebugController';

export class PhysicsController {
	private gameplay: GameplayScene;
	private physics: ArcadePhysics;
	private ui: UIOverlayScene;

	public  readonly player: SpriteWithDynamicBody;
	private readonly platforms: StaticGroup;
	private readonly ladders: StaticGroup;
	private readonly buckets: Group;

	public isGrounded = false;
	public isJumping = false;
	public isTouchingLadder = false;
	public isOnTopOfLadder = false;
	public isClimbing = false;

	private touchingLadder = undefined;
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
		this.isGrounded = this.player.body.blocked.down || this.player.y >= Constants.world.height - this.player.height;

		this.updatePlayerVelocity();
		this.updatePlayerJumping();

		this.updateInAirTimer(delta);
		this.updatePlayerGravityOnLadder();

		DEBUG_CONTROLLER.setValue('G', this.isGrounded)
		DEBUG_CONTROLLER.setValue('J', this.isJumping)
		DEBUG_CONTROLLER.setValue('T', this.isTouchingLadder)
		DEBUG_CONTROLLER.setValue('C', this.isClimbing)
		// DEBUG_CONTROLLER.setValue('F', this.player.body.allowGravity)
		DEBUG_CONTROLLER.setValue('O', this.isOnTopOfLadder)
	}

	//Call on end of update cycle to reset values (so the collision system can set them again)
	public reset(){
		this.touchingLadder = undefined;
		this.isTouchingLadder = false;
		this.isOnTopOfLadder = false;
	}

	private onLadderCheck(player: SpriteWithDynamicBody, ladder: SpriteWithDynamicBody) {
		this.isTouchingLadder = true;
		this.touchingLadder = ladder;

		if (player.y + player.height <= ladder.y - ladder.height) {
			this.isOnTopOfLadder = true;
		}
	}

	private updatePlayerVelocity() {
		const horiz = this.ui.getHorizontalDirection();
		const vert = this.ui.getVerticalDirection();

		if (horiz != undefined) {
			if (!this.isClimbing || (this.player.body.velocity.y == 0)) {
				if (horiz === 'left')
					this.player.setVelocityX(-Constants.player.speed.walk);
				else
					this.player.setVelocityX(Constants.player.speed.walk);

				if (this.isClimbing) {
					this.player.body.velocity.y = -100;
					this.isJumping = true;
					this.isClimbing = false;
				}
			}
		} else
			this.player.setVelocityX(0);


		if (this.ui.getVerticalDirection() != undefined) {
			if (!this.isClimbing && this.isTouchingLadder) {
				//Check if not standing on top of a ladder trying to go up further
				if (!this.isOnTopOfLadder || this.ui.getVerticalDirection() === "down") {
					if (this.ui.getVerticalDirection() === "down" || (this.ui.getVerticalDirection() === "up" && this.player.body.velocity.y > -60))
						this.startClimbing();
				}
			}
		}

		if (this.isClimbing && (!this.isTouchingLadder || this.touchingLadder == undefined)) {
			this.isClimbing = false;
		}

		if (this.isClimbing && !this.isJumping) {
			if (vert == undefined)
				this.player.setVelocityY(0);
			else if (vert == 'up') {
				if (this.isOnTopOfLadder)
					this.player.setVelocityY(0);
				else
					this.player.setVelocityY(-Constants.player.speed.ladder.up);
			} else if (vert == 'down') {
				this.player.setVelocityY(Constants.player.speed.ladder.down);
			}
		}

		if (this.player.body.velocity.x > 0)
			this.player.setFlipX(false);
		else if (this.player.body.velocity.x < 0)
			this.player.setFlipX(true);
	}

	private startClimbing() {
		this.isClimbing = true;
		this.isJumping = false;
		this.player.setVelocityY(0);
		this.player.setVelocityX(0);
	}

	private updatePlayerJumping() {
		if (this.isGrounded && this.isJumping)
			this.isJumping = false;

		if (this.isJumping)
			return;

		if (this.ui.isJumping()) {
			//Allow jumping when grounded, but allow a little margin of error
			if (this.isGrounded || this.timeInAir <= Constants.jump.inairpass) {
				//Only allow jumping if climbing up
				if (!this.isClimbing || this.player.body.velocity.y <= 0)
					this.performJump();
			}
		}
	}

	public setupCollisionDetection() {
		//Just a check if a player is on a ladder
		this.physics.add.overlap(this.player, this.ladders, this.onLadderCheck, null, this);

		//Collider for player -> platforms
		this.physics.add.collider(this.player, this.platforms, undefined, this.isPlatformBlocking, this);

		//Collider to be able to stand on the top of a ladder
		this.physics.add.collider(this.player, this.ladders, null, this.isLadderBlocking, this);

		//Collider for buckets and platform
		this.physics.add.collider(this.buckets, this.platforms, function (bucket: SpriteWithDynamicBody) {
			if (bucket.body.y > Constants.world.height - 24)
				bucket.body.setCollideWorldBounds(false);
		});

		// this.physics.add.collider(this.buckets, this.buckets);
		this.physics.add.collider(this.player, this.buckets, function (player: SpriteWithDynamicBody, bucket: SpriteWithDynamicBody) {
			this.gameplay.onHit(bucket);
		}, null, this);
	}

	private updatePlayerGravityOnLadder() {
		if (!this.isClimbing && !this.player.body.allowGravity)
			this.player.body.setAllowGravity(true);

		if (this.isClimbing)
			this.player.body.setAllowGravity(false);
	}

	private isLadderBlocking(player: SpriteWithDynamicBody, ladder: SpriteWithDynamicBody): boolean {
		if (this.isOnTopOfLadder && this.ui.getVerticalDirection() != 'down')
			return true;

		return false;
	}

	private isPlatformBlocking(player, platform): boolean {
		//Block during climbing, but only if ladder is above platform to prevent the player from falling through ladders on going down
		if (this.touchingLadder && this.touchingLadder.y <= platform.y) {
			this.isClimbing = false;
			return true;
		}

		if (this.isClimbing && this.touchingLadder && this.touchingLadder.y)
			return false;

		//Platform must be at be lower than the middle of the player
		if (player.y + (player.height * .75) < platform.y) {
			if (player.body.velocity.y > 0)
				return true;
		}

		return false;
	}

	public restart() {
		this.isJumping = false;
		this.timeInAir = 0;
		this.touchingLadder = false;
		this.isTouchingLadder = false;
	}

	private performJump() {
		this.isJumping = true;
		this.isClimbing = false;
		this.player.setVelocityY(-Constants.player.jump.power);
	}

	private updateInAirTimer(delta: number) {
		if (this.player.body.touching.down || this.isClimbing) {
			this.timeInAir = 0;
			return;
		}

		this.timeInAir += delta;
	}
}
