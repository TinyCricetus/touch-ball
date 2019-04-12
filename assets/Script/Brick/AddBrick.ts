import { GameBasic } from "../GameBasic";
import { BRICK_TYPE } from "../BrickData";

const {ccclass, property} = cc._decorator;

@ccclass
export class AddBrick extends cc.Component {


    public type: BRICK_TYPE = null;


    public init(bricktype: BRICK_TYPE) {
        this.node.active = true;
        this.type = bricktype;
        this.node.getComponent(cc.RigidBody).enabledContactListener = true;
    }

    private onBeginContact(...args) {
        GameBasic.getInstance().notifyEvent("AddBall", this.node);
    }
}
