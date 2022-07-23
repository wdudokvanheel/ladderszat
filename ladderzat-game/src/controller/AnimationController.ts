import GameContext from '../model/GameContext';

export default class AnimationController {

	public updateAnimations(context: GameContext) {
		if (!context.isGrounded && !context.isClimbing) {
			context.player.anims.play('kris-walk', true);
			context.player.anims.setProgress(0)
		} else if (context.isClimbing && !context.isGrounded) {
			context.player.anims.play('kris-climb', context.player.body.velocity.y != 0);
		} else if (context.player.body.velocity.x == 0) {
			context.player.setTexture('kris-idle');
		} else {
			context.player.anims.play('kris-walk', true);
		}

		if (context.player.body.velocity.x > 0)
			context.player.setFlipX(false);
		else if (context.player.body.velocity.x < 0)
			context.player.setFlipX(true);
	}
}
