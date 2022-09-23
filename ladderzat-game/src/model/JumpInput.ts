export default class JumpInputModel {
	public key: boolean;
	public touch: boolean;

	constructor(key = false, touch = false) {
		this.key = key;
		this.touch = touch;
	}

	public isJumping(){
		return this.key || this.touch;
	}
}
