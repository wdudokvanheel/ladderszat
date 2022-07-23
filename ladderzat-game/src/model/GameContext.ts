import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import Group = Phaser.Physics.Arcade.Group;
import {GameplayScene} from '../scenes/GameplayScene';

export default class GameContext {
	public gameplay: GameplayScene;

	public player: SpriteWithDynamicBody;
	public platforms: StaticGroup;
	public ladders: StaticGroup;
	public buckets: Group;

	public isGrounded = false;
	public isJumping = false;
	public isTouchingLadder = false;
	public isOnTopOfLadder = false;
	public isClimbing = false;

	public touchingLadder = undefined;
	public timeInAir = 0;

	//Call on end of update cycle to reset values (so the collision system can set them again)
	public reset() {
		this.touchingLadder = undefined;
		this.isTouchingLadder = false;
		this.isOnTopOfLadder = false;
	}
}
