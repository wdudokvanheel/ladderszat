import ArcadePhysics = Phaser.Physics.Arcade.ArcadePhysics;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import Constants from '../assets/data/constants.yml';
import GameContext from '../model/GameContext';
import {UIOverlayScene} from '../scenes/UIOverlayScene';
import {DEBUG_CONTROLLER} from './DebugController';

export class PhysicsController {
	private physics: ArcadePhysics;
	private input: UIOverlayScene;
	private context: GameContext;

	constructor(physics: ArcadePhysics, ui: UIOverlayScene, context: GameContext) {
		this.physics = physics;
		this.input = ui;
		this.context = context;
	}

	public update(delta: number) {
		this.context.isGrounded = this.context.player.body.blocked.down || this.context.player.y >= Constants.world.height - this.context.player.height;

		this.updatePlayerVelocity();
		this.updatePlayerJumping();

		this.updateInAirTimer(delta);
		this.updatePlayerGravityOnLadder();
	}

	private onLadderCheck(player: SpriteWithDynamicBody, ladder: SpriteWithDynamicBody) {
		this.context.isTouchingLadder = true;
		this.context.touchingLadder = ladder;

		if (player.y + player.height <= ladder.y - ladder.height) {
			this.context.isOnTopOfLadder = true;
		}
	}

	private updatePlayerVelocity() {
		const horiz = this.input.getHorizontalDirection();
		const vert = this.input.getVerticalDirection();

		if (horiz != undefined) {
			if (!this.context.isClimbing || (this.context.player.body.velocity.y == 0)) {
				if (horiz === 'left')
					this.context.player.setVelocityX(-Constants.player.speed.walk);
				else
					this.context.player.setVelocityX(Constants.player.speed.walk);

				if (this.context.isClimbing) {
					this.context.player.body.velocity.y = -100;
					this.context.isJumping = true;
					this.context.isClimbing = false;
				}
			}
		} else
			this.context.player.setVelocityX(0);


		if (this.input.getVerticalDirection() != undefined) {
			if (!this.context.isClimbing && this.context.isTouchingLadder) {
				//Check if not standing on top of a ladder trying to go up further
				if (!this.context.isOnTopOfLadder || this.input.getVerticalDirection() === "down") {
					if (this.input.getVerticalDirection() === "down" || (this.input.getVerticalDirection() === "up" && this.context.player.body.velocity.y > -60))
						this.startClimbing();
				}
			}
		}

		if (this.context.isClimbing && (!this.context.isTouchingLadder || this.context.touchingLadder == undefined)) {
			this.context.isClimbing = false;
		}

		if (this.context.isClimbing && !this.context.isJumping) {
			if (vert == undefined)
				this.context.player.setVelocityY(0);
			else if (vert == 'up') {
				if (this.context.isOnTopOfLadder)
					this.context.player.setVelocityY(0);
				else
					this.context.player.setVelocityY(-Constants.player.speed.ladder.up);
			} else if (vert == 'down') {
				this.context.player.setVelocityY(Constants.player.speed.ladder.down);
			}
		}

		if (this.context.player.body.velocity.x > 0)
			this.context.player.setFlipX(false);
		else if (this.context.player.body.velocity.x < 0)
			this.context.player.setFlipX(true);
	}

	private startClimbing() {
		this.context.isClimbing = true;
		this.context.isJumping = false;
		this.context.player.setVelocityY(0);
		this.context.player.setVelocityX(0);
	}

	private updatePlayerJumping() {
		if (this.context.isGrounded && this.context.isJumping)
			this.context.isJumping = false;

		if (this.context.isJumping)
			return;

		if (this.input.isJumping()) {
			//Allow jumping when grounded, but allow a little margin of error
			if (this.context.isGrounded || this.context.timeInAir <= Constants.jump.inairpass) {
				//Only allow jumping if climbing up
				if (!this.context.isClimbing || this.context.player.body.velocity.y <= 0)
					this.performJump();
			}
		}
	}

	public setupCollisionDetection() {
		//Just a check if a player is on a ladder
		this.physics.add.overlap(this.context.player, this.context.ladders, this.onLadderCheck, null, this);

		//Collider for player -> platforms
		this.physics.add.collider(this.context.player, this.context.platforms, undefined, this.isPlatformBlocking, this);

		//Collider to be able to stand on the top of a ladder
		this.physics.add.collider(this.context.player, this.context.ladders, null, this.isLadderBlocking, this);

		//Collider for buckets and platform
		this.physics.add.collider(this.context.buckets, this.context.platforms, function (bucket: SpriteWithDynamicBody) {
			if (bucket.body.y > Constants.world.height - 24)
				bucket.body.setCollideWorldBounds(false);
		});

		// this.physics.add.collider(this.buckets, this.buckets);
		this.physics.add.collider(this.context.player, this.context.buckets, function (player: SpriteWithDynamicBody, bucket: SpriteWithDynamicBody) {
			this.gameplay.onHit(bucket);
		}, null, this);
	}

	private updatePlayerGravityOnLadder() {
		if (!this.context.isClimbing && !this.context.player.body.allowGravity)
			this.context.player.body.setAllowGravity(true);

		if (this.context.isClimbing)
			this.context.player.body.setAllowGravity(false);
	}

	private isLadderBlocking(player: SpriteWithDynamicBody, ladder: SpriteWithDynamicBody): boolean {
		if (this.context.isOnTopOfLadder && this.input.getVerticalDirection() != 'down')
			return true;

		return false;
	}

	private isPlatformBlocking(player, platform): boolean {
		//Block during climbing, but only if ladder is above platform to prevent the player from falling through ladders on going down
		if (this.context.touchingLadder && this.context.touchingLadder.y <= platform.y) {
			this.context.isClimbing = false;
			return true;
		}

		if (this.context.isClimbing && this.context.touchingLadder && this.context.touchingLadder.y)
			return false;

		//Platform must be at be lower than the middle of the player
		if (player.y + (player.height * .75) < platform.y) {
			if (player.body.velocity.y > 0)
				return true;
		}

		return false;
	}

	public restart() {
		this.context.isJumping = false;
		this.context.timeInAir = 0;
		this.context.touchingLadder = false;
		this.context.isTouchingLadder = false;
	}

	private performJump() {
		this.context.isJumping = true;
		this.context.isClimbing = false;
		this.context.player.setVelocityY(-Constants.player.jump.power);
	}

	private updateInAirTimer(delta: number) {
		if (this.context.player.body.touching.down || this.context.isClimbing) {
			this.context.timeInAir = 0;
			return;
		}

		this.context.timeInAir += delta;
	}
}
