import Vector2 = Phaser.Math.Vector2;
import ArcadePhysics = Phaser.Physics.Arcade.ArcadePhysics;
import Group = Phaser.Physics.Arcade.Group;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import Constants from '../assets/data/constants.yml'
import {sample} from '../main';
import GameContext from '../model/GameContext';

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

	createExit(physics: ArcadePhysics, position: Vector2) {
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

	createCollectibles(physics: Phaser.Physics.Arcade.ArcadePhysics, add, context: GameContext): Group {
		if (!context.leveldata.objects)
			return;

		var group = physics.add.group();

		context.leveldata.objects.forEach(object => {
			var sprite;
			if (!object.type)
				return

			if (object.type === 'coin') {
				sprite = group.create(object.x, Constants.world.height - object.y, object.type);
				sprite.setOrigin(0, 1);
				sprite.refreshBody();
				sprite.anims.play('coin');
				sprite.setSize(2, 2, 2, sprite.height-4)
				sprite.anims.setProgress(Math.random() * 4);
				sprite.anims.timeScale = 0.9 + (Math.random() * 0.2);

			} else if (object.type == 'key') {
				var path = new Phaser.Curves.Path();
				path.add(new Phaser.Curves.Line(new Phaser.Math.Vector2(object.x, Constants.world.height - object.y - 4), new Phaser.Math.Vector2(object.x, Constants.world.height - object.y + 4)));
				sprite = add.follower(path, 0, 0, 'key');
				sprite.setOrigin(0, 1);
				sprite.startFollow({
					duration: 1500,
					yoyo: true,
					ease: 'Sine.easeInOut',
					repeat: -1,
				});
				group.add(sprite, false);
			}

			sprite.body.setAllowGravity(false);
			sprite.setDataEnabled();
			sprite.data.set('collect', object.type);
		});
		return group;
	}
}
