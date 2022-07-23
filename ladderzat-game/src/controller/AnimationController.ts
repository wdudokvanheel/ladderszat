import {PhysicsController} from './PhysicsController';

export default class AnimationController {

	public updateAnimations(physics: PhysicsController) {
		if (!physics.isGrounded && !physics.isClimbing) {
			physics.player.anims.play('kris-walk', true);
			physics.player.anims.setProgress(0)
		} else if (physics.isClimbing && !physics.isGrounded) {
			physics.player.anims.play('kris-climb', physics.player.body.velocity.y != 0);
		} else if (physics.player.body.velocity.x == 0) {
			physics.player.setTexture('kris-idle');
		} else {
			physics.player.anims.play('kris-walk', true);
		}
	}
}
