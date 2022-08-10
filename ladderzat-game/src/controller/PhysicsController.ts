import Constants from '../assets/data/constants.yml';
import GameContext from '../model/GameContext';

export class PhysicsController {
	private context: GameContext;
	private count = 0;

	constructor(context: GameContext) {
		this.context = context;
	}

	public update(delta: number) {
		this.context.isGrounded = this.context.player.body.blocked.down || this.context.player.y >= Constants.world.height - this.context.player.height;

		this.updatePlayerVelocity(delta);
		this.updatePlayerJumping();

		this.updateInAirTimer(delta);
		this.updatePlayerGravityOnLadder();
	}

	private updatePlayerVelocity(delta: number) {
		const horiz = this.context.input.getHorizontalDirection();
		const vert = this.context.input.getVerticalDirection();

		if (horiz != undefined) {
			if (!this.context.isClimbing || (this.context.player.body.velocity.y == 0)) {
				if (horiz === 'left')
					this.setPlayerVelocity(-1, delta);
				else if (horiz === 'right')
					this.setPlayerVelocity(1, delta);
				else
					this.setPlayerVelocity(0, delta);

				if (this.context.isClimbing) {
					this.context.player.body.velocity.y = -100;
					this.context.isJumping = true;
					this.context.isClimbing = false;
				}
			}
		} else
			this.setPlayerVelocity(0, delta);

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

	private setPlayerVelocity(input: number, delta: number) {
		let targetSpeed = input * Constants.player.walk.maxspeed;
		let diff = targetSpeed - this.context.player.body.velocity.x;

		var maxSpeed = Math.abs(targetSpeed);
		var accel = Constants.player.walk.acceleration;
		var decel = Constants.player.walk.deceleration;
		var damp = Constants.player.walk.damping;

		if (this.context.drunk != 0) {
			// maxSpeed -= 0.2;
			this.context.drunk = Math.min(1, this.context.drunk);
			accel = this.getDrunkValue(Constants.player.drunk.acceleration, Constants.player.walk.acceleration, this.context.drunk);
			decel = this.getDrunkValue(Constants.player.drunk.deceleration, Constants.player.walk.deceleration, this.context.drunk);
			damp = this.getDrunkValue(Constants.player.drunk.damping, Constants.player.walk.damping, this.context.drunk);
		}

		let accelRate = (maxSpeed > 0.01) ? accel : decel;
		let movement = Math.pow(Math.abs(diff) * accelRate, damp) * Math.sign(diff);

		//Cutoff to stop movement
		if (targetSpeed == 0 && Math.abs(this.context.player.body.velocity.x) < 5) {
			this.context.player.body.velocity.x = 0;
			return;
		}

		//Apply force
		this.context.player.body.velocity.x += movement;

		//Add extra force when drunk
		if (this.context.drunk != 0) {
			this.count++;

			if (Math.random() > 0.6)
				this.context.player.body.velocity.x -= (Math.sin(this.count / Math.PI)) * (6 * this.context.drunk);
			// if (Math.random() > 0.90 + (0.1 * (1 - this.context.drunk)))
			// 	this.context.player.body.velocity.x *= .8 + (1 - this.context.drunk);
		}
	}

	private getDrunkValue(min: number, max: number, drunk: number) {
		return (min * drunk) + (max * (1 - drunk));
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
