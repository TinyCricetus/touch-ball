import { BrickNodePool, LineBallNodePool, BallNodePool } from "./NodePool";
import { GameBoard, Reflect } from "./GameBoard";
import { GameConfig } from "./GameConfig";
import { BRICK_TYPE } from "./BrickData";
import { GameBasic } from "./GameBasic";
import { Brick } from "./Brick";


const { ccclass, property } = cc._decorator;


/**
 * 游戏主场景
 */
@ccclass
export class GameScene extends cc.Component {
    @property(cc.Node)
    ball: cc.Node = null;
    @property(cc.Prefab)
    lineBallPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    ballPrefab: cc.Prefab = null;
    @property([cc.Prefab])
    brickPrefabs: cc.Prefab[] = [];
    @property(cc.Node)
    bg: cc.Node = null;
    @property(cc.Node)
    choice: cc.Node = null;
    @property(cc.Node)
    touchContorl: cc.Node = null;
    @property(cc.Integer)
    ballCount: number = 0;
    @property(cc.Integer)
    timeInterval: number = 0;
    @property(cc.Integer)
    theForce: number = 0;

    public brickNodePool: BrickNodePool = null;
    public lineBallNodePool: LineBallNodePool = null;
    public ballNodePool: BallNodePool = null;

    public gameConfig: GameConfig = null;

    private brickRootNode: cc.Node = null;
    private gameBoard: GameBoard = null;
    private lineBallNodeRecord: cc.Node[] = null;
    private ballNodeRecord: cc.Node[] = null;
    private index: number = 0;
    private landCount: number = 0;
    private frist: boolean = false;
    private fristPosition: cc.Vec2 = null;
    private backBallRecord: any[] = null;
    private gameLevel: number = 0;

    public onLoad() {
        //开启物理引擎
        cc.director.getPhysicsManager().enabled = true;
        //开启场景的碰撞监听
        this.node.getComponent(cc.RigidBody).enabledContactListener = true;

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        //初始化预制体结点池
        this.lineBallNodePool = new LineBallNodePool(this.lineBallPrefab);
        this.ballNodePool = new BallNodePool(this.ballPrefab);
        this.brickNodePool = new BrickNodePool(this.brickPrefabs);

        //给与球的冲量大小
        this.theForce = this.theForce <= 0 ? 600 : this.theForce;
        //用于记录轨迹
        this.lineBallNodeRecord = [];
        //用于记录弹射球
        this.ballNodeRecord = [];
        //用于记录应该回归集结点的球
        this.backBallRecord = [];

        //获取砖块挂载的根节点，便于统一管理砖块
        this.brickRootNode = this.node.children[0];

        //从加载完毕的背景中获取砖块配置器组件
        this.gameConfig = this.bg.getComponent("GameConfig");
        this.gameLevel = this.choice.getComponent("Choice").getChoice();

        //创建游戏棋盘数据处理器
        this.gameBoard = new GameBoard();

        //地图加载需要控制主场景的加载，不然还未加载完成便会出现使用的情况
        this.loadMap();

        //初始化弹射球
        this.initBall();

        this.index = 0;
        this.frist = false;
        this.fristPosition = cc.v2();

        //注册颜色事件
        GameBasic.getInstance().registerEvent("color", this.changeColor, this);
    }

    public onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    //坐标统一
    public positionUnify(pos: cc.Vec2): cc.Vec2 {
        return this.node.convertToNodeSpaceAR(pos);
    }

    /**
     * 用于砖块的颜色变化回调
     * @param str 
     * @param brick 
     */
    public changeColor(str: string, brick: Brick) {
        let res: number = brick.ifChangeColor();
        if (res != -1) {
            let type: BRICK_TYPE = brick.type;
            brick.node.getComponent(cc.Sprite).spriteFrame = this.gameConfig.getBlockSpriteFrame(type, res);
        }
    }

    /**
     * 
     * @param dt 
     */
    public update(dt) {
        //直接在每帧中对定位球进行判断
    }

    private loadMap() {
        let brickNodeArray: cc.Node[] = this.gameBoard.getBrickNodeArray(this.gameConfig, this.brickNodePool, this.gameLevel);
        for (let i of brickNodeArray) {
            this.brickRootNode.addChild(i);
        }
    }

    private onTouchStart(event: cc.Event.EventTouch) {
        this.drawLine(this.ball.position, this.getReflectPos(event));
    }

    private onTouchMove(event: cc.Event.EventTouch) {
        this.moveLine(this.ball.position, this.getReflectPos(event));
    }

    private onTouchEnd(event: cc.Event.EventTouch) {
        this.clearBall();
        this.index = 0;
        this.landCount = 0;
        let reflect: Reflect = this.getReflectPos(event);
        this.frist = true;
        this.schedule(function () {
            this.sendBall(this.ballNodeRecord[this.index++], reflect);
            //console.log("目前是发射第"+ this.index + "个");
        }.bind(this), this.timeInterval, this.ballNodeRecord.length - 1, 0);
    }

    private onTouchCancel(event: cc.Event.EventTouch) {
        this.clearBall();
    }

    //获取反射点
    private getReflectPos(event: cc.Event.EventTouch): Reflect {
        let pos: cc.Vec2 = this.node.convertToNodeSpaceAR(event.getLocation());
        let reflectPos: Reflect = this.gameBoard.figureDestination(this.ball.position, pos);
        //反射点几乎与原点产生重叠时取消所有操作
        if (reflectPos && Math.abs(reflectPos.position.y - pos.y) <= 30) {
            reflectPos.position.y = pos.y + 30;
        }
        return reflectPos;
    }

