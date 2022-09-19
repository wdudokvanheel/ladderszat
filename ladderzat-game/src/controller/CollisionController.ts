import Constants from '../assets/data/constants.yml';
import GameContext from '../model/GameContext';
import Vector2 = Phaser.Math.Vector2;
import ArcadePhysics = Phaser.Physics.Arcade.ArcadePhysics;
import Collider = Phaser.Physics.Arcade.Collider;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export default class CollisionController {
	private physics: ArcadePhysics;
	private context: GameContext

	private playerColliders: Collider[];

	constructor(physics: Phaser.Physics.Arcade.ArcadePhysics, context: GameContext) {
		this.physics = physics;
		this.context = context;
		this.playerColliders = [];
	}

	public setupCollisionDetection() {
		//Set world bounds
		this.physics.world.setBounds(1, 1, Constants.screen.width - 2, Constants.world.height - 2, true, true, true, true);

		//Collider for buckets and platform
		this.physics.add.collider(this.context.buckets, this.context.platforms, function (bucket: SpriteWithDynamicBody) {
			//Corpses use the bucket group for easy collision setup, shake the camera once when hitting a platform
			if (bucket.name === 'corpse') {
				bucket.name = 'corpsed';
				this.context.gameplay.cameras.main.shake(120, new Vector2(0, 0.02));
			}

			//Allow buckets to leave the level after they've collided on the lower part of the level
			if (bucket.body.y > Constants.world.height - 24)
				bucket.body.setCollideWorldBounds(false);

			//Level-specific logic
			this.context.gameplay.levelLogic.forEach(logic => {
				if (logic.level == this.context.level)
					logic.bucketCollision(this.context, bucket)
			})
		}, null, this);
	}

	public createPlayerColliders() {
		//Remove current colliders
		this.playerColliders.forEach(collider => this.physics.world.removeCollider(collider));

		let water = this.context.getObjectByName("water");
		if (water)
			this.physics.add.collider(this.context.player, water, this.touchingWaterTest, this.touchingWaterTest, this)

		this.playerColliders.push(
			//Test to see if player is touching a ladder
			this.physics.add.overlap(this.context.player, this.context.ladders, this.touchingLadderTest, null, this),
			//Collider for player -> platforms
			this.physics.add.collider(this.context.player, this.context.platforms, null, this.platformBlockTest, this),
			//Collider to be able to stand on the top of a ladder
			this.physics.add.collider(this.context.player, this.context.ladders, null, this.ladderBlockTest, this),
			this.physics.add.collider(this.context.player, this.context.objects, null, null, this),
			//Collider for player -> buckets
			this.physics.add.overlap(this.context.player, this.context.buckets, null, this.context.gameplay.onHit, this.context.gameplay),
			//Collider for player -> level exit
			this.physics.add.overlap(this.context.player, this.context.exit, this.context.gameplay.onExit, null, this.context.gameplay),
			//Collider for player -> collectibles
			this.physics.add.collider(this.context.player, this.context.collectibles, null, this.context.gameplay.onCollect, this.context.gameplay)
		);
	}

	private touchingWaterTest(player: SpriteWithDynamicBody, water: SpriteWithDynamicBody) {
		if (player.y + player.height < water.y)
			this.context.touchingWater = true;
		return false;
	}

	private touchingLadderTest(player: SpriteWithDynamicBody, ladder: SpriteWithDynamicBody) {
		//Don't allow climbing from below (with a little margin)
		if (player.y > ladder.y - (player.height * .9))
			return;

		this.context.isTouchingLadder = true;
		this.context.touchingLadder = ladder;

		if (player.y + player.height <= ladder.y - ladder.height)
			this.context.isOnTopOfLadder = true;
	}

	private platformBlockTest(player, platform): boolean {
		//Block during climbing, but only if ladder is above platform to prevent the player from falling through platforms on going down
		if (this.context.touchingLadder && this.context.touchingLadder.y <= platform.y) {
			this.context.isClimbing = false;
			return true;
		}

		if (this.context.isClimbing && this.context.touchingLadder && this.context.touchingLadder.y)
			return false;

		//Platform must be at be lower than the middle of the player
		if (player.y + (player.height * .75) < platform.y) {
			if (player.body.velocity.y > 0)
				return true;
		}

		return false;
	}

	private ladderBlockTest(player: SpriteWithDynamicBody, ladder: SpriteWithDynamicBody): boolean {
		if (this.context.isOnTopOfLadder && this.context.input.getVerticalDirection() != 'down')
			return true;

		return false;
	}
}
