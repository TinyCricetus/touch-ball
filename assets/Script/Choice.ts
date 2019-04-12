
const { ccclass, property } = cc._decorator;

/**
 * 本类用于关卡选择
 */
@ccclass
export class Choice extends cc.Component {

    @property(cc.Node)
    gameScene: cc.Node = null;


    private choice: number = 0;

    public getChoice(): number {
        return this.choice;
    }


    /**
     * 按钮通用触发事件
     */
    private buttonEvent(event: cc.Event.EventTouch, customEventData: string) {
        this.choice = Number(customEventData);

        //关卡选择关闭
        this.node.active = false;
        //按照不同的按钮激活不同的关卡
        this.activeMainScene();
    }


    private activeMainScene() {
        this.gameScene.active = true;
    }
}
