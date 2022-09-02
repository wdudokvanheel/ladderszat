import {ObjectFactory} from '../factory/ObjectFactory';
import GameContext from '../model/GameContext';
import GameObjectFactory = Phaser.GameObjects.GameObjectFactory;
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export default abstract class LevelLogic {
	protected level: number;
	protected objectFactory: ObjectFactory;

	protected constructor(level: number) {
		this.level = level;
		this.objectFactory = new ObjectFactory();
	}


	public abstract init(context: GameContext, add: GameObjectFactory);

	public abstract update(context: GameContext, delta: number);
	public bucketCollision(context: GameContext, bucket: SpriteWithDynamicBody){}
}


