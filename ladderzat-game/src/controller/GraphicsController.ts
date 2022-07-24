import GameContext from '../model/GameContext';

export default class GraphicsController {
	private context: GameContext;

	constructor(context: GameContext) {
		this.context = context;
	}

	public update() {
		this.updateAnimations();
		this.updatePlayerFacing();
		this.updateBucketsFacing();
	}

	private updateAnimations() {
		if (!this.context.alive)
			return;

		if (!this.context.isGrounded && !this.context.isClimbing) {
			this.context.player.anims.play('kris-walk', true);
			this.context.player.anims.setProgress(0)
			return;
		}

		if (this.context.isClimbing && !this.context.isGrounded) {
			this.context.player.anims.play('kris-climb', this.context.player.body.velocity.y != 0);
			return;
		}

		if (this.context.player.body.velocity.x == 0) {
			this.context.player.setTexture('kris-idle');
			return;
		}

		this.context.player.anims.play('kris-walk', true);
	}

	private updatePlayerFacing() {
		if (this.context.player)
			this.setFacing(this.context.player);
	}

	private updateBucketsFacing() {
		this.context.buckets.children.getArray().forEach(bucket => {
			this.setFacing(bucket);
		});
	}

	private setFacing(object) {
		if (object.body.velocity.x > 0)
			object.setFlipX(false);
		else if (object.body.velocity.x < 0)
			object.setFlipX(true);
	}
}
