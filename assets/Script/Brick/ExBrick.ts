import { GameBasic } from "../GameBasic";
import { BRICK_TYPE } from "../BrickData";

const {ccclass, property} = cc._decorator;

@ccclass
export class ExBrick extends cc.Component {

    @property(cc.Node)
    effectNode: cc.Node = null;

    public type: BRICK_TYPE = null;
    public touchCount: number = null;
    public isDismiss: boolean = null;

    private animation: cc.Animation = null;
    private animationCount: number = 0;

    public init(type: BRICK_TYPE) {
        this.node.active = true;
        this.type = type;
        this.node.getComponent(cc.RigidBody).enabledContactListener = true;
        this.animation = this.effectNode.getComponent(cc.Animation);
        this.animationCount = 0;
        this.animation.on("finished", this.emitAnimation, this);
        this.touchCount = 0;
        this.isDismiss = false;
    }

    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        this.animationCount++;
        this.touchCount++;
        if (this.animationCount == 1) {
            this.emitAnimation();
        }
    }


    private emitAnimation() {
        if (this.animationCount == 0) {
            if (this.isDismiss) {
                this.node.active = false;
            }
            return ;
        }
        this.animationCount--;
        this.animation.playAdditive();
        //触发消除
        GameBasic.getInstance().notifyEvent("Dismiss", this.node);
    }
}
