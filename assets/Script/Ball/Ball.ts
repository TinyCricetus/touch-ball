
const {ccclass, property} = cc._decorator;

@ccclass
export class Ball extends cc.Component {


    public onLoad() {
        //启用碰撞监听器
        this.node.getComponent(cc.RigidBody).enabledContactListener = true;
    }

    /**
     * 在碰撞回调中处理速度成直线的问题
     * @param contact 
     * @param self 
     * @param other 
     */
    private onBeginContact(contact: cc.PhysicsContact, self: any, other: any) {

        if (other.tag == 4) {
            return ;
        }
        //获取小球的线性速度
        let velocity: cc.Vec2 = this.node.getComponent(cc.RigidBody).linearVelocity;
        //重新校准
        if (Math.abs(velocity.y) <= 100) {
            let correctValue: number = 0;
            if (velocity.y < 0) {
                correctValue = -300;
            } else {
                correctValue = 300;
            }
            //console.log("数据修正前:" + velocity);
            this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(velocity.x, velocity.y + correctValue);
            //console.log("数据修正后:" + this.node.getComponent(cc.RigidBody).linearVelocity);
        } 
    }
}
