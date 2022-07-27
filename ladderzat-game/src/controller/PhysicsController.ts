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
					this.setPlayerVelocity(-1);
				else if (horiz === 'right')
					this.setPlayerVelocity(1);
				else
					this.setPlayerVelocity(0);

				if (this.context.isClimbing) {
					this.context.player.body.velocity.y = -100;
					this.context.isJumping = true;
					this.context.isClimbing = false;
				}
			}
		} else
			this.setPlayerVelocity(0);

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
					this.context.player.setVelocityY(-Constants.player.climb.up);
			} else if (vert == 'down') {
				this.context.player.setVelocityY(Constants.player.climb.down);
			}
		}
	}

	private apply(x, damp, delta) {
		return x * Math.pow(1 - damp, delta * 10);
	}

	private setPlayerVelocity(input: number) {
		let targetSpeed = input * Constants.player.walk.maxspeed;
		let diff = targetSpeed - this.context.player.body.velocity.x;

		let accelRate = (Math.abs(targetSpeed) > 0.01) ? Constants.player.walk.acceleration : Constants.player.walk.deceleration;
		let movement = Math.pow(Math.abs(diff) * accelRate, Constants.player.walk.damping) * Math.sign(diff);

		//Cutoff to stop movement
		if (targetSpeed == 0 && Math.abs(this.context.player.body.velocity.x) < 5) {
			this.context.player.body.velocity.x = 0;
			return;
		}

		//Apply force
		this.context.player.body.velocity.x += movement;
	}

	private startClimbing() {
		this.context.isClimbing = true;
		this.context.isJumping = false;
		this.context.player.setVelocityY(0);
		this.context.player.setVelocityX(0);
	}

	private updatePlayerJumping() {
		this.context.player.body.setGravityY(0);
		if (!this.context.jumpInput.key && !this.context.jumpInput.touch) {
			this.context.isJumpReset = true;

			if (this.context.isJumping && this.context.player.body.velocity.y < 0)
				this.context.player.body.setGravityY(Constants.player.jump.releasegravity)
		}

		if (this.context.isGrounded && this.context.isJumping) {
			this.context.jumpInput.key = false;
			this.context.jumpInput.touch = false;
			this.context.isJumping = false;
		}

		if (this.context.isJumping)
			return;

		if (!this.context.isJumpReset)
			return;

		if (this.context.jumpInput.key || this.context.jumpInput.touch) {
			//Allow jumping when grounded, but allow a little margin of error
			if (this.context.isGrounded || this.context.timeInAir <= Constants.jump.coyote) {
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
		this.context.isJumpReset = false;
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
