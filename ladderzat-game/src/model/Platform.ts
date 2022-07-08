class Platform {
	x: number;
	y: number;
	angled: string = undefined;
	segments: number;

	constructor(x: number, y: number, angled?: string, segments: number = 1) {
		this.x = x;
		this.y = y;
		this.segments = segments;
		if (angled)
			this.angled = angled;
	}
}
