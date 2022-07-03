import Phaser from 'phaser'
import images from "../assets/images/*.png"

export default class TestScene extends Phaser.Scene {
	private WINDOW_SIZE = new Phaser.Math.Vector2(192, 296);

	constructor() {
		super('ladder-zat')
	}

	preload() {
		this.load.image('bg', images['background'])
	}

	create() {
		this.add.image(this.WINDOW_SIZE.x / 2, this.WINDOW_SIZE.y / 2, 'bg')
	}
}