    //落地时的回调函数
    private onEndContact(contact: cc.PhysicsContact, self: any, other: any) {
        if (self.tag == 4) {
            other.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 0);
            if (this.frist) {
                other.tag = 1;
                this.fristPosition = other.node.position;
                this.frist = false;
            }
            //console.log(other.tag);
            if (other.tag != 1) {
                //往第一个球的位置运动
                //由于动作冲突，因此应该先存储应该回归的小球，用回调对小球的回归行动进行约束
                this.backBallRecord.push(other);
                if (this.backBallRecord.length == 1) {
                    //开始集结小球
                    this.everyBallMoveToCenterPoint();
                }
            } else {
                //清楚首位标记
                other.tag = 0;
            }
            this.landCount++;
            if (this.landCount == this.ballCount) {
                //关闭触控禁止
                this.touchContorl.active = false;
            }
        }
    }

    /**
     * 落地小球集结
     */
    private everyBallMoveToCenterPoint() {
        if (this.backBallRecord.length <= 0) {
            return;
        } else {
            let action: cc.FiniteTimeAction = cc.moveTo(this.timeInterval, this.fristPosition).easing(cc.easeCircleActionInOut());
            let act: cc.ActionInterval = cc.sequence(action, cc.callFunc(this.everyBallMoveToCenterPoint, this));
            let temp: any = this.backBallRecord.shift();
            temp.node.runAction(act);
        }
    }

    /**
     * 初始化轨迹
     * @param posA 球位置
     * @param posB 反射点
     */
    private drawLine(posA: cc.Vec2, posB: Reflect) {
        if (posA == null || posB == null) {
            return;
        }
        this.lineBallNodeRecord = [];
        let posArray: cc.Vec2[] = this.gameBoard.figureBallOnLine(posA, posB.position);

        //插入反射轨迹
        this.gameBoard.reflectDeal(posArray, posB);

        for (let i = 0; i < posArray.length; i++) {
            let temp: cc.Node = this.lineBallNodePool.getLineBallNode();
            temp.position = posArray[i];
            this.lineBallNodeRecord.push(temp);
            this.node.addChild(temp);
        }

        let temp: cc.Node = this.ballNodePool.getBallNode();
        temp.position = posB.position;
        this.lineBallNodeRecord.push(temp);
        this.node.addChild(temp);
    }

    /**
     * 移动轨迹
     * @param posA 球位置
     * @param posB 反射点
     */
    private moveLine(posA: cc.Vec2, posB: Reflect) {
        if (posA == null || posB == null) {
            return;
        }
        let posArray: cc.Vec2[] = this.gameBoard.figureBallOnLine(posA, posB.position);

        //插入反射轨迹
        this.gameBoard.reflectDeal(posArray, posB);

        //计算轨迹球增量(注意节点记录数组包含尾部反射点)
        let limit: number = posArray.length - (this.lineBallNodeRecord.length - 1);

        let tail: cc.Node = this.lineBallNodeRecord.pop();
        if (limit > 0) {
            for (let i = 0; i < limit; i++) {
                let temp: cc.Node = this.lineBallNodePool.getLineBallNode();
                temp.position = posB.position;
                this.lineBallNodeRecord.push(temp);
                this.node.addChild(temp);
            }
        } else {
            for (let i = 0; i < -limit; i++) {
                let temp: cc.Node = this.lineBallNodeRecord.pop();
                this.lineBallNodePool.putLineBallNode(temp);
            }
        }
        this.lineBallNodeRecord.push(tail);
        if (posArray.length != this.lineBallNodeRecord.length - 1) {
            cc.log("轨道球数量计算出现错误!");
        }
        for (let i = 0; i < posArray.length; i++) {
            this.lineBallNodeRecord[i].position = posArray[i];
        }
        this.lineBallNodeRecord[this.lineBallNodeRecord.length - 1].position = posB.position;
    }

    //清理轨迹
    private clearBall() {
        let tail: cc.Node = this.lineBallNodeRecord.pop();
        this.ballNodePool.putBallNode(tail);

        for (let i of this.lineBallNodeRecord) {
            this.lineBallNodePool.putLineBallNode(i);
        }
    }

    /**
     * 发射小球
     * @param ball 需要发射的球
     * @param dir 方向反射类
     */
    private sendBall(ball: cc.Node, dir: Reflect) {
        if (ball == null || dir == null) {
            return;
        }

        //开启触控禁止
        this.touchContorl.active = true;

        let ballRB: cc.RigidBody = ball.getComponent(cc.RigidBody);
        let force: cc.Vec2 = this.gameBoard.getUnitVec(dir.position.sub(ball.position));
        ballRB.applyLinearImpulse(force.scale(cc.v2(this.theForce, this.theForce)),
            ballRB.getLocalCenter(), true);
    }

    /**
     * 初始化弹射球数量
     */
    private initBall() {
        //先对弹射球的数据进行判断修正
        if (this.ballCount <= 0) {
            console.log("预制球数量错误，已修改为默认值1!");
            this.ballCount = 1;
        }
        if (!this.ballNodeRecord) {
            this.ballNodeRecord = [];
        }
        //先把第一个球也就是定位球加入
        this.ballNodeRecord.push(this.ball);
        for (let i: number = 1; i < this.ballCount; i++) {
            let temp: cc.Node = this.ballNodePool.getBallNode();
            this.node.addChild(temp);//先激活active
            temp.position = this.ball.position;
            this.ballNodeRecord.push(temp);
        }
    }
}
