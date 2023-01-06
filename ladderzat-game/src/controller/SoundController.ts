import EventEmitter = Phaser.Events.EventEmitter;

export class SoundController {
	private conf;
	private confGameOver;

	private jump;
	private land;
	private hit;
	private collectCoin;
	private collectObj;
	private gameover;
	private win;
	private selector;
	private buzz;
	private chant;
	private rapper;

	constructor(private events: EventEmitter, sound) {
		const _this = this;
		this.conf = {
			mute: false,
			volume: 0.2,
			rate: 1,
			detune: 0,
			seek: 0,
			loop: false,
			delay: 0
		};

		this.confGameOver = {
			mute: false,
			volume: 0.2,
			rate: 1,
			detune: 0,
			seek: 0,
			loop: false,
		};

		let vol = {volume: 0.6};

		this.collectCoin = sound.add('collectCoin', vol);
		this.gameover = sound.add('gameover', {volume: 0.5});
		this.collectObj = sound.add('collectObj', vol);
		this.jump = sound.add('jump', vol);
		this.land = sound.add('land', vol);
		this.hit = sound.add('hit', vol);
		this.win = sound.add('win', vol);
		this.selector = sound.add('selectorfx', vol);
		this.buzz = sound.add('buzz', vol);
		this.chant = sound.add('chant');
		this.rapper = sound.add('rapper');

		events.on('jump', function () {
			_this.jump.play(this.conf);
		});
		events.on('chant', function () {
			_this.chant.play(this.conf);
		});
		events.on('rapper', function () {
			_this.rapper.play(this.conf);
		});
		events.on('landfx', function () {
			_this.land.play(this.conf);
		});
		events.on('collectcoin', function () {
			_this.collectCoin.play(this.conf);
		});
		events.on('collectobj', function () {
			_this.collectObj.play(this.conf);
		});
		events.on('hitfx', function () {
			_this.hit.play(this.conf);
		});
		events.on('gameover', function () {
			setTimeout(function(){
				_this.gameover.play(this.confGameOver);
			}, 750);
		});
		events.on('win', function () {
			_this.win.play(this.conf);
		});
		events.on('selector', function () {
				_this.selector.play(this.conf);
		});
		events.on('buzz', function () {
			_this.buzz.play(this.conf);
		});
	}
}
