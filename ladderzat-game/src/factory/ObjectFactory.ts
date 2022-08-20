import GameObjectFactory = Phaser.GameObjects.GameObjectFactory;
import PathFollower = Phaser.GameObjects.PathFollower;
import Sprite = Phaser.GameObjects.Sprite;
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
		player.setDepth(2);
		player.body.setMaxVelocityY(400);
		player.refreshBody();
		return player;
	}

	createExit(physics: ArcadePhysics, position: Vector2) {
		const exit = physics.add.staticSprite(position.x, Constants.world.height - position.y, 'exit');
		exit.setOrigin(0, 1);
		exit.setImmovable(true);
		exit.refreshBody();
		exit.body.setSize(1, 2, true);
		return exit;
	}

	createPlayerCorpse(physics: ArcadePhysics, context: GameContext): SpriteWithDynamicBody {
		var sprite = physics.add.sprite(context.player.x, context.player.y, "kris-dead") as SpriteWithDynamicBody;
		if(Constants.gfx.gore)
			sprite.anims.playAfterDelay("kris-dead", 850);
		context.buckets.add(sprite, false);
		sprite.setName('corpse');
		sprite.body.setSize(9, sprite.height - 1, false);
		sprite.body.setAllowDrag(true);
		sprite.body.setDragX(0.05);
		sprite.body.setDamping(true);
		sprite.setVelocityY(-100);
		sprite.setCollideWorldBounds(true);
		sprite.refreshBody();
		return sprite;
	}

	createObjects(physics: Phaser.Physics.Arcade.ArcadePhysics, add, context: GameContext): Group {
		var group = physics.add.group();
		group.runChildUpdate = true;

		if (!context.leveldata.objects)
			return group;

		context.leveldata.objects.forEach(object => {
			var sprite;
			if (!object.type)
				return

			if (object.type === 'mixer') {
				sprite = group.create(object.x, Constants.world.height - object.y, object.type);
				sprite.setName('mixer');
				sprite.setOrigin(0, 1);
				sprite.refreshBody();
				sprite.body.setAllowGravity(false);
				sprite.setDataEnabled();
				sprite.body.immovable = true;
				sprite.resetMixing = function () {
					this.data.set('color', sample(Constants.gfx.bucket.colors));
					this.data.set('state', 'empty');
					this.data.set('timer', 25);
				}
				sprite.resetMixing();
				sprite.update = function () {
					var timer = this.data.get('timer') ?? 0;
					var state = this.data.get('state');
					const target = 1;

					if (state === 'empty') {
						this.setTexture('mixer');
						this.anims.stop();
					}
					if (state === 'mixing') {
						let diff = target - this.anims.timeScale;
						let movement = Math.pow(Math.abs(diff) * 0.5, 0.5) * Math.sign(diff);
						this.anims.timeScale += movement / 10;
					}

					if (timer > 0) {
						this.data.set('timer', --timer)
						return;
					}

					var state = this.data.get('state');
					if (state === 'empty') {
						this.anims.play('mixer-' + this.data.get('color'), false);
						this.anims.pause();
						this.data.set('state', 'loading');
						sprite.data.set('timer', 10);
					}
					if (state === 'loading') {
						this.anims.play('mixer-' + this.data.get('color'), false);
						this.data.set('state', 'mixing');
						this.anims.timeScale = 0;
						sprite.data.set('timer', 120);
					}
				}
				return;
			}

			sprite = group.create(object.x, Constants.world.height - object.y, object.type);
			sprite.setOrigin(0, 1);
			sprite.refreshBody();
			sprite.body.setAllowGravity(false);
			sprite.body.immovable = true;
			sprite.setName(object.type);

			if (object.type === 'alarm' || object.type === 'water') {
				sprite.anims.play(object.type, true);
				sprite.setDepth(1);
			}

		});
		return group;
	}

	createCollectibles(physics: Phaser.Physics.Arcade.ArcadePhysics, add: GameObjectFactory, context: GameContext): Group {
		var group = physics.add.group();
		group.runChildUpdate = true;

		if (!context.leveldata.collectibles)
			return group;

		context.leveldata.collectibles.forEach(object => {
			var sprite;
			if (!object.type)
				return

			if (object.type === 'coin') {
				sprite = group.create(object.x, Constants.world.height - object.y, object.type);
				sprite.setOrigin(0, 1);
				sprite.refreshBody();
				sprite.anims.play('coin');
				sprite.setSize(2, 2, 2, sprite.height - 4)
				sprite.anims.setProgress(Math.random() * 4);
				sprite.anims.timeScale = 0.9 + (Math.random() * 0.2);
				sprite.body.setAllowGravity(false);
				sprite.setDataEnabled();
				sprite.data.set('collect', object.type);

			} else{
				sprite = this.createBouncingSprite(add, object.x, object.y, object.type);
				group.add(sprite, false);
				sprite.body.setAllowGravity(false);
				sprite.setDataEnabled();
				sprite.data.set('collect', object.type);
			}
		});
		return group;
	}

	createBouncingSprite(add: GameObjectFactory, x: number, y: number, texture: string, bounce = 4, duration = bounce * 375): Sprite {
		var path = new Phaser.Curves.Path();
		path.add(new Phaser.Curves.Line(new Phaser.Math.Vector2(x, Constants.world.height - y - bounce), new Phaser.Math.Vector2(x, Constants.world.height - y + bounce)));
		var sprite = add.follower(path, 0, 0, texture) as PathFollower;
		sprite.startFollow({
			duration,
			yoyo: true,
			ease: 'Sine.easeInOut',
			repeat: -1,
		});
		sprite.setOrigin(0, 1);
		return sprite as Sprite;
	}

	createProps(add: Phaser.GameObjects.GameObjectFactory, context: GameContext) {
		var group = add.group();

		if (!context.leveldata.props)
			return group;

		context.leveldata.props.forEach(object => {
			if (!object.type)
				return

			var sprite = group.create(object.x, Constants.world.height - object.y, object.type);
			sprite.setOrigin(0, 1);
			sprite.setName(object.type);

			if (object.type === 'alarm' || object.type === 'breaker-box-wire' || object.type === 'water') {
				sprite.anims.play(object.type, true);
			}
		});

		return group;
	}

	createBucket(group: Group, color: string): SpriteWithDynamicBody {
		const grp = group.create(10, Constants.world.height - 200, 'bucket-' + color);
		const bucket = grp as SpriteWithDynamicBody;
		bucket.setBounce(1, .6);
		bucket.setCollideWorldBounds(true);
		bucket.setVelocityX(Constants.object.bucket.speed);
		bucket.setVelocityY(-100 - (Math.random() * 50));
		bucket.anims.play('bucket-' + color);
		bucket.refreshBody();
		return bucket;
	}
}
