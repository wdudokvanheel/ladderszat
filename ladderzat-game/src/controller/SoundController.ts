import EventEmitter = Phaser.Events.EventEmitter;

export class SoundController {
	private conf;
	private confGo;

	private jump;
	private land;
	private hit;
	private collectCoin;
	private collectObj;
	private gameover;
	private win;
	private selector;
	private buzz;


	constructor(private events: EventEmitter, sound) {
		const _this = this;
		this.conf = {
			mute: false,
			volume: 0.3,
			rate: 1,
			detune: 0,
			seek: 0,
			loop: false,
			delay: 0
		};

		this.confGo = {
			mute: false,
			volume: 0.3,
			rate: 1,
			detune: 0,
			seek: 0,
			loop: false,
		};

		this.collectCoin = sound.add('collectCoin');
		this.gameover = sound.add('gameover');
		this.collectObj = sound.add('collectObj');
		this.jump = sound.add('jump');
		this.land = sound.add('land');
		this.hit = sound.add('hit');
		this.win = sound.add('win');
		this.selector = sound.add('selectorfx');
		this.buzz = sound.add('buzz');

		events.on('jump', function () {
			_this.jump.play(this.conf);
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
				_this.gameover.play(this.confGo);
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
