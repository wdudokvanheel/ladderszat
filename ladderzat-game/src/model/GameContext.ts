import Group = Phaser.Physics.Arcade.Group;
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import {GameplayScene} from '../scenes/GameplayScene';
import {UIOverlayScene} from '../scenes/UIOverlayScene';

export default class GameContext {
	public gameplay: GameplayScene;
	public input: UIOverlayScene;

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

	constructor(gameplay: GameplayScene) {
		this.gameplay = gameplay;
	}

//Call on end of update cycle to reset values (so the collision system can set them again)
	public reset() {
		this.touchingLadder = undefined;
		this.isTouchingLadder = false;
		this.isOnTopOfLadder = false;
	}

	public restartGame() {
		this.isGrounded = false;
		this.isJumping = false;
		this.timeInAir = 0;
		this.touchingLadder = false;
		this.isOnTopOfLadder = false;
		this.isTouchingLadder = false;
		this.isClimbing = false;
	}
}
