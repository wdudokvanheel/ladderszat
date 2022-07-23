import Constants from '../assets/data/constants.yml';
import GameContext from '../model/GameContext';
import ArcadePhysics = Phaser.Physics.Arcade.ArcadePhysics;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export default class CollisionController{
	private physics: ArcadePhysics;
	private context: GameContext

	constructor(physics: Phaser.Physics.Arcade.ArcadePhysics, context: GameContext) {
		this.physics = physics;
		this.context = context;
	}

	public setupCollisionDetection() {
		//Just a check if a player is on a ladder
		this.physics.add.overlap(this.context.player, this.context.ladders, this.touchingLadderTest, null, this);

		//Collider for player -> platforms
		this.physics.add.collider(this.context.player, this.context.platforms, undefined, this.platformBlockTest, this);

		//Collider to be able to stand on the top of a ladder
		this.physics.add.collider(this.context.player, this.context.ladders, null, this.ladderBlockTest, this);

		//Collider for buckets and platform
		this.physics.add.collider(this.context.buckets, this.context.platforms, function (bucket: SpriteWithDynamicBody) {
			if (bucket.body.y > Constants.world.height - 24)
				bucket.body.setCollideWorldBounds(false);
		});

		// this.physics.add.collider(this.buckets, this.buckets);
		this.physics.add.collider(this.context.player, this.context.buckets, function (player: SpriteWithDynamicBody, bucket: SpriteWithDynamicBody) {
			this.gameplay.onHit(bucket);
		}, null, this);
	}

	private touchingLadderTest(player: SpriteWithDynamicBody, ladder: SpriteWithDynamicBody) {
		//Don't allow climbing from below (with a little margin)
		if(player.y > ladder.y - (player.height * .9))
			return;

		this.context.isTouchingLadder = true;
		this.context.touchingLadder = ladder;

		if (player.y + player.height <= ladder.y - ladder.height)
			this.context.isOnTopOfLadder = true;
	}

	private platformBlockTest(player, platform): boolean {
		//Block during climbing, but only if ladder is above platform to prevent the player from falling through ladders on going down
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
