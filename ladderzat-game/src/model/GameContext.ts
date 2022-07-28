import Group = Phaser.Physics.Arcade.Group;
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import SpriteWithStaticBody = Phaser.Types.Physics.Arcade.SpriteWithStaticBody;
import {GameplayScene} from '../scenes/GameplayScene';
import {UIOverlayScene} from '../scenes/UIOverlayScene';
import JumpInputModel from './JumpInput';

export default class GameContext extends Phaser.Plugins.BasePlugin {
	public gameplay: GameplayScene;

	//Level data
	public leveldata;
	public level = 1;

	public player: SpriteWithDynamicBody;
	public platforms: StaticGroup;
	public ladders: StaticGroup;
	public buckets: Group;
	public exit: SpriteWithStaticBody;
	public collectibles: Group;

	//Input
	public input: UIOverlayScene;
	public jumpInput = new JumpInputModel();
	public isJumping = false;
	public isJumpReset = true;

	//Physics properties
	public isAlive = true;
	public isGrounded = false;
	public isTouchingLadder = false;
	public isOnTopOfLadder = false;
	public isClimbing = false;

	public touchingLadder = undefined;
	public timeInAir = 0;

	public score = 0;

	constructor(pluginManager) {
		super(pluginManager);
	}

	//Call on end of update cycle to reset values (so the collision system can set them again)
	public resetLadderValues() {
		this.touchingLadder = undefined;
		this.isTouchingLadder = false;
		this.isOnTopOfLadder = false;
	}

	/**
	 * Reset the context for a new level
	 */
	public reset() {
		this.resetLadderValues();

		this.isAlive = true;
		this.isGrounded = false;
		this.isJumping = false;
		this.timeInAir = 0;
		this.isClimbing = false;

		//Remove all objects
		if (this.buckets && this.buckets.children)
			this.buckets.children.getArray().forEach(bucket => this.buckets.remove(bucket, true));
		if (this.platforms && this.platforms.children)
			this.platforms.children.getArray().forEach(platform => this.platforms.remove(platform, true));
		if (this.ladders && this.ladders.children)
			this.ladders.children.getArray().forEach(ladder => this.ladders.remove(ladder, true));

		this.buckets = undefined;
		this.platforms = undefined;
		this.ladders = undefined;
		this.destroyPlayer();
	}

	public destroyPlayer() {
		if (!this.player)
			return;

		this.player.destroy();
		this.player = undefined;
	}
}
