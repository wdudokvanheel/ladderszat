// @ts-ignore
import images from "../assets/images/*/*.png";
import LoaderPlugin = Phaser.Loader.LoaderPlugin;

export class ImageLoader {
	loader: LoaderPlugin;

	constructor(loader: Phaser.Loader.LoaderPlugin) {
		this.loader = loader;
	}

	public loadImages() {
		this.loader.spritesheet('button-dpad-up', images['ui']['button-dpad-up'], {frameWidth: 17, frameHeight: 16});
		this.loader.spritesheet('button-dpad-right', images['ui']['button-dpad-right'], {frameWidth: 15, frameHeight: 18});
		this.loader.spritesheet('button-dpad-down', images['ui']['button-dpad-down'], {frameWidth: 17, frameHeight: 16});
		this.loader.spritesheet('button-dpad-left', images['ui']['button-dpad-left'], {frameWidth: 15, frameHeight: 18});

		this.loader.image('background', images['ui']['background'])
		this.loader.image('rail', images['objects']['rail'])
		this.loader.image('ladder', images['objects']['ladder'])
		this.loader.image('kris-stand', images['kris']['stand'])
		this.loader.spritesheet('button-jump', images['ui']['button-jump'], {frameWidth: 39, frameHeight: 42})
	}
}
