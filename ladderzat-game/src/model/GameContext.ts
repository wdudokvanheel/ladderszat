import Group = Phaser.Physics.Arcade.Group;
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import {GameplayScene} from '../scenes/GameplayScene';
import {UIOverlayScene} from '../scenes/UIOverlayScene';
import SpriteWithStaticBody = Phaser.Types.Physics.Arcade.SpriteWithStaticBody;

export default class GameContext {
	public gameplay: GameplayScene;
	public input: UIOverlayScene;

	public player: SpriteWithDynamicBody;
	public platforms: StaticGroup;
	public ladders: StaticGroup;
	public buckets: Group;
	public exit: SpriteWithStaticBody;

	public alive = true;

	public isGrounded = false;
	public isJumping = false;
	public isTouchingLadder = false;
	public isOnTopOfLadder = false;
	public isClimbing = false;

	public touchingLadder = undefined;
	public timeInAir = 0;

	constructor(gameplay: GameplayScene) {
		this.gameplay = gameplay;
		this.reset();
	}

	//Call on end of update cycle to reset values (so the collision system can set them again)
	public resetLadderValues() {
		this.touchingLadder = undefined;
		this.isTouchingLadder = false;
		this.isOnTopOfLadder = false;
	}

	public reset() {
		this.alive = true;
		this.isGrounded = false;
		this.isJumping = false;
		this.timeInAir = 0;
		this.touchingLadder = false;
		this.isOnTopOfLadder = false;
		this.isTouchingLadder = false;
		this.isClimbing = false;

		//Remove all buckets
		if (this.buckets && this.buckets.children)
			this.buckets.children.getArray().forEach(bucket => this.buckets.remove(bucket, true));
	}

	public destroyPlayer() {
		if (!this.player)
			return;

		this.player.destroy();
		this.player = undefined;
	}
}
