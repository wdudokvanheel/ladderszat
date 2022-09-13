import GameObject = Phaser.GameObjects.GameObject;
import Group = Phaser.Physics.Arcade.Group;
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import SpriteWithStaticBody = Phaser.Types.Physics.Arcade.SpriteWithStaticBody;
import Constants from '../assets/data/constants.yml';
import {GameplayScene} from '../scenes/GameplayScene';
import {UIOverlayScene} from '../scenes/UIOverlayScene';
import JumpInputModel from './JumpInput';

export default class GameContext extends Phaser.Plugins.BasePlugin {
	public gameplay: GameplayScene;

	//Level data
	public leveldata;
	public level = 3;
	public progress = .66;

	public player: SpriteWithDynamicBody;
	public platforms: StaticGroup;
	public ladders: StaticGroup;
	public buckets: Group;
	public exit: SpriteWithStaticBody;
	//Items that can be collected
	public collectibles: Group;
	//Objects in level that collide
	public objects: Group;
	//Object in level that don't collide
	public props;

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
	public touchingWater = false;

	public touchingLadder = undefined;
	public timeInAir = 0;
	public drunk = 0;

	public score = 0;

	constructor(pluginManager) {
		super(pluginManager);
	}

	//Call on end of update cycle to reset values (so the collision system can set them again)
	public resetCollisionValues() {
		this.touchingLadder = undefined;
		this.isTouchingLadder = false;
		this.isOnTopOfLadder = false;
		this.touchingWater = false;
	}

	/**
	 * Reset the context for a new level
	 */
	public resetLevelValues() {
		this.resetCollisionValues();

		this.isAlive = true;
		this.isGrounded = false;
		this.isJumping = false;
		this.timeInAir = 0;
		this.isClimbing = false;
		this.drunk = 0;

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

	public reset(){
		this.score = 0;
		this.progress = 0;
		this.level = 1;
	}

	public destroyPlayer() {
		if (!this.player)
			return;

		this.player.destroy();
		this.player = undefined;
	}

	public getObjectByName(name: string): GameObject {
		for (let object of this.collectibles.children.getArray()) {
			if (object.name === name)
				return object;
		}

		for (let object of this.objects.children.getArray()) {
			if (object.name === name)
				return object;
		}

		for (let object of this.props.children.getArray()) {
			if (object.name === name)
				return object;
		}
	}

	public getMaxProgressionForLevel(level: number): number {
		if (level == 3)
			return 1;
		return (Constants.gfx.progress.width.level * level + (level - 1) * 2) / (Constants.gfx.progress.width.total);
	}

	public getMinProgressionForLevel(level: number): number {
		if (level == 1)
			return 0;
		else
			return this.getMaxProgressionForLevel(level - 1);
	}
}
