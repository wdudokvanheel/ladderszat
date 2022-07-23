import Constants from '../assets/data/constants.yml';
import GameContext from '../model/GameContext';

export class PhysicsController {
	private context: GameContext;

	constructor(context: GameContext) {
		this.context = context;
	}

	public update(delta: number) {
		this.context.isGrounded = this.context.player.body.blocked.down || this.context.player.y >= Constants.world.height - this.context.player.height;

		this.updatePlayerVelocity();
		this.updatePlayerJumping();

		this.updateInAirTimer(delta);
		this.updatePlayerGravityOnLadder();
	}

	private updatePlayerVelocity() {
		const horiz = this.context.input.getHorizontalDirection();
		const vert = this.context.input.getVerticalDirection();

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

		if (this.context.input.getVerticalDirection() != undefined) {
			if (!this.context.isClimbing && this.context.isTouchingLadder) {
				//Check if not standing on top of a ladder trying to go up further
				if (!this.context.isOnTopOfLadder || this.context.input.getVerticalDirection() === "down") {
					if (this.context.input.getVerticalDirection() === "down" || (this.context.input.getVerticalDirection() === "up" && this.context.player.body.velocity.y > -60))
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

		if (this.context.input.isJumping()) {
			//Allow jumping when grounded, but allow a little margin of error
			if (this.context.isGrounded || this.context.timeInAir <= Constants.jump.inairpass) {
				//Only allow jumping if climbing up
				if (!this.context.isClimbing || this.context.player.body.velocity.y <= 0)
					this.performJump();
			}
		}
	}

	private updatePlayerGravityOnLadder() {
		if (!this.context.isClimbing && !this.context.player.body.allowGravity)
			this.context.player.body.setAllowGravity(true);

		if (this.context.isClimbing)
			this.context.player.body.setAllowGravity(false);
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
