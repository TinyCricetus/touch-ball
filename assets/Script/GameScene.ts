import { BrickNodePool, LineBallNodePool, BallNodePool } from "./NodePool";
import { GameBoard, Reflect } from "./GameBoard";
import { BrickConfig } from "./BrickConfig";
import { BRICKTYPE } from "./BrickData";
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

    public brickNodePool: BrickNodePool = null;
    public lineBallNodePool: LineBallNodePool = null;
    public ballNodePool: BallNodePool = null;
    
    public brickConfig: BrickConfig = null;

    private brickRootNode: cc.Node = null;
    private gameBoard: GameBoard = null;
    private theForce: number = 0;
    private lineBallNodeRecord: cc.Node[] = null;

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
        this.theForce = 1000;
        this.lineBallNodeRecord = [];

        //获取砖块挂载的根节点，便于统一管理砖块
        this.brickRootNode = this.node.children[0];
        
        //从加载完毕的背景中获取砖块配置器组件
        this.brickConfig = this.bg.getComponent("BrickConfig");

        //创建游戏棋盘数据处理器
        this.gameBoard = new GameBoard();

        //地图加载需要控制主场景的加载，不然还未加载完成便会出现使用的情况
        this.loadMap();

        //注册一个颜色事件试试
        GameBasic.getInstance().registerEvent("color", this.changeColor, this);
    }

    public onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    //坐标统一
    public positionUnify(pos: cc.Vec2): cc.Vec2 {
        return this.node.convertToNodeSpaceAR(pos);
    }

    public changeColor(str: string, brick: Brick) {
        let res: number = brick.ifChangeColor();
        if (res != -1) {
            let type: BRICKTYPE = brick.type;
            brick.node.getComponent(cc.Sprite).spriteFrame = this.brickConfig.getBlockSpriteFrame(type, res);
        }
    }

    private loadMap() {
        let brickNodeArray: cc.Node[] = this.gameBoard.getBrickNodeArray(this.brickConfig, this.brickNodePool);
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
        this.sendBall(this.ball, this.getReflectPos(event));
    }

    private onTouchCancel(event: cc.Event.EventTouch) {
        this.clearBall();
    }

    //获取反射点
    private getReflectPos(event: cc.Event.EventTouch): Reflect {
        let pos: cc.Vec2 = this.node.convertToNodeSpaceAR(event.getLocation());
        let reflectPos: Reflect = this.gameBoard.figureDestination(this.ball.position, pos);
        return reflectPos;
    }

    //落地时的回调函数
    private onBeginContact(contact: cc.PhysicsContact, self: any, other: any) {
        if (self.tag == 4) {
            other.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 0);
        } else {
            return ;
        }
    }

    /**
     * 初始化轨迹
     * @param posA 球位置
     * @param posB 反射点
     */
    private drawLine(posA: cc.Vec2, posB: Reflect) {
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
            return ;
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
        //cc.log("清理完成!");
    }

    /**
     * 发射小球
     * @param ball 需要发射的球
     * @param dir 方向反射类
     */
    private sendBall(ball: cc.Node, dir: Reflect) {
        let ballRB: cc.RigidBody = ball.getComponent(cc.RigidBody);
        let force: cc.Vec2 = this.gameBoard.getUnitVec(dir.position.sub(ball.position));
        ballRB.applyLinearImpulse(force.scale(cc.v2(this.theForce, this.theForce)), 
            ballRB.getLocalCenter(), true);
    }
}
