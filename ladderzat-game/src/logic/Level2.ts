import GameContext from '../model/GameContext';
import {LevelLogic} from './LevelLogic';
import Sprite = Phaser.GameObjects.Sprite;
import GameObjectFactory = Phaser.GameObjects.GameObjectFactory;

export class Level2 extends LevelLogic {
	private state;
	private timer;
	private emitters = [];

	constructor() {
		super(2);
	}

	init(context: GameContext, add: GameObjectFactory) {
		this.emitters = [];

		var wire = context.getObjectByName("wire");
		if (wire) {
			// var particles = add.particles('particle-power');
			// var emitter = particles.createEmitter({
			// 	lifespan: 500,
			// 	frequency: 200,
			// 	speed: {min: 20, max: 30},
			// 	collideTop: false,
			// 	collideBottom: true,
			// 	quantity: 1
			// });
			// emitter.startFollow(wire, 2, -1);
			// this.emitters.push(emitter);

			var particles = add.particles('particle-white');
			var emitter = particles.createEmitter({
				lifespan: 350,
				speed: {min: 30, max: 50},
				collideTop: false,
				gravityY: 100,
				collideBottom: true,
				frequency: 10,
			});
			emitter.startFollow(wire, 2, -1);
			this.emitters.push(emitter);
		}
	}

	update(context: GameContext, delta: number) {
		this.updateWire(context, delta);
		if (this.state == "down") {
			this.emitters.forEach(emitter => emitter.start());
		} else {
			this.emitters.forEach(emitter => emitter.stop());
		}
	}

	private updateWire(context: GameContext, delta: number) {
		const wire = context.getObjectByName("wire") as Sprite;
		if (!wire)
			return;

		this.timer -= delta;
		if (this.timer > 0)
			return;

		if (this.state == undefined) {
			this.timer = 200;
			this.state = "swingdown";
			wire.setFrame(1);
		} else if (this.state === "swingdown") {
			this.state = "down";
			this.timer = 2000;
			wire.setFrame(2);
		} else if (this.state === "down") {
			this.state = "swingout1"
			this.timer = 200;
			wire.setFrame(1);
		} else if (this.state === "swingout1") {
			this.state = "swingout2"
			this.timer = 200;
			wire.setFrame(0);
		} else if (this.state === "swingout2") {
			this.state = "return"
			this.timer = 2000;
			wire.setFrame(5);
		} else if (this.state === "return") {
			this.state = undefined
			this.timer = 200;
			wire.setFrame(0);
		}
	}
}
