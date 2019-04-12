import { BRICK_TYPE } from "../BrickData";
import { GameConfig } from "../GameConfig";
import { GameBasic } from "../GameBasic";

const { ccclass, property } = cc._decorator;

@ccclass
export class Brick extends cc.Component {
    public type: BRICK_TYPE = null;
    public lifeValue: number = 0;
    public totalLifeValue: number = 0;

    private lifeLabel: cc.Node = null;
    private state: number = 0;

    public init(totalLife: number, state: number, type: BRICK_TYPE) {
        this.totalLifeValue = totalLife;
        this.state = state;
        this.type = type;

        //启动碰撞
        this.node.getComponent(cc.RigidBody).enabledContactListener = true;
        
        this.lifeLabel = this.node.children[0];
        this.updateLifeValue(this.totalLifeValue);


        //激活本身节点
        this.node.active = true;
    }

    public updateLifeValue(value: number) {
        this.lifeValue = value;
        this.lifeLabel.getComponent(cc.Label).string = `${this.lifeValue}`;
        //通知颜色变化
        GameBasic.getInstance().notifyEvent("color", this);
    }

    /**
     * 返回-1表示不需要变色，否则返回需要变换的颜色深度值(0-10)
     */
    public ifChangeColor(): number {
        let percent: number = Math.floor(this.lifeValue / this.totalLifeValue * 10);
        if (percent == this.state) {
            return -1;
        } else {
            this.state = percent;
            return percent;
        }
    }

    private onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if (this.lifeValue > 1) {
            this.updateLifeValue(this.lifeValue - 1);
        } else {
            this.node.active = false;
        }
    }
}
