import ArcadePhysics = Phaser.Physics.Arcade.ArcadePhysics;
import Group = Phaser.Physics.Arcade.Group;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import Constants from '../assets/data/constants.yml'
import {sample} from '../main';
import GameContext from '../model/GameContext';
import Vector2 = Phaser.Math.Vector2;

export class ObjectFactory {

	createPlayer(physics: ArcadePhysics): SpriteWithDynamicBody {
		const player = physics.add.sprite(0, 0, 'kris-idle');
		player.setBounce(0);
		player.setOrigin(0, 0);
		player.setDataEnabled();
		player.setCollideWorldBounds(true);
		player.body.setMaxVelocityY(400);
		player.refreshBody();
		return player;
	}

	createExit(physics: ArcadePhysics, position: Vector2){
		const exit = physics.add.staticSprite(position.x, Constants.world.height - position.y, 'exit');
		exit.setOrigin(0, 1);
		exit.setImmovable(true);
		exit.refreshBody();
		return exit;
	}

	createPlayerCorpse(physics: ArcadePhysics, context: GameContext): SpriteWithDynamicBody {
		var sprite = physics.add.sprite(context.player.x, context.player.y, "kris-dead") as SpriteWithDynamicBody;
		sprite.anims.playAfterDelay("kris-dead", 850);
		context.buckets.add(sprite, false);

		sprite.body.setSize(9, sprite.height - 1, false);
		sprite.body.setAllowDrag(true);
		sprite.body.setDragX(0.05);
		sprite.body.setDamping(true);
		sprite.setVelocityY(-100);
		sprite.setCollideWorldBounds(true);
		sprite.refreshBody();
		return sprite;
	}

	createBucket(group: Group): SpriteWithDynamicBody {
		const color = sample(Constants.gfx.bucket.colors);
		const grp = group.create(10, Constants.world.height - 200, 'bucket-' + color);
		const bucket = grp as SpriteWithDynamicBody;
		bucket.setBounce(1, .6);
		// bucket.setMaxVelocityX(50);
		bucket.setCollideWorldBounds(true);
		bucket.setVelocityX(40 + (Math.random() * 10));
		bucket.setVelocityY(-Math.random() * 100);
		bucket.anims.play('bucket-' + color);
		bucket.refreshBody();
		return bucket;
	}

}
