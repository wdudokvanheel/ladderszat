import Phaser from 'phaser';
import {ObjectFactory} from '../factory/ObjectFactory';
import {LadderLoader} from '../loader/LadderLoader';
import {PlatformLoader} from '../loader/PlatformLoader';
import {UIScene} from './UIScene';
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export class GameplayScene extends Phaser.Scene {
	private platformLoader: PlatformLoader;
	private ladderLoader: LadderLoader;
	private objectFactory: ObjectFactory;

	private player: SpriteWithDynamicBody;
	private ui: UIScene;

	private onLadder = false;

	private count = 0;

	constructor() {
		super('gameplay')
	}

	preload() {
		this.platformLoader = new PlatformLoader();
		this.ladderLoader = new LadderLoader();
		this.objectFactory = new ObjectFactory();
	}

	create() {
		//Create game objects
		const platforms = this.platformLoader.getPlatforms(this.physics);
		const ladders = this.ladderLoader.getLadders(this.physics);

		this.player = this.objectFactory.createPlayer(this.physics);
		this.ui = this.scene.get('ui') as UIScene;

		//Setup collision with player
		// this.physics.add.overlap(this.player, this.ladders, this.isOnLadder, null, this);
		this.physics.add.collider(this.player, platforms);
		this.physics.add.overlap(this.player, ladders, this.onLadderOverlap, null, this);
	}

	private onLadderOverlap() {
		console.debug('OVERLAP TRUE');
		this.onLadder = true;
	}

	public onJump() {
		console.debug('NONONONONONO');
		if (this.player.body.touching.down && !this.onLadder)
			this.player.setVelocityY(-150);
	}

	update(time: number, delta: number) {
		this.count++;
		this.updatePlayerVelocity();
		this.updatePlayerJumping();
		// console.debug('UPDATE' + this.onLadder);
		// this.cameras.main.y++
		// console.debug((this.scene.get('ui') as UIScene).getHorizontalDirection() + ' ' + (this.scene.get('ui') as UIScene).getVerticalDirection() );
		this.onLadder = false;
	}

	private updatePlayerJumping() {
		if (this.ui.isJumping() && this.player.body.touching.down && !this.onLadder)
			this.player.setVelocityY(-150);
	}

	private updatePlayerVelocity() {
		const horiz = this.ui.getHorizontalDirection();
		if (horiz != undefined) {
			if (horiz === 'left')
				this.player.setVelocityX(-75);
			else
				this.player.setVelocityX(75);
		} else
			this.player.setVelocityX(0);
	}
}
