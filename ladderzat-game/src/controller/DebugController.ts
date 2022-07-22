export class DebugController {
	private values: { [key: string]: string } = {};

	public setValue(key: string, value: any, short = true) {
		this.values[key] = String(short ? String(value).charAt(0) : value);
	}

	public getValues(): string {
		var val = '';
		for (let valuesKey in this.values)
			val += valuesKey + ":" + this.values[valuesKey] + " ";

		return val;
	}
}

export let DEBUG_CONTROLLER = new DebugController();

